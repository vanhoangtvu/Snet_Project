package com.snet.repository;

import com.snet.model.FileCategory;
import com.snet.model.FileMetadata;
import com.snet.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface FileMetadataRepository extends JpaRepository<FileMetadata, Long> {
    
    List<FileMetadata> findByUserAndDeletedFalseOrderByUploadedAtDesc(User user);
    
    List<FileMetadata> findByUserAndDeletedFalse(User user);
    
    List<FileMetadata> findByUser(User user);
    
    List<FileMetadata> findByCategoryAndDeletedFalse(FileCategory category);
    
    List<FileMetadata> findByCategory(FileCategory category);
    
    List<FileMetadata> findByDeletedFalse();
    
    // Count methods
    long countByDeletedFalse();
    
    long countByDeletedTrue();
    
    @Query("SELECT f FROM FileMetadata f WHERE f.fileSize > :size AND f.deleted = false")
    List<FileMetadata> findByFileSizeGreaterThan(@Param("size") Long size);
    
    List<FileMetadata> findByUploadedAtBetweenAndDeletedFalse(LocalDateTime start, LocalDateTime end);
    
    @Query("SELECT SUM(f.fileSize) FROM FileMetadata f WHERE f.user = :user AND f.deleted = false")
    Long calculateUserStorageUsed(@Param("user") User user);
    
    @Query("SELECT f.category, COUNT(f) FROM FileMetadata f WHERE f.deleted = false GROUP BY f.category")
    List<Object[]> countByCategory();
    
    @Query("SELECT f.user, SUM(f.fileSize) as totalSize FROM FileMetadata f WHERE f.deleted = false " +
           "GROUP BY f.user ORDER BY totalSize DESC")
    List<Object[]> findTopUsersByStorage();
    
    @Query("SELECT SUM(f.fileSize) FROM FileMetadata f WHERE f.deleted = false")
    Long sumFileSizeByDeletedFalse();
}
