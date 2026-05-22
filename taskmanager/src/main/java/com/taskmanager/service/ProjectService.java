package com.taskmanager.service;

import com.taskmanager.dto.ProjectRequest;
import com.taskmanager.model.Invitation;
import com.taskmanager.model.Project;
import com.taskmanager.model.User;
import com.taskmanager.repository.InvitationRepository;
import com.taskmanager.repository.ProjectRepository;
import com.taskmanager.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final InvitationRepository invitationRepository;

    @Value("${app.url}")
    private String appUrl;

    public Project createProject(ProjectRequest request, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Project project = new Project();
        project.setName(request.getName());
        project.setDescription(request.getDescription());
        project.setCreatedBy(user.getId());

        Project.ProjectMember member = new Project.ProjectMember();
        member.setUserId(user.getId());
        member.setName(user.getName());
        member.setEmail(user.getEmail());
        member.setRole("ADMIN");
        project.getMembers().add(member);

        return projectRepository.save(project);
    }

    public List<Project> getMyProjects(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return projectRepository.findByMembersUserId(user.getId());
    }

    public Project addMember(String projectId, String memberEmail, String requesterEmail) {
        User requester = userRepository.findByEmail(requesterEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        // Admin check
        boolean isAdmin = project.getMembers().stream()
                .anyMatch(m -> m.getUserId().equals(requester.getId())
                        && m.getRole().equals("ADMIN"));
        if (!isAdmin) throw new RuntimeException("Only admin can add members");

        // Already member check
        boolean alreadyMember = project.getMembers().stream()
                .anyMatch(m -> m.getEmail().equals(memberEmail));
        if (alreadyMember) throw new RuntimeException("User already a member");

        // Case 1: User registered hai — seedha add karo
        Optional<User> existingUser = userRepository.findByEmail(memberEmail);
        if (existingUser.isPresent()) {
            User newMember = existingUser.get();
            Project.ProjectMember member = new Project.ProjectMember();
            member.setUserId(newMember.getId());
            member.setName(newMember.getName());
            member.setEmail(newMember.getEmail());
            member.setRole("MEMBER");
            project.getMembers().add(member);
            Project saved = projectRepository.save(project);

            emailService.sendMemberAddedEmail(
                    newMember.getEmail(),
                    newMember.getName(),
                    project.getName()
            );
            return saved;
        }

        // Case 2: User registered nahi hai — invite email bhejo
        invitationRepository.findByInvitedEmailAndProjectId(memberEmail, projectId)
                .ifPresent(invitationRepository::delete);

        String token = UUID.randomUUID().toString();
        Invitation invitation = new Invitation();
        invitation.setProjectId(projectId);
        invitation.setProjectName(project.getName());
        invitation.setInvitedEmail(memberEmail);
        invitation.setInvitedByName(requester.getName());
        invitation.setToken(token);
        invitationRepository.save(invitation);

        String inviteLink = appUrl + "/accept-invite?token=" + token;
        emailService.sendInviteEmail(memberEmail, requester.getName(), project.getName(), inviteLink);

        return project;
    }

    public Project removeMember(String projectId, String memberEmail, String requesterEmail) {
        User requester = userRepository.findByEmail(requesterEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        boolean isAdmin = project.getMembers().stream()
                .anyMatch(m -> m.getUserId().equals(requester.getId())
                        && m.getRole().equals("ADMIN"));
        if (!isAdmin) throw new RuntimeException("Only admin can remove members");

        project.getMembers().removeIf(m -> m.getEmail().equals(memberEmail));
        return projectRepository.save(project);
    }
}