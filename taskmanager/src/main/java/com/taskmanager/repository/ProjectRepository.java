package com.taskmanager.repository;

import com.taskmanager.model.Project;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface ProjectRepository extends MongoRepository<Project, String> {
    List<Project> findByCreatedBy(String userId);
    List<Project> findByMembersUserId(String userId);
}