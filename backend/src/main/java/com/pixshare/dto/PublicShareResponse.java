package com.pixshare.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PublicShareResponse {
    private Long id;
    private String shareToken;
    private String shareUrl;
    private LocalDateTime expiresAt;
    private Integer maxAccessCount;
    private Integer accessCount;
    private boolean active;
    private LocalDateTime createdAt;
    private FileInfo file;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class FileInfo {
        private Long id;
        private String fileName;
        private String fileType;
        private Long fileSize;
        private String category;
        private String uploaderName;
        private LocalDateTime uploadedAt;
    }
    
    // Backward compatibility getters
    public String getFileName() {
        return file != null ? file.fileName : null;
    }
    
    public String getFileType() {
        return file != null ? file.fileType : null;
    }
    
    public Long getFileSize() {
        return file != null ? file.fileSize : null;
    }
}
