package com.pixshare.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class FriendRequestResponse {
    private Long id;
    private UserResponse sender;  // Người gửi lời mời
    private UserResponse receiver; // Người nhận lời mời
    private String status;
    private LocalDateTime createdAt;
}
