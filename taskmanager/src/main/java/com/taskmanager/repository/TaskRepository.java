package com.taskmanager.repository;

import com.taskmanager.model.Task;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface TaskRepository extends MongoRepository<Task, String> {
    List<Task> findByProjectId(String projectId);
    List<Task> findByProjectIdIn(List<String> projectIds);
    List<Task> findByAssignedTo(String userId);
    List<Task> findByCreatedBy(String userId);
}