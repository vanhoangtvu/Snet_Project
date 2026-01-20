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
public class MessageResponse {
    private Long id;
    private Long senderId;
    private String senderName;
    private Long receiverId;
    private String receiverName;
    private Long groupId;
    private String groupName;
    private String content;
    private String type;
    private Long fileId;
    private String fileName;
    private String status;
    private LocalDateTime sentAt;
    private LocalDateTime readAt;
}
