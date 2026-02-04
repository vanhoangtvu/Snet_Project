package com.snet.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "post_shares")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PostShare {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;
    
    @Column(nullable = false, unique = true)
    private String shareToken;
    
    @Lob
    @Column(columnDefinition = "MEDIUMBLOB")
    private byte[] qrCode;
    
    private LocalDateTime expiresAt;
    
    private Integer maxAccessCount;
    
    @Column(nullable = false)
    private Integer accessCount = 0;
    
    @Column(nullable = false)
    private boolean active = true;
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
