package com.pixshare.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.MultiFormatWriter;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.pixshare.dto.PublicShareResponse;
import com.pixshare.model.FileMetadata;
import com.pixshare.model.PublicShare;
import com.pixshare.repository.FileMetadataRepository;
import com.pixshare.repository.PublicShareRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PublicShareService {
    
    private final PublicShareRepository publicShareRepository;
    private final FileMetadataRepository fileMetadataRepository;
    
    @Value("${server.url:http://localhost:8080}")
    private String serverUrl;
    
    @Transactional
    public PublicShareResponse createPublicShare(Long fileId, LocalDateTime expiresAt, Integer maxAccessCount) {
        FileMetadata file = fileMetadataRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("File not found"));
        
        String shareToken = UUID.randomUUID().toString();
        String shareUrl = serverUrl + "/api/public/share/" + shareToken;
        
        PublicShare publicShare = PublicShare.builder()
                .file(file)
                .shareToken(shareToken)
                .expiresAt(expiresAt)
                .maxAccessCount(maxAccessCount)
                .accessCount(0)
                .active(true)
                .build();
        
        try {
            byte[] qrCode = generateQRCode(shareUrl);
            publicShare.setQrCode(qrCode);
        } catch (Exception e) {
            // QR code generation failed, continue without it
        }
        
        publicShare = publicShareRepository.save(publicShare);
        
        return convertToResponse(publicShare, shareUrl);
    }
    
    @Transactional
    public byte[] accessPublicShare(String shareToken) {
        PublicShare publicShare = publicShareRepository.findByShareToken(shareToken)
                .orElseThrow(() -> new RuntimeException("Share not found"));
        
        if (!publicShare.isActive()) {
            throw new RuntimeException("Share is no longer active");
        }
        
        if (publicShare.getExpiresAt() != null && publicShare.getExpiresAt().isBefore(LocalDateTime.now())) {
            publicShare.setActive(false);
            publicShareRepository.save(publicShare);
            throw new RuntimeException("Share has expired");
        }
        
        if (publicShare.getMaxAccessCount() != null && 
            publicShare.getAccessCount() >= publicShare.getMaxAccessCount()) {
            publicShare.setActive(false);
            publicShareRepository.save(publicShare);
            throw new RuntimeException("Share access limit reached");
        }
        
        publicShare.setAccessCount(publicShare.getAccessCount() + 1);
        publicShareRepository.save(publicShare);
        
        return publicShare.getFile().getFileData();
    }
    
    public PublicShareResponse getShareInfo(String shareToken) {
        PublicShare publicShare = publicShareRepository.findByShareToken(shareToken)
                .orElseThrow(() -> new RuntimeException("Share not found"));
        
        String shareUrl = serverUrl + "/api/public/share/" + shareToken;
        return convertToResponse(publicShare, shareUrl);
    }
    
    public byte[] getQRCode(String shareToken) {
        PublicShare publicShare = publicShareRepository.findByShareToken(shareToken)
                .orElseThrow(() -> new RuntimeException("Share not found"));
        
        return publicShare.getQrCode();
    }
    
    @Transactional
    public void deactivateShare(Long shareId) {
        PublicShare publicShare = publicShareRepository.findById(shareId)
                .orElseThrow(() -> new RuntimeException("Share not found"));
        
        publicShare.setActive(false);
        publicShareRepository.save(publicShare);
    }
    
    private byte[] generateQRCode(String text) throws Exception {
        BitMatrix bitMatrix = new MultiFormatWriter()
                .encode(text, BarcodeFormat.QR_CODE, 300, 300);
        
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        MatrixToImageWriter.writeToStream(bitMatrix, "PNG", baos);
        return baos.toByteArray();
    }
    
    private PublicShareResponse convertToResponse(PublicShare publicShare, String shareUrl) {
        FileMetadata file = publicShare.getFile();
        
        PublicShareResponse.FileInfo fileInfo = PublicShareResponse.FileInfo.builder()
                .id(file.getId())
                .fileName(file.getFileName())
                .fileType(file.getFileType())
                .fileSize(file.getFileSize())
                .category(file.getCategory().name())
                .uploaderName(file.getUser().getDisplayName())
                .uploadedAt(file.getUploadedAt())
                .build();
        
        return PublicShareResponse.builder()
                .id(publicShare.getId())
                .file(fileInfo)
                .shareToken(publicShare.getShareToken())
                .shareUrl(shareUrl)
                .expiresAt(publicShare.getExpiresAt())
                .maxAccessCount(publicShare.getMaxAccessCount())
                .accessCount(publicShare.getAccessCount())
                .active(publicShare.isActive())
                .createdAt(publicShare.getCreatedAt())
                .build();
    }
}
