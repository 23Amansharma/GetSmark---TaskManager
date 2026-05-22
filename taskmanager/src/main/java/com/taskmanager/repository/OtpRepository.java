package com.taskmanager.repository;

import com.taskmanager.model.OtpStore;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface OtpRepository extends MongoRepository<OtpStore, String> {
    Optional<OtpStore> findByEmailAndPurpose(String email, String purpose);
    void deleteByEmailAndPurpose(String email, String purpose);
}
