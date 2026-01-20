package com.snet.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FileResponse {
    private Long id;
    private String fileName;
    private String fileType;
    private Long fileSize;
    private String category;
    private String description;
    private LocalDateTime uploadedAt;
    private Long userId;
    private String uploaderName;
    private boolean deleted;
}
