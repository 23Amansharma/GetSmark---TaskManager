package com.taskmanager.service;

import com.taskmanager.dto.TaskRequest;
import com.taskmanager.model.Project;
import com.taskmanager.model.Task;
import com.taskmanager.model.User;
import com.taskmanager.repository.ProjectRepository;
import com.taskmanager.repository.TaskRepository;
import com.taskmanager.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final EmailService emailService;

    public Task createTask(TaskRequest request, String email) {
        User requester = findUserByEmail(email);
        Project project = findProject(request.getProjectId());
        ensureProjectAdmin(project, requester.getId());

        Task task = new Task();
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setDueDate(request.getDueDate());
        task.setPriority(request.getPriority() != null ? request.getPriority() : "MEDIUM");
        task.setStatus(request.getStatus() != null ? request.getStatus() : "TODO");
        task.setProjectId(project.getId());
        task.setCreatedBy(requester.getId());
        task.setCreatedAt(LocalDateTime.now());
        task.setUpdatedAt(task.getCreatedAt());

        applyAssignee(task, request.getAssignedTo(), project);

        Task saved = taskRepository.save(task);

        // Email notification jab task assign ho
        if (saved.getAssignedTo() != null) {
            User assignee = userRepository.findById(saved.getAssignedTo()).orElse(null);
            if (assignee != null) {
                emailService.sendTaskAssignedEmail(
                        assignee.getEmail(),
                        assignee.getName(),
                        saved.getTitle(),
                        saved.getDescription(),
                        project.getName(),
                        saved.getDueDate() != null ? saved.getDueDate().toString() : null,
                        saved.getPriority()
                );
            }
        }

        return saved;
    }

    public List<Task> getProjectTasks(String projectId, String email) {
        User requester = findUserByEmail(email);
        Project project = findProject(projectId);
        ensureProjectMember(project, requester.getId());

        List<Task> projectTasks = taskRepository.findByProjectId(projectId);

        if (isProjectAdmin(project, requester.getId())) {
            return projectTasks;
        }

        return projectTasks.stream()
                .filter(task -> requester.getId().equals(task.getAssignedTo()))
                .toList();
    }

    public List<Task> getMyTasks(String email) {
        User user = findUserByEmail(email);
        return taskRepository.findByAssignedTo(user.getId());
    }

    public Task updateTask(String taskId, TaskRequest request, String email) {
        User requester = findUserByEmail(email);
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        Project project = findProject(task.getProjectId());

        ensureProjectMember(project, requester.getId());

        boolean admin = isProjectAdmin(project, requester.getId());
        boolean assignee = requester.getId().equals(task.getAssignedTo());

        if (!admin && !assignee) {
            throw new RuntimeException("You can only update tasks assigned to you");
        }

        if (!admin) {
            if (request.getStatus() == null) {
                throw new RuntimeException("Members can only update the status");
            }
            task.setStatus(request.getStatus());
            task.setUpdatedAt(LocalDateTime.now());
            return taskRepository.save(task);
        }

        if (request.getTitle() != null) task.setTitle(request.getTitle());
        if (request.getDescription() != null) task.setDescription(request.getDescription());
        if (request.getDueDate() != null) task.setDueDate(request.getDueDate());
        if (request.getPriority() != null) task.setPriority(request.getPriority());
        if (request.getStatus() != null) task.setStatus(request.getStatus());

        // Reassign hone pe email
        if (request.getAssignedTo() != null && !request.getAssignedTo().equals(task.getAssignedTo())) {
            applyAssignee(task, request.getAssignedTo(), project);
            User newAssignee = userRepository.findById(task.getAssignedTo()).orElse(null);
            if (newAssignee != null) {
                emailService.sendTaskAssignedEmail(
                        newAssignee.getEmail(),
                        newAssignee.getName(),
                        task.getTitle(),
                        task.getDescription(),
                        project.getName(),
                        task.getDueDate() != null ? task.getDueDate().toString() : null,
                        task.getPriority()
                );
            }
        }

        task.setUpdatedAt(LocalDateTime.now());
        return taskRepository.save(task);
    }

    public void deleteTask(String taskId, String email) {
        User requester = findUserByEmail(email);
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        Project project = findProject(task.getProjectId());
        ensureProjectAdmin(project, requester.getId());
        taskRepository.deleteById(taskId);
    }

    private void applyAssignee(Task task, String assigneeId, Project project) {
        if (!hasText(assigneeId)) {
            task.setAssignedTo(null);
            task.setAssignedToName(null);
            return;
        }
        User assignee = userRepository.findById(assigneeId)
                .orElseThrow(() -> new RuntimeException("Assignee not found"));
        ensureProjectMember(project, assignee.getId());
        task.setAssignedTo(assignee.getId());
        task.setAssignedToName(assignee.getName());
    }

    private User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private Project findProject(String projectId) {
        if (!hasText(projectId)) throw new RuntimeException("Project is required");
        return projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
    }

    private void ensureProjectAdmin(Project project, String userId) {
        if (!isProjectAdmin(project, userId))
            throw new RuntimeException("Only project admins can manage tasks");
    }

    private void ensureProjectMember(Project project, String userId) {
        boolean member = project.getMembers().stream()
                .anyMatch(entry -> entry.getUserId().equals(userId));
        if (!member) throw new RuntimeException("You are not a member of this project");
    }

    private boolean isProjectAdmin(Project project, String userId) {
        return project.getMembers().stream()
                .anyMatch(entry -> entry.getUserId().equals(userId) && "ADMIN".equals(entry.getRole()));
    }

    private boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }
}