package com.taskmanager.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "tasks")
public class Task {

    @Id
    private String id;

    private String title;
    private String description;
    private LocalDate dueDate;
    private String priority; // LOW, MEDIUM, HIGH
    private String status;   // TODO, IN_PROGRESS, DONE
    private String projectId;
    private String assignedTo; // User ID
    private String assignedToName;
    private String createdBy; // User ID
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt;
}