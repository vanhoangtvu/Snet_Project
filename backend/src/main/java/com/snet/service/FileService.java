package com.snet.service;

import com.snet.dto.FileResponse;
import com.snet.model.FileCategory;
import com.snet.model.FileMetadata;
import com.snet.model.User;
import com.snet.model.UserRole;
import com.snet.repository.FileMetadataRepository;
import com.snet.repository.MessageRepository;
import com.snet.repository.PostRepository;
import com.snet.repository.PublicShareRepository;
import com.snet.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import javax.imageio.ImageReader;
import javax.imageio.metadata.IIOMetadata;
import javax.imageio.stream.ImageInputStream;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import java.awt.*;
import java.awt.geom.AffineTransform;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Iterator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FileService {
    
    private final FileMetadataRepository fileMetadataRepository;
    private final UserRepository userRepository;
    private final PublicShareRepository publicShareRepository;
    private final PostRepository postRepository;
    private final MessageRepository messageRepository;
    
    @Value("${file.max-file-size}")
    private long maxFileSize;
    
    @Transactional
    public FileResponse uploadFile(String userEmail, MultipartFile file, String description) throws IOException {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (file.getSize() > maxFileSize) {
            throw new RuntimeException("File size exceeds maximum limit");
        }
        
        long newStorageUsed = user.getStorageUsed() + file.getSize();
        if (newStorageUsed > user.getStorageQuota()) {
            throw new RuntimeException("Storage quota exceeded");
        }
        
        // Detect MIME type from filename if unknown
        String contentType = file.getContentType();
        if (contentType == null || contentType.equals("application/octet-stream")) {
            String filename = file.getOriginalFilename();
            if (filename != null) {
                String lower = filename.toLowerCase();
                if (lower.endsWith(".mp4") || lower.endsWith(".avi") || lower.endsWith(".mov") || 
                    lower.endsWith(".mkv") || lower.endsWith(".webm")) {
                    contentType = "video/mp4";
                } else if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) {
                    contentType = "image/jpeg";
                } else if (lower.endsWith(".png")) {
                    contentType = "image/png";
                } else if (lower.endsWith(".gif")) {
                    contentType = "image/gif";
                }
            }
        }
        
        FileCategory category = determineFileCategory(contentType);
        
        FileMetadata fileMetadata = FileMetadata.builder()
                .user(user)
                .fileName(file.getOriginalFilename())
                .fileType(contentType)
                .fileSize(file.getSize())
                .fileData(category == FileCategory.IMAGE ? rotateImageByExif(file.getBytes()) : file.getBytes())
                .category(category)
                .description(description)
                .build();
        
        // Generate thumbnail for images
        if (category == FileCategory.IMAGE) {
            fileMetadata.setThumbnail(generateThumbnail(fileMetadata.getFileData()));
        }
        
        fileMetadata = fileMetadataRepository.save(fileMetadata);
        
        // Update user storage
        user.setStorageUsed(newStorageUsed);
        userRepository.save(user);
        
        return convertToResponse(fileMetadata);
    }
    
    public FileResponse getFileInfo(Long fileId) {
        FileMetadata file = fileMetadataRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("File not found"));
        return convertToResponse(file);
    }
    
    public byte[] getFileData(Long fileId) {
        FileMetadata file = fileMetadataRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("File not found"));
        return file.getFileData();
    }
    
    public byte[] getFileData(Long fileId, Authentication authentication) {
        System.out.println("🔍 Getting file data for fileId: " + fileId);
        FileMetadata file = fileMetadataRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("File not found"));
        
        System.out.println("📁 File found: " + file.getFileName() + ", deleted: " + file.isDeleted());
        
        // Check if file is deleted
        if (file.isDeleted()) {
            System.out.println("❌ File is deleted!");
            throw new RuntimeException("File has been deleted");
        }
        
        // Check if user is admin or file owner
        if (authentication != null) {
            String userEmail = authentication.getName();
            System.out.println("👤 Current user email: " + userEmail);
            
            User currentUser = userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            System.out.println("👤 Current user role: " + currentUser.getRole());
            System.out.println("👤 File owner ID: " + file.getUser().getId() + ", Current user ID: " + currentUser.getId());
            
            // Allow if admin or file owner
            if (currentUser.getRole() == UserRole.ADMIN || 
                file.getUser().getId().equals(currentUser.getId())) {
                System.out.println("✅ Access granted! Returning file data (size: " + file.getFileData().length + " bytes)");
                return file.getFileData();
            }
            
            System.out.println("❌ Access denied - not admin and not file owner");
        } else {
            System.out.println("❌ No authentication provided");
        }
        
        throw new RuntimeException("Unauthorized to access this file");
    }
    
    public byte[] getPublicFileData(Long fileId) {
        System.out.println("🌍 Getting public file data for fileId: " + fileId);
        FileMetadata file = fileMetadataRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("File not found"));
        
        System.out.println("📁 File found: " + file.getFileName());
        
        // For public access, we allow files that are used in posts
        System.out.println("✅ Returning public file data, size: " + file.getFileData().length + " bytes");
        return file.getFileData();
    }

    public byte[] getThumbnail(Long fileId) {
        FileMetadata file = fileMetadataRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("File not found"));
        return file.getThumbnail();
    }
    
    public List<FileResponse> getUserFiles(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return fileMetadataRepository.findByUserAndDeletedFalseOrderByUploadedAtDesc(user)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public void deleteFile(Long fileId, String userEmail) {
        FileMetadata file = fileMetadataRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("File not found"));
        
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (!file.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized to delete this file");
        }
        
        System.out.println("🗑️ HARD DELETE: Deleting file: " + file.getFileName() + " (ID: " + fileId + ")");
        
        // Step 1: Remove file references from Posts (set file = null)
        System.out.println("📝 Removing file references from Posts...");
        postRepository.removeFileReference(fileId);
        
        // Step 2: Remove file references from Messages (set file = null)
        System.out.println("💬 Removing file references from Messages...");
        messageRepository.removeFileReference(fileId);
        
        // Step 3: Delete all public shares for this file
        System.out.println("🔗 Deleting all public shares for this file...");
        publicShareRepository.deleteByFileId(fileId);
        
        // Step 4: Update user storage BEFORE deleting file
        user.setStorageUsed(user.getStorageUsed() - file.getFileSize());
        userRepository.save(user);
        System.out.println("💾 Updated user storage: " + user.getStorageUsed() + " bytes");
        
        // Step 5: HARD DELETE - Remove file from database completely
        fileMetadataRepository.delete(file);
        System.out.println("✅ File permanently deleted from database!");
    }
    
    private FileCategory determineFileCategory(String contentType) {
        if (contentType == null) return FileCategory.OTHER;
        
        if (contentType.startsWith("image/")) {
            return FileCategory.IMAGE;
        } else if (contentType.startsWith("video/")) {
            return FileCategory.VIDEO;
        } else if (contentType.startsWith("audio/")) {
            return FileCategory.AUDIO;
        } else if (contentType.contains("pdf") || contentType.contains("document") || 
                   contentType.contains("word") || contentType.contains("excel") || 
                   contentType.contains("powerpoint") || contentType.contains("text")) {
            return FileCategory.DOCUMENT;
        } else {
            return FileCategory.OTHER;
        }
    }
    
    private byte[] rotateImageByExif(byte[] imageData) throws IOException {
        try {
            ByteArrayInputStream bais = new ByteArrayInputStream(imageData);
            BufferedImage image = ImageIO.read(bais);
            
            if (image == null) return imageData;
            
            // Đọc EXIF orientation
            com.drew.metadata.Metadata metadata = com.drew.imaging.ImageMetadataReader.readMetadata(new ByteArrayInputStream(imageData));
            com.drew.metadata.exif.ExifIFD0Directory exifDir = metadata.getFirstDirectoryOfType(com.drew.metadata.exif.ExifIFD0Directory.class);
            
            if (exifDir == null || !exifDir.containsTag(com.drew.metadata.exif.ExifIFD0Directory.TAG_ORIENTATION)) {
                System.out.println("✅ No EXIF orientation found");
                return imageData;
            }
            
            int orientation = exifDir.getInt(com.drew.metadata.exif.ExifIFD0Directory.TAG_ORIENTATION);
            System.out.println("🔄 EXIF Orientation: " + orientation);
            BufferedImage rotatedImage = image;
            
            switch (orientation) {
                case 3: // 180 độ
                    System.out.println("🔄 Rotating 180°");
                    rotatedImage = rotateImage(image, 180);
                    break;
                case 6: // 90 độ phải
                    System.out.println("🔄 Rotating 90° right");
                    rotatedImage = rotateImage(image, 90);
                    break;
                case 8: // 90 độ trái
                    System.out.println("🔄 Rotating 90° left");
                    rotatedImage = rotateImage(image, 270);
                    break;
            }
            
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ImageIO.write(rotatedImage, "jpg", baos);
            System.out.println("✅ Image rotated and saved");
            return baos.toByteArray();
        } catch (Exception e) {
            System.out.println("❌ EXIF rotation error: " + e.getMessage());
            return imageData;
        }
    }
    
    private BufferedImage rotateImage(BufferedImage image, int angle) {
        int width = image.getWidth();
        int height = image.getHeight();
        BufferedImage rotated;
        
        if (angle == 90 || angle == 270) {
            rotated = new BufferedImage(height, width, BufferedImage.TYPE_INT_RGB);
        } else {
            rotated = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
        }
        
        Graphics2D g2d = rotated.createGraphics();
        
        if (angle == 90) {
            g2d.translate(height, 0);
            g2d.rotate(Math.toRadians(90));
        } else if (angle == 180) {
            g2d.translate(width, height);
            g2d.rotate(Math.toRadians(180));
        } else if (angle == 270) {
            g2d.translate(0, width);
            g2d.rotate(Math.toRadians(270));
        }
        
        g2d.drawImage(image, 0, 0, null);
        g2d.dispose();
        
        return rotated;
    }
    
    private byte[] generateThumbnail(byte[] imageData) throws IOException {
        ByteArrayInputStream bais = new ByteArrayInputStream(imageData);
        BufferedImage originalImage = ImageIO.read(bais);
        
        if (originalImage == null) {
            return null;
        }
        
        int thumbnailWidth = 400;
        int thumbnailHeight = (int) (originalImage.getHeight() * ((double) thumbnailWidth / originalImage.getWidth()));
        
        BufferedImage thumbnail = new BufferedImage(thumbnailWidth, thumbnailHeight, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = thumbnail.createGraphics();
        g.drawImage(originalImage.getScaledInstance(thumbnailWidth, thumbnailHeight, Image.SCALE_SMOOTH), 0, 0, null);
        g.dispose();
        
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ImageIO.write(thumbnail, "jpg", baos);
        return baos.toByteArray();
    }
    
    private FileResponse convertToResponse(FileMetadata file) {
        return FileResponse.builder()
                .id(file.getId())
                .fileName(file.getFileName())
                .fileType(file.getFileType())
                .fileSize(file.getFileSize())
                .category(file.getCategory().name())
                .description(file.getDescription())
                .uploadedAt(file.getUploadedAt())
                .userId(file.getUser().getId())
                .uploaderName(file.getUser().getDisplayName())
                .build();
    }
    
    public byte[] resizeImage(byte[] imageBytes, String size) throws IOException {
        int targetSize;
        switch (size) {
            case "thumbnail":
                targetSize = 150;  // 150px for thumbnails
                break;
            case "preview":
                targetSize = 400;  // 400px for preview in chat
                break;
            case "medium":
                targetSize = 800;  // 800px for medium
                break;
            default:
                return imageBytes;  // Return original for unknown sizes
        }
        
        ByteArrayInputStream bais = new ByteArrayInputStream(imageBytes);
        BufferedImage originalImage = ImageIO.read(bais);
        
        if (originalImage == null) {
            return imageBytes; // Return original if can't read
        }
        
        // Handle EXIF orientation (auto-rotate)
        originalImage = autoRotateImage(imageBytes, originalImage);
        
        // Calculate aspect ratio
        int originalWidth = originalImage.getWidth();
        int originalHeight = originalImage.getHeight();
        double aspectRatio = (double) originalWidth / originalHeight;
        
        int newWidth, newHeight;
        
        // Adjust dimensions to maintain aspect ratio
        if (aspectRatio > 1) {
            // Landscape
            newWidth = targetSize;
            newHeight = (int) (targetSize / aspectRatio);
        } else {
            // Portrait or Square
            newHeight = targetSize;
            newWidth = (int) (targetSize * aspectRatio);
        }
        
        // Create resized image
        BufferedImage resizedImage = new BufferedImage(newWidth, newHeight, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = resizedImage.createGraphics();
        
        // Enable high-quality rendering
        g.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
        g.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
        g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        
        g.drawImage(originalImage, 0, 0, newWidth, newHeight, null);
        g.dispose();
        
        // Convert to byte array with compression
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ImageIO.write(resizedImage, "jpg", baos);
        
        return baos.toByteArray();
    }
    
    private BufferedImage autoRotateImage(byte[] imageBytes, BufferedImage image) {
        try {
            // Get EXIF orientation
            int orientation = getExifOrientation(imageBytes);
            
            if (orientation == 1) {
                return image; // No rotation needed
            }
            
            // Apply rotation based on EXIF orientation
            AffineTransform transform = new AffineTransform();
            
            switch (orientation) {
                case 3: // 180 degrees
                    transform.translate(image.getWidth(), image.getHeight());
                    transform.rotate(Math.PI);
                    break;
                case 6: // 90 degrees CW (Rotate 270 CCW)
                    transform.translate(image.getHeight(), 0);
                    transform.rotate(Math.PI / 2);
                    break;
                case 8: // 90 degrees CCW (Rotate 90 CW)
                    transform.translate(0, image.getWidth());
                    transform.rotate(-Math.PI / 2);
                    break;
                default:
                    return image; // Unknown orientation, return original
            }
            
            // Create new image with swapped dimensions for 90/270 degree rotations
            int newWidth = (orientation == 6 || orientation == 8) ? image.getHeight() : image.getWidth();
            int newHeight = (orientation == 6 || orientation == 8) ? image.getWidth() : image.getHeight();
            
            BufferedImage rotatedImage = new BufferedImage(newWidth, newHeight, image.getType());
            Graphics2D g = rotatedImage.createGraphics();
            g.setTransform(transform);
            g.drawImage(image, 0, 0, null);
            g.dispose();
            
            return rotatedImage;
        } catch (Exception e) {
            System.err.println("⚠️ Failed to auto-rotate image: " + e.getMessage());
            return image; // Return original on error
        }
    }
    
    private int getExifOrientation(byte[] imageBytes) {
        try {
            ByteArrayInputStream bais = new ByteArrayInputStream(imageBytes);
            ImageInputStream iis = ImageIO.createImageInputStream(bais);
            Iterator<ImageReader> readers = ImageIO.getImageReaders(iis);
            
            if (readers.hasNext()) {
                ImageReader reader = readers.next();
                reader.setInput(iis);
                
                IIOMetadata metadata = reader.getImageMetadata(0);
                if (metadata != null) {
                    Node root = metadata.getAsTree(metadata.getNativeMetadataFormatName());
                    return findOrientation(root);
                }
                
                reader.dispose();
            }
            
            iis.close();
        } catch (Exception e) {
            System.err.println("⚠️ Failed to read EXIF orientation: " + e.getMessage());
        }
        
        return 1; // Default: no rotation
    }
    
    private int findOrientation(Node node) {
        if (node.getNodeName().equals("app1")) {
            NodeList children = node.getChildNodes();
            for (int i = 0; i < children.getLength(); i++) {
                Node child = children.item(i);
                if (child.getNodeName().equals("app1Marker")) {
                    NamedNodeMap attributes = child.getAttributes();
                    Node orientationNode = attributes.getNamedItem("Orientation");
                    if (orientationNode != null) {
                        return Integer.parseInt(orientationNode.getNodeValue());
                    }
                }
            }
        }
        
        // Search recursively
        NodeList children = node.getChildNodes();
        for (int i = 0; i < children.getLength(); i++) {
            int orientation = findOrientation(children.item(i));
            if (orientation != 1) {
                return orientation;
            }
        }
        
        return 1; // Default
    }
}
