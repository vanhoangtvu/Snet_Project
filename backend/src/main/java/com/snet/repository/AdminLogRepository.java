package com.snet.repository;

import com.snet.model.AdminLog;
import com.snet.model.User;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AdminLogRepository extends JpaRepository<AdminLog, Long> {
    
    List<AdminLog> findByAdminOrderByCreatedAtDesc(User admin, Pageable pageable);
    
    List<AdminLog> findByActionContainingIgnoreCaseOrderByCreatedAtDesc(String action, Pageable pageable);
    
    List<AdminLog> findByCreatedAtBetweenOrderByCreatedAtDesc(LocalDateTime start, LocalDateTime end);
    
    List<AdminLog> findByTargetTypeAndTargetId(String targetType, Long targetId);
}
