package com.pixshare.repository;

import com.pixshare.model.User;
import com.pixshare.model.UserStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    List<User> findByOnlineTrue();
    List<User> findByStatus(UserStatus status);
    List<User> findByDisplayNameContainingIgnoreCase(String displayName);
    List<User> findByEmailContainingIgnoreCaseOrDisplayNameContainingIgnoreCase(String email, String displayName);
}
