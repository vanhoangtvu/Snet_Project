package com.snet.controller;

import com.snet.dto.FileResponse;
import com.snet.model.FileMetadata;
import com.snet.repository.FileMetadataRepository;
import com.snet.service.FileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
@Tag(name = "Files", description = "File upload, download and management APIs")
@SecurityRequirement(name = "bearerAuth")
public class FileController {
    
    private final FileService fileService;
    private final FileMetadataRepository fileMetadataRepository;
    
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload file", description = "Upload image, video or document file")
    public ResponseEntity<FileResponse> uploadFile(
            Authentication authentication,
            @RequestParam("file") MultipartFile file,
            @RequestParam(required = false) String description) throws IOException {
        String userEmail = authentication.getName();
        return ResponseEntity.ok(fileService.uploadFile(userEmail, file, description));
    }
    
    @GetMapping("/{fileId}")
    public ResponseEntity<FileResponse> getFileInfo(@PathVariable Long fileId) {
        return ResponseEntity.ok(fileService.getFileInfo(fileId));
    }
    
    @GetMapping("/{fileId}/download")
    public ResponseEntity<Resource> downloadFile(
            @PathVariable Long fileId,
            @RequestParam(required = false) String token,
            Authentication authentication) {
        FileResponse fileInfo = fileService.getFileInfo(fileId);
        byte[] fileData = fileService.getFileData(fileId, authentication);
        
        // Use larger buffer for better download speed (8MB buffer)
        int bufferSize = 8 * 1024 * 1024; // 8MB
        InputStreamResource resource = new InputStreamResource(
            new ByteArrayInputStream(fileData), 
            "File download"
        );
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileInfo.getFileName() + "\"")
                .contentType(MediaType.parseMediaType(fileInfo.getFileType()))
                .contentLength(fileData.length)
                .header(HttpHeaders.CACHE_CONTROL, "no-transform, max-age=3600")
                .header("X-Content-Type-Options", "nosniff")
                .body(resource);
    }
    
    @GetMapping("/{fileId}/preview")
    public ResponseEntity<Resource> previewFile(
            @PathVariable Long fileId,
            @RequestParam(required = false) String token,
            @RequestParam(defaultValue = "full") String size,
            @RequestHeader(value = HttpHeaders.RANGE, required = false) String rangeHeader,
            Authentication authentication) {
        try {
            System.out.println("🎬 Preview request for file ID: " + fileId + " with size: " + size);
            System.out.println("👤 User: " + (authentication != null ? authentication.getName() : "Anonymous"));
            System.out.println("📊 Range header: " + rangeHeader);
            
            FileResponse fileInfo = fileService.getFileInfo(fileId);
            System.out.println("📄 File info: " + fileInfo.getFileName() + " (" + fileInfo.getFileType() + ")");
            
            byte[] fileData = fileService.getFileData(fileId, authentication);
            System.out.println("✅ File data retrieved, size: " + fileData.length + " bytes");
            
            // Resize images if not full size
            if (!size.equals("full") && fileInfo.getFileType().startsWith("image/")) {
                try {
                    fileData = fileService.resizeImage(fileData, size);
                    System.out.println("✅ Image resized to " + size + ", new size: " + fileData.length + " bytes");
                } catch (Exception e) {
                    System.err.println("⚠️ Failed to resize image, using original: " + e.getMessage());
                }
            }
            
            // Handle Range requests (Safari iOS requires this for video)
            if (rangeHeader != null && rangeHeader.startsWith("bytes=")) {
                return handleRangeRequest(rangeHeader, fileData, fileInfo);
            }
            
            // Normal full response
            InputStreamResource resource = new InputStreamResource(new ByteArrayInputStream(fileData));
            
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(fileInfo.getFileType()))
                    .contentLength(fileData.length)
                    .header(HttpHeaders.ACCEPT_RANGES, "bytes")
                    .header(HttpHeaders.CACHE_CONTROL, "public, max-age=3600")
                    .body(resource);
        } catch (Exception e) {
            System.err.println("❌ Error in preview: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
    
    private ResponseEntity<Resource> handleRangeRequest(String rangeHeader, byte[] fileData, FileResponse fileInfo) {
        try {
            // Parse range header: bytes=start-end
            String range = rangeHeader.replace("bytes=", "");
            String[] parts = range.split("-");
            
            long fileLength = fileData.length;
            long start = Long.parseLong(parts[0]);
            long end = parts.length > 1 && !parts[1].isEmpty() 
                ? Long.parseLong(parts[1]) 
                : fileLength - 1;
            
            // Validate range
            if (start > end || start < 0 || end >= fileLength) {
                return ResponseEntity.status(HttpStatus.REQUESTED_RANGE_NOT_SATISFIABLE)
                    .header(HttpHeaders.CONTENT_RANGE, "bytes */" + fileLength)
                    .build();
            }
            
            int rangeLength = (int) (end - start + 1);
            byte[] rangeData = new byte[rangeLength];
            System.arraycopy(fileData, (int) start, rangeData, 0, rangeLength);
            
            InputStreamResource resource = new InputStreamResource(new ByteArrayInputStream(rangeData));
            
            String contentRange = String.format("bytes %d-%d/%d", start, end, fileLength);
            System.out.println("✅ Sending range: " + contentRange);
            
            return ResponseEntity.status(HttpStatus.PARTIAL_CONTENT)
                    .contentType(MediaType.parseMediaType(fileInfo.getFileType()))
                    .contentLength(rangeLength)
                    .header(HttpHeaders.ACCEPT_RANGES, "bytes")
                    .header(HttpHeaders.CONTENT_RANGE, contentRange)
                    .header(HttpHeaders.CACHE_CONTROL, "max-age=3600")
                    .body(resource);
        } catch (Exception e) {
            System.err.println("❌ Error handling range request: " + e.getMessage());
            throw new RuntimeException("Failed to handle range request", e);
        }
    }
    
    @GetMapping("/{fileId}/thumbnail")
    public ResponseEntity<byte[]> getThumbnail(@PathVariable Long fileId) {
        byte[] thumbnail = fileService.getThumbnail(fileId);
        if (thumbnail == null) {
            return ResponseEntity.notFound().build();
        }
        
        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_JPEG)
                .body(thumbnail);
    }
    
    @GetMapping("/{fileId}/public-preview")
    public ResponseEntity<Resource> publicPreviewFile(
            @PathVariable Long fileId,
            @RequestHeader(value = HttpHeaders.RANGE, required = false) String rangeHeader) {
        try {
            System.out.println("🌍 Public preview request for file ID: " + fileId);
            
            // Directly get file from repository
            FileMetadata file = fileMetadataRepository.findById(fileId)
                    .orElseThrow(() -> new RuntimeException("File not found"));
            
            System.out.println("📄 File info: " + file.getFileName() + " (" + file.getFileType() + ")");
            
            byte[] fileData = file.getFileData();
            System.out.println("✅ Public file data retrieved, size: " + fileData.length + " bytes");
            
            // Handle Range requests (Safari iOS requires this for video)
            if (rangeHeader != null && rangeHeader.startsWith("bytes=")) {
                FileResponse fileInfo = FileResponse.builder()
                    .id(file.getId())
                    .fileName(file.getFileName())
                    .fileType(file.getFileType())
                    .fileSize(file.getFileSize())
                    .build();
                return handleRangeRequest(rangeHeader, fileData, fileInfo);
            }
            
            // Normal full response
            InputStreamResource resource = new InputStreamResource(new ByteArrayInputStream(fileData));
            
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(file.getFileType()))
                    .contentLength(fileData.length)
                    .header(HttpHeaders.ACCEPT_RANGES, "bytes")
                    .header(HttpHeaders.CACHE_CONTROL, "max-age=3600")
                    .body(resource);
        } catch (Exception e) {
            System.err.println("❌ Error in public preview: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/my-files")
    public ResponseEntity<List<FileResponse>> getMyFiles(Authentication authentication) {
        String userEmail = authentication.getName();
        return ResponseEntity.ok(fileService.getUserFiles(userEmail));
    }
    
    @DeleteMapping("/{fileId}")
    public ResponseEntity<Void> deleteFile(
            Authentication authentication,
            @PathVariable Long fileId) {
        String userEmail = authentication.getName();
        fileService.deleteFile(fileId, userEmail);
        return ResponseEntity.ok().build();
    }
}
