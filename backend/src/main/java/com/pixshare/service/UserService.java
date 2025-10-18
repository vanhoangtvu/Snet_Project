package com.pixshare.service;

import com.pixshare.dto.UserResponse;
import com.pixshare.model.User;
import com.pixshare.model.UserStatus;
import com.pixshare.repository.UserRepository;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {
    
    private final UserRepository userRepository;
    private final EntityManager entityManager;
    private FileService fileService;
    
    public UserService(UserRepository userRepository, EntityManager entityManager) {
        this.userRepository = userRepository;
        this.entityManager = entityManager;
    }
    
    // Setter injection to avoid circular dependency
    public void setFileService(FileService fileService) {
        this.fileService = fileService;
    }
    
    public User getCurrentUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
    
    public UserResponse getUserProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return convertToResponse(user);
    }
    
    @Transactional
    public UserResponse updateProfile(String email, String displayName, MultipartFile avatar) throws IOException {
        User user = getCurrentUser(email);
        
        if (displayName != null && !displayName.isBlank()) {
            user.setDisplayName(displayName);
        }
        
        if (avatar != null && !avatar.isEmpty()) {
            user.setAvatar(avatar.getBytes());
        }
        
        userRepository.save(user);
        return convertToResponse(user);
    }
    
    @Transactional
    public UserResponse updateProfileExtended(String email, String displayName, MultipartFile avatar, 
                                             MultipartFile coverPhoto, String bio, String phoneNumber,
                                             String dateOfBirth, String gender, String location,
                                             String website, String facebookUrl, String instagramUrl,
                                             String twitterUrl, String linkedinUrl,
                                             String currentJob, String company, String school, String university,
                                             String hometown, String relationshipStatus, String languages, String interests) throws IOException {
        User user = getCurrentUser(email);
        
        System.out.println("🔄 Updating profile for user: " + email);
        
        if (displayName != null && !displayName.isBlank()) {
            user.setDisplayName(displayName);
            System.out.println("✅ Updated displayName: " + displayName);
        }
        
        if (avatar != null && !avatar.isEmpty()) {
            user.setAvatar(avatar.getBytes());
            System.out.println("✅ Updated avatar: " + avatar.getSize() + " bytes");
        }
        
        if (coverPhoto != null && !coverPhoto.isEmpty()) {
            byte[] coverBytes = coverPhoto.getBytes();
            user.setCoverPhoto(coverBytes);
            System.out.println("✅ Updated cover photo: " + coverBytes.length + " bytes");
        } else {
            System.out.println("⚠️ No cover photo in request");
        }
        
        if (bio != null) user.setBio(bio);
        if (phoneNumber != null) user.setPhoneNumber(phoneNumber);
        if (dateOfBirth != null) user.setDateOfBirth(dateOfBirth);
        if (gender != null) user.setGender(gender);
        if (location != null) user.setLocation(location);
        if (website != null) user.setWebsite(website);
        if (facebookUrl != null) user.setFacebookUrl(facebookUrl);
        if (instagramUrl != null) user.setInstagramUrl(instagramUrl);
        if (twitterUrl != null) user.setTwitterUrl(twitterUrl);
        if (linkedinUrl != null) user.setLinkedinUrl(linkedinUrl);
        
        // Work & Education
        if (currentJob != null) user.setCurrentJob(currentJob);
        if (company != null) user.setCompany(company);
        if (school != null) user.setSchool(school);
        if (university != null) user.setUniversity(university);
        
        // Additional Personal Info
        if (hometown != null) user.setHometown(hometown);
        if (relationshipStatus != null) user.setRelationshipStatus(relationshipStatus);
        if (languages != null) user.setLanguages(languages);
        if (interests != null) user.setInterests(interests);
        
        User savedUser = userRepository.save(user);
        
        // Force flush to database immediately
        entityManager.flush();
        entityManager.refresh(savedUser);
        
        System.out.println("💾 User saved to database and flushed");
        System.out.println("📸 Cover photo in DB: " + (savedUser.getCoverPhoto() != null ? savedUser.getCoverPhoto().length + " bytes" : "null"));
        System.out.println("🖼️ Avatar in DB: " + (savedUser.getAvatar() != null ? savedUser.getAvatar().length + " bytes" : "null"));
        
        return convertToResponse(savedUser);
    }
    
    public byte[] getUserCoverPhoto(Long userId) {
        System.out.println("🔍 Fetching cover photo for user ID: " + userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        byte[] coverPhoto = user.getCoverPhoto();
        
        if (coverPhoto != null) {
            System.out.println("✅ Cover photo found: " + coverPhoto.length + " bytes");
        } else {
            System.out.println("⚠️ No cover photo found in database for user: " + userId);
        }
        
        return coverPhoto;
    }
    
    public List<UserResponse> searchUsers(String currentUserEmail, String keyword) {
        User currentUser = getCurrentUser(currentUserEmail);
        return userRepository.findByEmailContainingIgnoreCaseOrDisplayNameContainingIgnoreCase(keyword, keyword)
                .stream()
                .filter(user -> !user.getId().equals(currentUser.getId())) // Exclude current user
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    public List<UserResponse> getOnlineUsers() {
        return userRepository.findByOnlineTrue()
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public void setUserOnlineStatus(String email, boolean online) {
        User user = getCurrentUser(email);
        user.setOnline(online);
        if (!online) {
            user.setLastSeen(LocalDateTime.now());
        }
        userRepository.save(user);
    }
    
    public byte[] getUserAvatar(Long userId, String size) {
        System.out.println("🔍 Fetching avatar for user ID: " + userId + " with size: " + size);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        byte[] avatar = user.getAvatar();
        
        if (avatar == null) {
            System.out.println("⚠️ No avatar found in database for user: " + userId);
            return null;
        }
        
        System.out.println("✅ Avatar found: " + avatar.length + " bytes");
        
        // Return original for full size
        if ("full".equals(size)) {
            return avatar;
        }
        
        // Use FileService resize logic which includes auto-rotation
        if (fileService != null) {
            try {
                byte[] resized = fileService.resizeImage(avatar, size);
                System.out.println("✅ Resized avatar from " + avatar.length + " to " + resized.length + " bytes");
                return resized;
            } catch (Exception e) {
                System.err.println("❌ Error resizing avatar: " + e.getMessage());
                return avatar; // Fallback to original
            }
        }
        
        // Fallback if FileService not available
        return avatar;
    }
    
    private UserResponse convertToResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .displayName(user.getDisplayName())
                .role(user.getRole().name())
                .status(user.getStatus())
                .storageQuota(user.getStorageQuota())
                .storageUsed(user.getStorageUsed())
                .verified(user.isVerified())
                .online(user.isOnline())
                .lastSeen(user.getLastSeen())
                .createdAt(user.getCreatedAt())
                .bio(user.getBio())
                .phoneNumber(user.getPhoneNumber())
                .dateOfBirth(user.getDateOfBirth())
                .gender(user.getGender())
                .location(user.getLocation())
                .website(user.getWebsite())
                .facebookUrl(user.getFacebookUrl())
                .instagramUrl(user.getInstagramUrl())
                .twitterUrl(user.getTwitterUrl())
                .linkedinUrl(user.getLinkedinUrl())
                .currentJob(user.getCurrentJob())
                .company(user.getCompany())
                .school(user.getSchool())
                .university(user.getUniversity())
                .hometown(user.getHometown())
                .relationshipStatus(user.getRelationshipStatus())
                .languages(user.getLanguages())
                .interests(user.getInterests())
                .build();
    }
}
