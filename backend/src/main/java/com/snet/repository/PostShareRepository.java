package com.snet.repository;

import com.snet.model.Post;
import com.snet.model.PostShare;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PostShareRepository extends JpaRepository<PostShare, Long> {
    Optional<PostShare> findByShareToken(String shareToken);
    List<PostShare> findByPost(Post post);
    Optional<PostShare> findFirstByPostAndActiveTrueOrderByCreatedAtDesc(Post post);
}
