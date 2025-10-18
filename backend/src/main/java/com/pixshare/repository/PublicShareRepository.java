package com.pixshare.repository;

import com.pixshare.model.FileMetadata;
import com.pixshare.model.PublicShare;
import com.pixshare.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PublicShareRepository extends JpaRepository<PublicShare, Long> {
    
    Optional<PublicShare> findByShareToken(String shareToken);
    
    List<PublicShare> findByFileAndActiveTrue(FileMetadata file);
    
    List<PublicShare> findByExpiresAtBeforeAndActiveTrue(LocalDateTime now);
    
    List<PublicShare> findByActiveTrue();
    
    @Modifying
    @Query("DELETE FROM PublicShare ps WHERE ps.file.user = :user")
    void deleteByUser(@Param("user") User user);
    
    @Modifying
    @Query("DELETE FROM PublicShare ps WHERE ps.file.id = :fileId")
    void deleteByFileId(@Param("fileId") Long fileId);
    
    List<PublicShare> findByFile(FileMetadata file);
}
