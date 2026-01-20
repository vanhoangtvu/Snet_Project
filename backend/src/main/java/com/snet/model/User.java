package com.snet.model;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users")
@EntityListeners(AuditingEntityListener.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String email;
    
    @Column(nullable = false)
    private String password;
    
    @Column(nullable = false)
    private String displayName;
    
    @Lob
    @Column(columnDefinition = "LONGBLOB")
    private byte[] avatar;
    
    @Lob
    @Column(columnDefinition = "LONGBLOB")
    private byte[] coverPhoto;
    
    @Column(length = 500)
    private String bio;
    
    private String phoneNumber;
    private String dateOfBirth; // Format: YYYY-MM-DD
    private String gender; // Male, Female, Other
    private String location;
    private String website;
    
    // Social Media Links
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
    private String relationshipStatus; // Single, In a relationship, Engaged, Married, etc.
    private String languages; // VD: Tiếng Việt, English, 中文
    
    @Column(length = 300)
    private String interests; // Hobbies and activities
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role = UserRole.USER;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserStatus status = UserStatus.ACTIVE;
    
    @Column(nullable = false)
    private Long storageQuota = 5368709120L; // 5GB default
    
    @Column(nullable = false)
    private Long storageUsed = 0L;
    
    @Column(nullable = false)
    private boolean verified = false; // Verified badge like Facebook
    
    private boolean online = false;
    
    private LocalDateTime lastSeen;
    
    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    private LocalDateTime updatedAt;
    
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<FileMetadata> files = new HashSet<>();
    
    @OneToMany(mappedBy = "sender", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Message> sentMessages = new HashSet<>();
    
    @OneToMany(mappedBy = "receiver", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Message> receivedMessages = new HashSet<>();
}
