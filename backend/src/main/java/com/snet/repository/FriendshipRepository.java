package com.snet.repository;

import com.snet.model.Friendship;
import com.snet.model.FriendshipStatus;
import com.snet.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FriendshipRepository extends JpaRepository<Friendship, Long> {
    
    Optional<Friendship> findByUserAndFriend(User user, User friend);
    
    List<Friendship> findByUserAndStatus(User user, FriendshipStatus status);
    
    List<Friendship> findByFriendAndStatus(User friend, FriendshipStatus status);
    
    @Query("SELECT f FROM Friendship f WHERE (f.user = :user OR f.friend = :user) AND f.status = :status")
    List<Friendship> findAllFriendships(@Param("user") User user, @Param("status") FriendshipStatus status);
    
    @Query("SELECT CASE WHEN COUNT(f) > 0 THEN true ELSE false END FROM Friendship f " +
           "WHERE ((f.user = :user1 AND f.friend = :user2) OR (f.user = :user2 AND f.friend = :user1)) " +
           "AND f.status = :status")
    boolean areFriends(@Param("user1") User user1, @Param("user2") User user2, @Param("status") FriendshipStatus status);
    
    // Delete methods for cascade delete
    void deleteByUser(User user);
    void deleteByFriend(User friend);
}
