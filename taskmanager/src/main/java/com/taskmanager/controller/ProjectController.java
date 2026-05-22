package com.taskmanager.controller;

import com.taskmanager.dto.ProjectRequest;
import com.taskmanager.model.Project;
import com.taskmanager.service.ProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    @PostMapping
    public ResponseEntity<?> createProject(
            @RequestBody ProjectRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        Project project = projectService.createProject(request, userDetails.getUsername());
        return ResponseEntity.ok(project);
    }

    @GetMapping
    public ResponseEntity<?> getMyProjects(
            @AuthenticationPrincipal UserDetails userDetails) {
        List<Project> projects = projectService.getMyProjects(userDetails.getUsername());
        return ResponseEntity.ok(projects);
    }

    @PostMapping("/{projectId}/members")
    public ResponseEntity<?> addMember(
            @PathVariable String projectId,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserDetails userDetails) {
        Project project = projectService.addMember(
                projectId, body.get("email"), userDetails.getUsername());
        return ResponseEntity.ok(project);
    }

    @DeleteMapping("/{projectId}/members")
    public ResponseEntity<?> removeMember(
            @PathVariable String projectId,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserDetails userDetails) {
        Project project = projectService.removeMember(
                projectId, body.get("email"), userDetails.getUsername());
        return ResponseEntity.ok(project);
    }
}