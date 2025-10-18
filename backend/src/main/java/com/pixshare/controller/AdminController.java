package com.pixshare.controller;

import com.pixshare.dto.AdminLogResponse;
import com.pixshare.dto.DashboardStats;
import com.pixshare.dto.FileResponse;
import com.pixshare.dto.UserResponse;
import com.pixshare.model.*;
import com.pixshare.repository.*;
import com.pixshare.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
@Tag(name = "Admin", description = "Admin dashboard and management APIs (Admin only)")
@SecurityRequirement(name = "bearerAuth")
public class AdminController {
    
    private final UserRepository userRepository;
    private final FileMetadataRepository fileMetadataRepository;
    private final MessageRepository messageRepository;
    private final AdminLogRepository adminLogRepository;
    private final UserService userService;
    private final PublicShareRepository publicShareRepository;
    private final FriendshipRepository friendshipRepository;
    private final ChatGroupRepository chatGroupRepository;
    private final PostRepository postRepository;
    
    // Dashboard Statistics
    @GetMapping("/dashboard/stats")
    @Operation(summary = "Get dashboard statistics", description = "Get comprehensive system statistics for admin dashboard")
    public ResponseEntity<DashboardStats> getDashboardStats() {
        long totalUsers = userRepository.count();
        long activeUsers = userRepository.findByStatus(UserStatus.ACTIVE).size();
        long onlineUsers = userRepository.findByOnlineTrue().size();
        
        // Count only non-deleted files (to match file management page)
        long totalFiles = fileMetadataRepository.countByDeletedFalse();
        long deletedFiles = fileMetadataRepository.countByDeletedTrue();
        
        long totalMessages = messageRepository.count();
        
        List<User> allUsers = userRepository.findAll();
        long totalStorageUsed = allUsers.stream()
                .mapToLong(User::getStorageUsed)
                .sum();
        long totalStorageQuota = allUsers.stream()
                .mapToLong(User::getStorageQuota)
                .sum();
        
        // Calculate total file size (excluding deleted files)
        Long totalFileSize = fileMetadataRepository.sumFileSizeByDeletedFalse();
        if (totalFileSize == null) totalFileSize = 0L;
        
        DashboardStats stats = DashboardStats.builder()
                .totalUsers(totalUsers)
                .activeUsers(activeUsers)
                .onlineUsers(onlineUsers)
                .totalFiles(totalFiles)
                .totalMessages(totalMessages)
                .totalStorageUsed(totalStorageUsed)
                .totalStorageQuota(totalStorageQuota)
                .build();
        
        return ResponseEntity.ok(stats);
    }
    
    // User Management
    @GetMapping("/users")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(
            userRepository.findAll().stream()
                .map(this::convertToUserResponse)
                .collect(Collectors.toList())
        );
    }
    
    @PostMapping("/users/{userId}/lock")
    public ResponseEntity<Void> lockUser(
            Authentication authentication,
            @PathVariable Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setStatus(UserStatus.LOCKED);
        userRepository.save(user);
        
        logAdminAction(authentication, "LOCK_USER", "Locked user: " + user.getEmail(), "User", userId);
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/users/{userId}/unlock")
    public ResponseEntity<Void> unlockUser(
            Authentication authentication,
            @PathVariable Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setStatus(UserStatus.ACTIVE);
        userRepository.save(user);
        
        logAdminAction(authentication, "UNLOCK_USER", "Unlocked user: " + user.getEmail(), "User", userId);
        return ResponseEntity.ok().build();
    }
    
    @PutMapping("/users/{userId}/quota")
    public ResponseEntity<Void> updateUserQuota(
            Authentication authentication,
            @PathVariable Long userId,
            @RequestParam Long quota) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setStorageQuota(quota);
        userRepository.save(user);
        
        logAdminAction(authentication, "UPDATE_QUOTA", 
                "Updated quota for user: " + user.getEmail() + " to " + quota, "User", userId);
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/users/{userId}/verify")
    public ResponseEntity<Void> verifyUser(
            Authentication authentication,
            @PathVariable Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setVerified(true);
        userRepository.save(user);
        
        logAdminAction(authentication, "VERIFY_USER", 
                "Verified user: " + user.getEmail(), "User", userId);
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/users/{userId}/unverify")
    public ResponseEntity<Void> unverifyUser(
            Authentication authentication,
            @PathVariable Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setVerified(false);
        userRepository.save(user);
        
        logAdminAction(authentication, "UNVERIFY_USER", 
                "Removed verification from user: " + user.getEmail(), "User", userId);
        return ResponseEntity.ok().build();
    }
    
    // File Management
    @GetMapping("/files")
    @Operation(summary = "Get all files", description = "Get all non-deleted files, optionally filtered by category")
    public ResponseEntity<List<FileResponse>> getAllFiles(
            @RequestParam(required = false) String category) {
        List<FileMetadata> files;
        
        // Only show non-deleted files (since we use hard delete now)
        if (category != null && !category.isEmpty()) {
            files = fileMetadataRepository.findByCategoryAndDeletedFalse(FileCategory.valueOf(category));
        } else {
            files = fileMetadataRepository.findByDeletedFalse();
        }
        
        return ResponseEntity.ok(
            files.stream()
                .map(this::convertToFileResponse)
                .collect(Collectors.toList())
        );
    }
    
    @DeleteMapping("/files/{fileId}")
    @Transactional
    public ResponseEntity<Void> deleteFile(
            Authentication authentication,
            @PathVariable Long fileId) {
        FileMetadata file = fileMetadataRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("File not found"));
        
        System.out.println("🗑️ ADMIN HARD DELETE: Deleting file: " + file.getFileName() + " (ID: " + fileId + ")");
        
        // Step 1: Remove file references from Posts (set file = null)
        System.out.println("📝 Removing file references from Posts...");
        postRepository.removeFileReference(fileId);
        
        // Step 2: Remove file references from Messages (set file = null)
        System.out.println("💬 Removing file references from Messages...");
        messageRepository.removeFileReference(fileId);
        
        // Step 3: Delete all public shares for this file
        System.out.println("🔗 Deleting all public shares for this file...");
        publicShareRepository.deleteByFileId(fileId);
        
        // Step 4: Update user storage BEFORE deleting file
        User user = file.getUser();
        user.setStorageUsed(user.getStorageUsed() - file.getFileSize());
        userRepository.save(user);
        System.out.println("💾 Updated user storage: " + user.getStorageUsed() + " bytes");
        
        // Step 5: Log action BEFORE deleting (so we can still reference file properties)
        logAdminAction(authentication, "DELETE_FILE", 
                "Permanently deleted file: " + file.getFileName(), "File", fileId);
        
        // Step 6: HARD DELETE - Remove file from database completely
        fileMetadataRepository.delete(file);
        System.out.println("✅ File permanently deleted from database!");
        
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/files/top-users")
    public ResponseEntity<List<Map<String, Object>>> getTopUsersByStorage() {
        List<Object[]> results = fileMetadataRepository.findTopUsersByStorage();
        
        List<Map<String, Object>> topUsers = results.stream()
                .limit(10)
                .map(result -> {
                    User user = (User) result[0];
                    Long totalSize = (Long) result[1];
                    
                    Map<String, Object> map = new HashMap<>();
                    map.put("userId", user.getId());
                    map.put("userName", user.getDisplayName());
                    map.put("email", user.getEmail());
                    map.put("totalSize", totalSize);
                    return map;
                })
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(topUsers);
    }
    
    @GetMapping("/files/stats-by-category")
    public ResponseEntity<Map<String, Long>> getFileStatsByCategory() {
        List<Object[]> results = fileMetadataRepository.countByCategory();
        
        Map<String, Long> stats = results.stream()
                .collect(Collectors.toMap(
                        result -> ((FileCategory) result[0]).name(),
                        result -> (Long) result[1]
                ));
        
        return ResponseEntity.ok(stats);
    }
    
    // User Management
    @DeleteMapping("/users/{userId}")
    @Transactional
    public ResponseEntity<Void> deleteUser(
            Authentication authentication,
            @PathVariable Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Don't allow deleting other admins
        if (user.getRole() == UserRole.ADMIN) {
            throw new RuntimeException("Cannot delete admin users");
        }
        
        try {
            // Delete in correct order to avoid foreign key constraint violations
            
            // 1. Delete all messages involving this user (both as sender and receiver)
            messageRepository.deleteBySenderId(userId);
            messageRepository.deleteByReceiverId(userId);
            
            // 2. Delete all public shares of this user
            publicShareRepository.deleteByUser(user);
            
            // 3. Remove user from all groups they're member of
            List<ChatGroup> memberGroups = chatGroupRepository.findByMember(user);
            for (ChatGroup group : memberGroups) {
                group.getMembers().remove(user);
                chatGroupRepository.save(group);
            }
            
            // 4. Delete groups created by this user (and their messages)
            List<ChatGroup> ownedGroups = chatGroupRepository.findByCreator(user);
            for (ChatGroup group : ownedGroups) {
                // First delete all messages in the group
                messageRepository.deleteByGroupId(group.getId());
                // Then delete the group itself
                chatGroupRepository.delete(group);
            }
            
            // 5. Delete all friendships involving this user
            friendshipRepository.deleteByUser(user);
            friendshipRepository.deleteByFriend(user);
            
            // 6. Delete all files of this user
            List<FileMetadata> userFiles = fileMetadataRepository.findByUser(user);
            fileMetadataRepository.deleteAll(userFiles);
            
            // 7. Finally delete the user
            userRepository.delete(user);
            
            logAdminAction(authentication, "DELETE_USER", 
                    "Permanently deleted user and all associated data: " + user.getEmail(), "User", userId);
            
            return ResponseEntity.ok().build();
            
        } catch (Exception e) {
            // Log the full error for debugging
            System.err.println("Error deleting user: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to delete user completely: " + e.getMessage());
        }
    }
    
    // Message Management
    @GetMapping("/messages/search")
    public ResponseEntity<List<Message>> searchMessages(
            @RequestParam(required = false) String keyword) {
        if (keyword != null && !keyword.isEmpty()) {
            return ResponseEntity.ok(messageRepository.searchByKeyword(keyword));
        }
        return ResponseEntity.ok(messageRepository.findAll(PageRequest.of(0, 100)).getContent());
    }
    
    @DeleteMapping("/messages/{messageId}")
    public ResponseEntity<Void> deleteMessage(
            Authentication authentication,
            @PathVariable Long messageId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));
        
        message.setDeleted(true);
        messageRepository.save(message);
        
        logAdminAction(authentication, "DELETE_MESSAGE", 
                "Deleted message ID: " + messageId, "Message", messageId);
        return ResponseEntity.ok().build();
    }
    
    // Admin Logs
    @GetMapping("/logs")
    public ResponseEntity<List<AdminLogResponse>> getAdminLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        List<AdminLog> logs = adminLogRepository.findAll(PageRequest.of(page, size)).getContent();
        List<AdminLogResponse> response = logs.stream()
            .map(log -> AdminLogResponse.builder()
                .id(log.getId())
                .adminEmail(log.getAdmin().getEmail())
                .adminName(log.getAdmin().getDisplayName())
                .action(log.getAction())
                .targetUserId(log.getTargetId())
                .targetUserEmail(log.getTargetType())
                .details(log.getDetails())
                .timestamp(log.getCreatedAt())
                .build())
            .toList();
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/logs/search")
    public ResponseEntity<List<AdminLog>> searchAdminLogs(
            @RequestParam String action,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        return ResponseEntity.ok(
            adminLogRepository.findByActionContainingIgnoreCaseOrderByCreatedAtDesc(
                    action, PageRequest.of(page, size))
        );
    }
    
    // Helper methods
    private void logAdminAction(Authentication authentication, String action, 
                                String details, String targetType, Long targetId) {
        User admin = userService.getCurrentUser(authentication.getName());
        
        AdminLog log = AdminLog.builder()
                .admin(admin)
                .action(action)
                .details(details)
                .targetType(targetType)
                .targetId(targetId)
                .build();
        
        adminLogRepository.save(log);
    }
    
    private UserResponse convertToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .displayName(user.getDisplayName())
                .role(user.getRole().name())
                .status(user.getStatus())
                .storageQuota(user.getStorageQuota())
                .storageUsed(user.getStorageUsed())
                .verified(user.isVerified())  // ← THIẾU FIELD NÀY!
                .online(user.isOnline())
                .lastSeen(user.getLastSeen())
                .createdAt(user.getCreatedAt())
                .build();
    }
    
    private FileResponse convertToFileResponse(FileMetadata file) {
        return FileResponse.builder()
                .id(file.getId())
                .fileName(file.getFileName())
                .fileType(file.getFileType())
                .fileSize(file.getFileSize())
                .category(file.getCategory().name())
                .description(file.getDescription())
                .uploadedAt(file.getUploadedAt())
                .userId(file.getUser().getId())
                .uploaderName(file.getUser().getDisplayName())
                .deleted(file.isDeleted())
                .build();
    }
}
