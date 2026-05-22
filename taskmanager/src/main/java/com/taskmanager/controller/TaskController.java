package com.taskmanager.controller;

import com.taskmanager.dto.TaskRequest;
import com.taskmanager.model.Task;
import com.taskmanager.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @PostMapping
    public ResponseEntity<?> createTask(
            @RequestBody TaskRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        Task task = taskService.createTask(request, userDetails.getUsername());
        return ResponseEntity.ok(task);
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<?> getProjectTasks(
            @PathVariable String projectId,
            @AuthenticationPrincipal UserDetails userDetails) {
        List<Task> tasks = taskService.getProjectTasks(projectId, userDetails.getUsername());
        return ResponseEntity.ok(tasks);
    }

    @GetMapping("/my")
    public ResponseEntity<?> getMyTasks(
            @AuthenticationPrincipal UserDetails userDetails) {
        List<Task> tasks = taskService.getMyTasks(userDetails.getUsername());
        return ResponseEntity.ok(tasks);
    }

    @PatchMapping("/{taskId}")
    public ResponseEntity<?> updateTask(
            @PathVariable String taskId,
            @RequestBody TaskRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        Task task = taskService.updateTask(taskId, request, userDetails.getUsername());
        return ResponseEntity.ok(task);
    }

    @DeleteMapping("/{taskId}")
    public ResponseEntity<?> deleteTask(
            @PathVariable String taskId,
            @AuthenticationPrincipal UserDetails userDetails) {
        taskService.deleteTask(taskId, userDetails.getUsername());
        return ResponseEntity.ok("Task deleted");
    }
}