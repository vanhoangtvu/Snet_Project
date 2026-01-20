package com.snet.repository;

import com.snet.model.Post;
import com.snet.model.PostComment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface PostCommentRepository extends JpaRepository<PostComment, Long> {
    
    // Lấy comments của bài đăng theo thời gian (chỉ parent comments)
    @Query("SELECT pc FROM PostComment pc WHERE pc.post = :post AND pc.parentComment IS NULL ORDER BY pc.createdAt ASC")
    Page<PostComment> findByPost(@Param("post") Post post, Pageable pageable);
    
    // Lấy replies của một comment
    @Query("SELECT pc FROM PostComment pc WHERE pc.parentComment = :parent ORDER BY pc.createdAt ASC")
    java.util.List<PostComment> findByParentComment(@Param("parent") PostComment parent);
    
    // Đếm số comment của bài đăng
    long countByPost(Post post);
}