package com.pixshare.repository;

import com.pixshare.model.ChatGroup;
import com.pixshare.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatGroupRepository extends JpaRepository<ChatGroup, Long> {
    
    @Query("SELECT g FROM ChatGroup g JOIN g.members m WHERE m = :user AND g.deleted = false")
    List<ChatGroup> findByMember(@Param("user") User user);
    
    @Query("SELECT g FROM ChatGroup g WHERE g.creator = :user AND g.deleted = false")
    List<ChatGroup> findByCreator(@Param("user") User user);
    
    @Query("SELECT g FROM ChatGroup g JOIN g.admins a WHERE a = :user AND g.deleted = false")
    List<ChatGroup> findByAdmin(@Param("user") User user);
    
    List<ChatGroup> findByDeletedFalse();
}
