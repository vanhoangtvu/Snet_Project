package com.pixshare.repository;

import com.pixshare.model.Post;
import com.pixshare.model.PostLike;
import com.pixshare.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PostLikeRepository extends JpaRepository<PostLike, Long> {
    
    // Kiểm tra user đã like bài đăng chưa
    Optional<PostLike> findByPostAndUser(Post post, User user);
    
    // Lấy danh sách like theo thời gian
    Page<PostLike> findByPostOrderByCreatedAtDesc(Post post, Pageable pageable);
    
    // Đếm số like của bài đăng
    long countByPost(Post post);
    
    // Xóa like của user cho bài đăng
    @Modifying
    @Query("DELETE FROM PostLike pl WHERE pl.post = :post AND pl.user = :user")
    void deleteByPostAndUser(@Param("post") Post post, @Param("user") User user);
    
    // Kiểm tra user đã like bài đăng chưa (boolean)
    boolean existsByPostAndUser(Post post, User user);
}