package com.taskmanager.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class TaskRequest {

    private String title;
    private String description;
    private LocalDate dueDate;
    private String priority;
    private String status;
    private String projectId;
    private String assignedTo;
}