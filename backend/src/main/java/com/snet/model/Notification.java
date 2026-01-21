package com.snet.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user; // Người nhận thông báo

    @ManyToOne
    @JoinColumn(name = "actor_id", nullable = false)
    private User actor; // Người thực hiện hành động

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type;

    @ManyToOne
    @JoinColumn(name = "post_id")
    private Post post; // Bài viết liên quan (nếu có)

    @ManyToOne
    @JoinColumn(name = "comment_id")
    private PostComment comment; // Comment liên quan (nếu có)

    @Column(columnDefinition = "TEXT")
    private String content; // Nội dung thông báo

    @Column(nullable = false)
    private Boolean isRead = false;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum NotificationType {
        POST_LIKE,          // Thích bài viết
        POST_COMMENT,       // Bình luận bài viết
        COMMENT_LIKE,       // Thích comment
        COMMENT_REPLY,      // Trả lời comment
        POST_MENTION,       // Nhắc tên trong bài viết
        COMMENT_MENTION,    // Nhắc tên trong comment
        FRIEND_REQUEST,     // Lời mời kết bạn
        FRIEND_ACCEPT       // Chấp nhận kết bạn
    }
}
