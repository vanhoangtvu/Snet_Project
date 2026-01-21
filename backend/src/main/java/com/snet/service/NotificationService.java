package com.snet.service;

import com.snet.model.*;
import com.snet.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class NotificationService {
    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    public void createNotification(User user, User actor, Notification.NotificationType type, 
                                   Post post, PostComment comment, String content) {
        // Không tạo thông báo cho chính mình
        if (user.getId().equals(actor.getId())) return;

        Notification notification = new Notification();
        notification.setUser(user);
        notification.setActor(actor);
        notification.setType(type);
        notification.setPost(post);
        notification.setComment(comment);
        notification.setContent(content);
        
        notificationRepository.save(notification);
        
        // Gửi realtime qua WebSocket
        messagingTemplate.convertAndSendToUser(
            user.getId().toString(),
            "/queue/notifications",
            notification
        );
    }

    // Thông báo khi like bài viết
    public void notifyPostLike(Post post, User actor) {
        createNotification(
            post.getUser(),
            actor,
            Notification.NotificationType.POST_LIKE,
            post,
            null,
            "đã thích bài viết của bạn"
        );
    }

    // Thông báo khi comment bài viết
    public void notifyPostComment(Post post, User actor, String commentContent) {
        createNotification(
            post.getUser(),
            actor,
            Notification.NotificationType.POST_COMMENT,
            post,
            null,
            "đã bình luận về bài viết của bạn"
        );
        
        // Kiểm tra mention trong comment
        checkMentions(commentContent, actor, post, null);
    }

    // Thông báo khi like comment
    public void notifyCommentLike(PostComment comment, User actor) {
        createNotification(
            comment.getUser(),
            actor,
            Notification.NotificationType.COMMENT_LIKE,
            comment.getPost(),
            comment,
            "đã thích bình luận của bạn"
        );
    }

    // Thông báo khi reply comment
    public void notifyCommentReply(PostComment parentComment, User actor, String replyContent) {
        createNotification(
            parentComment.getUser(),
            actor,
            Notification.NotificationType.COMMENT_REPLY,
            parentComment.getPost(),
            parentComment,
            "đã trả lời bình luận của bạn"
        );
        
        // Kiểm tra mention trong reply
        checkMentions(replyContent, actor, parentComment.getPost(), parentComment);
    }

    // Thông báo khi mention trong post
    public void notifyPostMention(Post post, User actor, User mentionedUser) {
        createNotification(
            mentionedUser,
            actor,
            Notification.NotificationType.POST_MENTION,
            post,
            null,
            "đã nhắc đến bạn trong một bài viết"
        );
    }

    // Thông báo khi mention trong comment
    public void notifyCommentMention(Post post, PostComment comment, User actor, User mentionedUser) {
        createNotification(
            mentionedUser,
            actor,
            Notification.NotificationType.COMMENT_MENTION,
            post,
            comment,
            "đã nhắc đến bạn trong một bình luận"
        );
    }

    // Kiểm tra và tạo thông báo cho mentions
    private void checkMentions(String content, User actor, Post post, PostComment comment) {
        Pattern pattern = Pattern.compile("@\\[(.*?)\\]\\((\\d+)\\)");
        Matcher matcher = pattern.matcher(content);
        
        while (matcher.find()) {
            Long mentionedUserId = Long.parseLong(matcher.group(2));
            User mentionedUser = new User();
            mentionedUser.setId(mentionedUserId);
            
            if (comment != null) {
                notifyCommentMention(post, comment, actor, mentionedUser);
            } else {
                notifyPostMention(post, actor, mentionedUser);
            }
        }
    }

    public List<Notification> getUserNotifications(User user) {
        return notificationRepository.findByUserOrderByCreatedAtDesc(user);
    }

    public Long getUnreadCount(User user) {
        return notificationRepository.countByUserAndIsReadFalse(user);
    }

    @Transactional
    public void markAsRead(Long notificationId) {
        notificationRepository.findById(notificationId).ifPresent(notification -> {
            notification.setIsRead(true);
            notificationRepository.save(notification);
        });
    }

    @Transactional
    public void markAllAsRead(User user) {
        List<Notification> notifications = notificationRepository.findByUserOrderByCreatedAtDesc(user);
        notifications.forEach(n -> n.setIsRead(true));
        notificationRepository.saveAll(notifications);
    }
}
