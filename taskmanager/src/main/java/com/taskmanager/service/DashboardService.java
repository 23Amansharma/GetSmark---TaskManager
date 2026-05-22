package com.taskmanager.service;

import com.taskmanager.model.Project;
import com.taskmanager.model.Task;
import com.taskmanager.model.User;
import com.taskmanager.repository.ProjectRepository;
import com.taskmanager.repository.TaskRepository;
import com.taskmanager.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    public Map<String, Object> getDashboard(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Get all projects user is member of
        List<Project> myProjects = projectRepository.findByMembersUserId(user.getId());
        List<String> projectIds = myProjects.stream().map(Project::getId).toList();

        // Get all tasks in those projects
        List<Task> allTasks = projectIds.stream()
                .flatMap(pid -> taskRepository.findByProjectId(pid).stream())
                .collect(Collectors.toList());

        // Basic counts
        long total = allTasks.size();
        long todo = allTasks.stream().filter(t -> "TODO".equals(t.getStatus())).count();
        long inProgress = allTasks.stream().filter(t -> "IN_PROGRESS".equals(t.getStatus())).count();
        long done = allTasks.stream().filter(t -> "DONE".equals(t.getStatus())).count();
        long overdue = allTasks.stream()
                .filter(t -> t.getDueDate() != null
                        && t.getDueDate().isBefore(LocalDate.now())
                        && !"DONE".equals(t.getStatus()))
                .count();

        long myOpenTasks = allTasks.stream()
                .filter(t -> user.getId().equals(t.getAssignedTo()) && !"DONE".equals(t.getStatus()))
                .count();

        long completionRate = total > 0 ? (done * 100 / total) : 0;

        // Status breakdown for donut chart
        List<Map<String, Object>> statusBreakdown = List.of(
                Map.of("key", "TODO", "label", "To Do", "count", todo, "color", "#faad14"),
                Map.of("key", "IN_PROGRESS", "label", "In Progress", "count", inProgress, "color", "#1890ff"),
                Map.of("key", "DONE", "label", "Done", "count", done, "color", "#52c41a"),
                Map.of("key", "OVERDUE", "label", "Overdue", "count", overdue, "color", "#ff4d4f")
        );

        // Tasks per user (workload)
        Map<String, String> userIdToName = new HashMap<>();
        myProjects.forEach(p -> p.getMembers().forEach(m -> userIdToName.put(m.getUserId(), m.getName())));

        List<Map<String, Object>> tasksPerUser = allTasks.stream()
                .filter(t -> t.getAssignedTo() != null)
                .collect(Collectors.groupingBy(Task::getAssignedTo, Collectors.counting()))
                .entrySet().stream()
                .map(e -> Map.<String, Object>of(
                        "name", userIdToName.getOrDefault(e.getKey(), "Unknown"),
                        "count", e.getValue()))
                .collect(Collectors.toList());

        // Upcoming deadlines
        List<Map<String, Object>> upcomingDeadlines = allTasks.stream()
                .filter(t -> t.getDueDate() != null
                        && !t.getDueDate().isBefore(LocalDate.now())
                        && !"DONE".equals(t.getStatus()))
                .sorted(Comparator.comparing(Task::getDueDate))
                .limit(5)
                .map(t -> {
                    String pName = myProjects.stream()
                            .filter(p -> p.getId().equals(t.getProjectId()))
                            .map(Project::getName).findFirst().orElse("Unknown");
                    return Map.<String, Object>of(
                            "id", t.getId(),
                            "title", t.getTitle(),
                            "dueDate", t.getDueDate().toString(),
                            "priority", t.getPriority() != null ? t.getPriority() : "MEDIUM",
                            "projectName", pName
                    );
                })
                .collect(Collectors.toList());

        // My upcoming tasks
        List<Map<String, Object>> myUpcomingTasks = allTasks.stream()
                .filter(t -> user.getId().equals(t.getAssignedTo()) && !"DONE".equals(t.getStatus()))
                .sorted(Comparator.comparing(t -> t.getDueDate() != null ? t.getDueDate() : LocalDate.MAX))
                .limit(5)
                .map(t -> {
                    String pName = myProjects.stream()
                            .filter(p -> p.getId().equals(t.getProjectId()))
                            .map(Project::getName).findFirst().orElse("Unknown");
                    return Map.<String, Object>of(
                            "id", t.getId(),
                            "title", t.getTitle(),
                            "dueDate", t.getDueDate() != null ? t.getDueDate().toString() : "",
                            "priority", t.getPriority() != null ? t.getPriority() : "MEDIUM",
                            "status", t.getStatus() != null ? t.getStatus() : "TODO",
                            "projectName", pName
                    );
                })
                .collect(Collectors.toList());

        // Recent activity
        List<Map<String, Object>> recentActivity = allTasks.stream()
                .filter(t -> t.getCreatedAt() != null)
                .sorted(Comparator.comparing(Task::getCreatedAt).reversed())
                .limit(5)
                .map(t -> {
                    String pName = myProjects.stream()
                            .filter(p -> p.getId().equals(t.getProjectId()))
                            .map(Project::getName).findFirst().orElse("Unknown");
                    return Map.<String, Object>of(
                            "id", t.getId(),
                            "title", t.getTitle(),
                            "type", "task",
                            "summary", "Task created with status " + t.getStatus(),
                            "projectName", pName,
                            "occurredAt", t.getCreatedAt().toString()
                    );
                })
                .collect(Collectors.toList());

        // Project summaries
        List<Map<String, Object>> projectSummaries = myProjects.stream()
                .map(p -> {
                    List<Task> pTasks = taskRepository.findByProjectId(p.getId());
                    long pTotal = pTasks.size();
                    long pDone = pTasks.stream().filter(t -> "DONE".equals(t.getStatus())).count();
                    long pOpen = pTotal - pDone;
                    long pRate = pTotal > 0 ? (pDone * 100 / pTotal) : 0;
                    return Map.<String, Object>of(
                            "id", p.getId(),
                            "name", p.getName(),
                            "memberCount", p.getMembers().size(),
                            "totalTasks", pTotal,
                            "openTasks", pOpen,
                            "completionRate", pRate
                    );
                })
                .collect(Collectors.toList());

        // Task trend (last 7 days)
        List<Map<String, Object>> taskTrend = new ArrayList<>();
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd MMM");
        for (int i = 6; i >= 0; i--) {
            LocalDate day = LocalDate.now().minusDays(i);
            long created = allTasks.stream()
                    .filter(t -> t.getCreatedAt() != null &&
                            t.getCreatedAt().toLocalDate().equals(day))
                    .count();
            long completed = allTasks.stream()
                    .filter(t -> "DONE".equals(t.getStatus()) &&
                            t.getCreatedAt() != null &&
                            t.getCreatedAt().toLocalDate().equals(day))
                    .count();
            taskTrend.add(Map.of(
                    "label", day.format(fmt),
                    "created", created,
                    "completed", completed
            ));
        }

        // User info
        Map<String, Object> userInfo = Map.of(
                "name", user.getName(),
                "email", user.getEmail()
        );

        Map<String, Object> dashboard = new HashMap<>();
        dashboard.put("totalTasks", total);
        dashboard.put("todo", todo);
        dashboard.put("inProgress", inProgress);
        dashboard.put("done", done);
        dashboard.put("overdue", overdue);
        dashboard.put("myOpenTasks", myOpenTasks);
        dashboard.put("completionRate", completionRate);
        dashboard.put("totalProjects", myProjects.size());
        dashboard.put("statusBreakdown", statusBreakdown);
        dashboard.put("tasksPerUser", tasksPerUser);
        dashboard.put("teamWorkload", tasksPerUser);
        dashboard.put("upcomingDeadlines", upcomingDeadlines);
        dashboard.put("myUpcomingTasks", myUpcomingTasks);
        dashboard.put("recentActivity", recentActivity);
        dashboard.put("projectSummaries", projectSummaries);
        dashboard.put("taskTrend", taskTrend);
        dashboard.put("user", userInfo);

        return dashboard;
    }
}