package com.snet.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GroupResponse {
    private Long id;
    private String name;
    private String description;
    private String avatarUrl;
    private Long creatorId;
    private String creatorName;
    private List<UserResponse> members;
    private List<UserResponse> admins;
    private int memberCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
