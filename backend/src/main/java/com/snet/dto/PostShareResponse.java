package com.snet.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PostShareResponse {
    private Long id;
    private Long postId;
    private String shareToken;
    private String shareUrl;
    private LocalDateTime expiresAt;
    private Integer maxAccessCount;
    private Integer accessCount;
    private boolean active;
    private LocalDateTime createdAt;
}
