package com.snet.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class NotificationResponse {
    private Long id;
    private String type;
    private String content;
    private Long actorId;
    private String actorName;
    private String actorAvatar;
    private Long postId;
    private Long commentId;
    private Boolean isRead;
    private LocalDateTime createdAt;
}
