package com.taskmanager.repository;

import com.taskmanager.model.Invitation;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface InvitationRepository extends MongoRepository<Invitation, String> {
    Optional<Invitation> findByToken(String token);
    Optional<Invitation> findByInvitedEmailAndProjectId(String email, String projectId);
    List<Invitation> findAllByInvitedEmail(String email);
}