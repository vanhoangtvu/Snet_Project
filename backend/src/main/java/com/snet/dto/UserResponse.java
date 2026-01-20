package com.snet.dto;

import com.snet.model.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {
    private Long id;
    private String email;
    private String displayName;
    private String role;
    private UserStatus status;
    private Long storageQuota;
    private Long storageUsed;
    private boolean verified;
    private boolean online;
    private LocalDateTime lastSeen;
    private LocalDateTime createdAt;
    
    // New Profile Fields
    private String bio;
    private String phoneNumber;
    private String dateOfBirth;
    private String gender;
    private String location;
    private String website;
    private String facebookUrl;
    private String instagramUrl;
    private String twitterUrl;
    private String linkedinUrl;
    
    // Work & Education
    private String currentJob;
    private String company;
    private String school;
    private String university;
    
    // Additional Personal Info
    private String hometown;
    private String relationshipStatus;
    private String languages;
    private String interests;
}
