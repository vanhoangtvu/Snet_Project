package com.snet.repository;

import com.snet.model.Post;
import com.snet.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    
    // Lấy tất cả bài đăng public theo thời gian mới nhất
    @Query("SELECT p FROM Post p WHERE p.privacy = 'PUBLIC' ORDER BY p.createdAt DESC")
    Page<Post> findPublicPosts(Pageable pageable);
    
    // Lấy bài đăng của user cụ thể
    @Query("SELECT p FROM Post p WHERE p.user = :user ORDER BY p.createdAt DESC")
    Page<Post> findByUser(@Param("user") User user, Pageable pageable);
    
    // Lấy bài đăng từ friends (để sau này mở rộng)
    @Query("SELECT p FROM Post p WHERE p.user IN :friends AND p.privacy IN ('PUBLIC', 'FRIENDS_ONLY') ORDER BY p.createdAt DESC")
    Page<Post> findPostsFromFriends(@Param("friends") List<User> friends, Pageable pageable);
    
    // Đếm số bài đăng của user
    long countByUser(User user);
    
    // Set file to null when file is deleted
    @Modifying
    @Query("UPDATE Post p SET p.file = null WHERE p.file.id = :fileId")
    void removeFileReference(@Param("fileId") Long fileId);
}