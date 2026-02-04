package com.snet.service;

import com.snet.dto.FriendRequestResponse;
import com.snet.dto.UserResponse;
import com.snet.model.Friendship;
import com.snet.model.FriendshipStatus;
import com.snet.model.User;
import com.snet.repository.FriendshipRepository;
import com.snet.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FriendshipService {
    
    private final FriendshipRepository friendshipRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    
    @Transactional
    public void sendFriendRequest(Long userId, Long friendId) {
        if (userId.equals(friendId)) {
            throw new RuntimeException("Không thể gửi lời mời kết bạn cho chính mình");
        }
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
        User friend = userRepository.findById(friendId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người nhận"));
        
        // Kiểm tra đã gửi lời mời chưa (user -> friend)
        if (friendshipRepository.findByUserAndFriend(user, friend).isPresent()) {
            throw new RuntimeException("Bạn đã gửi lời mời kết bạn cho người này rồi");
        }
        
        // Kiểm tra đã nhận lời mời chưa (friend -> user)
        if (friendshipRepository.findByUserAndFriend(friend, user).isPresent()) {
            throw new RuntimeException("Người này đã gửi lời mời kết bạn cho bạn. Vui lòng kiểm tra lời mời kết bạn");
        }
        
        Friendship friendship = Friendship.builder()
                .user(user)
                .friend(friend)
                .status(FriendshipStatus.PENDING)
                .build();
        
        friendshipRepository.save(friendship);
        
        // Gửi thông báo realtime
        notificationService.notifyFriendRequest(friend, user);
    }
    
    @Transactional
    public void acceptFriendRequest(Long requestId) {
        Friendship friendship = friendshipRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Friend request not found"));
        
        if (friendship.getStatus() != FriendshipStatus.PENDING) {
            throw new RuntimeException("Request is not pending");
        }
        
        friendship.setStatus(FriendshipStatus.ACCEPTED);
        friendship.setAcceptedAt(LocalDateTime.now());
        friendshipRepository.save(friendship);
        
        // Create reverse friendship
        Friendship reverseFriendship = Friendship.builder()
                .user(friendship.getFriend())
                .friend(friendship.getUser())
                .status(FriendshipStatus.ACCEPTED)
                .acceptedAt(LocalDateTime.now())
                .build();
        friendshipRepository.save(reverseFriendship);
        
        // Gửi thông báo cho người gửi lời mời
        notificationService.notifyFriendAccept(friendship.getUser(), friendship.getFriend());
    }
    
    @Transactional
    public void rejectFriendRequest(Long requestId) {
        Friendship friendship = friendshipRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Friend request not found"));
        
        friendship.setStatus(FriendshipStatus.REJECTED);
        friendshipRepository.save(friendship);
    }
    
    public List<UserResponse> getFriendsList(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<Friendship> friendships = friendshipRepository.findByUserAndStatus(user, FriendshipStatus.ACCEPTED);
        
        return friendships.stream()
                .map(f -> convertToUserResponse(f.getFriend()))
                .collect(Collectors.toList());
    }
    
    public List<FriendRequestResponse> getPendingRequests(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Lấy các lời mời mà user là người nhận
        List<Friendship> receivedRequests = friendshipRepository.findByFriendAndStatus(user, FriendshipStatus.PENDING);
        
        return receivedRequests.stream()
                .map(this::convertToFriendRequestResponse)
                .collect(Collectors.toList());
    }
    
    public boolean areFriends(Long userId1, Long userId2) {
        User user1 = userRepository.findById(userId1)
                .orElseThrow(() -> new RuntimeException("User not found"));
        User user2 = userRepository.findById(userId2)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return friendshipRepository.areFriends(user1, user2, FriendshipStatus.ACCEPTED);
    }
    
    private UserResponse convertToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .displayName(user.getDisplayName())
                .role(user.getRole().name())
                .status(user.getStatus())
                .verified(user.isVerified())
                .storageQuota(user.getStorageQuota())
                .storageUsed(user.getStorageUsed())
                .online(user.isOnline())
                .lastSeen(user.getLastSeen())
                .build();
    }
    
    private FriendRequestResponse convertToFriendRequestResponse(Friendship friendship) {
        return FriendRequestResponse.builder()
                .id(friendship.getId())
                .sender(convertToUserResponse(friendship.getUser()))
                .receiver(convertToUserResponse(friendship.getFriend()))
                .status(friendship.getStatus().name())
                .createdAt(friendship.getCreatedAt())
                .build();
    }
}
