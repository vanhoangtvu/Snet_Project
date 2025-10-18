package com.pixshare.repository;

import com.pixshare.model.ChatGroup;
import com.pixshare.model.Message;
import com.pixshare.model.User;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    
    @Query("SELECT m FROM Message m WHERE " +
           "((m.sender = :user1 AND m.receiver = :user2) OR (m.sender = :user2 AND m.receiver = :user1)) " +
           "AND m.deleted = false ORDER BY m.sentAt DESC")
    List<Message> findChatHistory(@Param("user1") User user1, @Param("user2") User user2, Pageable pageable);

    @Query("SELECT COUNT(m) FROM Message m WHERE " +
           "((m.sender = :user1 AND m.receiver = :user2) OR (m.sender = :user2 AND m.receiver = :user1)) " +
           "AND m.deleted = false")
    long countChatHistory(@Param("user1") User user1, @Param("user2") User user2);
    
    @Query("SELECT m FROM Message m WHERE m.group = :group AND m.deleted = false ORDER BY m.sentAt DESC")
    List<Message> findGroupMessages(@Param("group") ChatGroup group, Pageable pageable);
    
    List<Message> findByReceiverAndDeletedFalseOrderBySentAtDesc(User receiver, Pageable pageable);
    
    @Query("SELECT m FROM Message m WHERE m.content LIKE %:keyword% AND m.deleted = false")
    List<Message> searchByKeyword(@Param("keyword") String keyword);
    
    List<Message> findBySentAtBetweenAndDeletedFalse(LocalDateTime start, LocalDateTime end);
    
    long countBySenderAndDeletedFalse(User sender);
    
    long countByReceiverAndDeletedFalse(User receiver);
    
    // Delete methods for cascade delete
    void deleteBySenderId(Long senderId);
    void deleteByReceiverId(Long receiverId);
    void deleteByGroupId(Long groupId);
    
    // Set file to null when file is deleted
    @Modifying
    @Query("UPDATE Message m SET m.file = null WHERE m.file.id = :fileId")
    void removeFileReference(@Param("fileId") Long fileId);
}
