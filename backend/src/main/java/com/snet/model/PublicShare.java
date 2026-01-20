package com.snet.model;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "public_shares")
@EntityListeners(AuditingEntityListener.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PublicShare {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "file_id", nullable = false)
    private FileMetadata file;
    
    @Column(unique = true, nullable = false)
    private String shareToken = UUID.randomUUID().toString();
    
    @Lob
    @Column(columnDefinition = "MEDIUMBLOB")
    private byte[] qrCode;
    
    private LocalDateTime expiresAt;
    
    private Integer maxAccessCount;
    
    @Column(nullable = false)
    private Integer accessCount = 0;
    
    private boolean active = true;
    
    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
