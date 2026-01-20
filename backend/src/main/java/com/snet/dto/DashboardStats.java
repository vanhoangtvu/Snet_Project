package com.snet.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardStats {
    private Long totalUsers;
    private Long activeUsers;
    private Long onlineUsers;
    private Long totalFiles;
    private Long totalMessages;
    private Long totalStorageUsed;
    private Long totalStorageQuota;
}
