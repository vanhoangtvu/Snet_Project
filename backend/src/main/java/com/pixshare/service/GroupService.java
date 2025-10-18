package com.pixshare.service;

import com.pixshare.dto.CreateGroupRequest;
import com.pixshare.dto.GroupResponse;
import com.pixshare.dto.UserResponse;
import com.pixshare.model.ChatGroup;
import com.pixshare.model.User;
import com.pixshare.repository.ChatGroupRepository;
import com.pixshare.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GroupService {
    
    private final ChatGroupRepository groupRepository;
    private final UserRepository userRepository;
    
    @Transactional
    public GroupResponse createGroup(String creatorEmail, CreateGroupRequest request) {
        User creator = userRepository.findByEmail(creatorEmail)
                .orElseThrow(() -> new RuntimeException("Creator not found"));
        
        ChatGroup group = ChatGroup.builder()
                .name(request.getName())
                .description(request.getDescription())
                .creator(creator)
                .members(new HashSet<>())
                .admins(new HashSet<>())
                .build();
        
        // Add creator as member and admin
        group.getMembers().add(creator);
        group.getAdmins().add(creator);
        
        // Add other members
        if (request.getMemberIds() != null) {
            for (Long memberId : request.getMemberIds()) {
                User member = userRepository.findById(memberId)
                        .orElseThrow(() -> new RuntimeException("Member not found: " + memberId));
                group.getMembers().add(member);
            }
        }
        
        group = groupRepository.save(group);
        return convertToResponse(group);
    }
    
    @Transactional
    public GroupResponse updateGroupAvatar(Long groupId, String userEmail, MultipartFile file) throws IOException {
        ChatGroup group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));
        
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Check if user is admin
        if (!group.getAdmins().contains(user)) {
            throw new RuntimeException("Only admins can update group avatar");
        }
        
        group.setAvatar(file.getBytes());
        group = groupRepository.save(group);
        
        return convertToResponse(group);
    }
    
    @Transactional
    public GroupResponse addMember(Long groupId, String adminEmail, Long userId) {
        ChatGroup group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));
        
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
        
        // Check if user is admin
        if (!group.getAdmins().contains(admin)) {
            throw new RuntimeException("Only admins can add members");
        }
        
        User newMember = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        group.getMembers().add(newMember);
        group = groupRepository.save(group);
        
        return convertToResponse(group);
    }
    
    @Transactional
    public GroupResponse removeMember(Long groupId, String adminEmail, Long userId) {
        ChatGroup group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));
        
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
        
        // Check if user is admin
        if (!group.getAdmins().contains(admin)) {
            throw new RuntimeException("Only admins can remove members");
        }
        
        User memberToRemove = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Cannot remove creator
        if (memberToRemove.equals(group.getCreator())) {
            throw new RuntimeException("Cannot remove group creator");
        }
        
        group.getMembers().remove(memberToRemove);
        group.getAdmins().remove(memberToRemove);
        group = groupRepository.save(group);
        
        return convertToResponse(group);
    }
    
    @Transactional
    public void leaveGroup(Long groupId, String userEmail) {
        ChatGroup group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));
        
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // If creator leaves, delete the group
        if (user.equals(group.getCreator())) {
            group.setDeleted(true);
            groupRepository.save(group);
        } else {
            group.getMembers().remove(user);
            group.getAdmins().remove(user);
            groupRepository.save(group);
        }
    }
    
    public List<GroupResponse> getUserGroups(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return groupRepository.findByMember(user).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    public GroupResponse getGroupById(Long groupId) {
        ChatGroup group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));
        return convertToResponse(group);
    }
    
    public byte[] getGroupAvatar(Long groupId) {
        ChatGroup group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));
        return group.getAvatar();
    }
    
    private GroupResponse convertToResponse(ChatGroup group) {
        return GroupResponse.builder()
                .id(group.getId())
                .name(group.getName())
                .description(group.getDescription())
                .avatarUrl(group.getAvatar() != null ? "/api/groups/" + group.getId() + "/avatar" : null)
                .creatorId(group.getCreator().getId())
                .creatorName(group.getCreator().getDisplayName())
                .members(group.getMembers().stream()
                        .map(this::convertUserToResponse)
                        .collect(Collectors.toList()))
                .admins(group.getAdmins().stream()
                        .map(this::convertUserToResponse)
                        .collect(Collectors.toList()))
                .memberCount(group.getMembers().size())
                .createdAt(group.getCreatedAt())
                .updatedAt(group.getUpdatedAt())
                .build();
    }
    
    private UserResponse convertUserToResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .displayName(user.getDisplayName())
                .bio(user.getBio())
                .verified(user.isVerified())
                .online(user.isOnline())
                .build();
    }
}
