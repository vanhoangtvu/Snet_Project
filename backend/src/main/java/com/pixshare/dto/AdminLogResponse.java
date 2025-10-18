package com.pixshare.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminLogResponse {
    private Long id;
    private String adminEmail;
    private String adminName;
    private String action;
    private Long targetUserId;
    private String targetUserEmail;
    private String details;
    private LocalDateTime timestamp;
}
