package com.pixshare.repository;

import com.pixshare.model.Post;
import com.pixshare.model.PostComment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface PostCommentRepository extends JpaRepository<PostComment, Long> {
    
    // Lấy comments của bài đăng theo thời gian
    @Query("SELECT pc FROM PostComment pc WHERE pc.post = :post ORDER BY pc.createdAt ASC")
    Page<PostComment> findByPost(@Param("post") Post post, Pageable pageable);
    
    // Đếm số comment của bài đăng
    long countByPost(Post post);
}