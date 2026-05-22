package com.taskmanager.controller;

import com.taskmanager.dto.*;
import com.taskmanager.model.Invitation;
import com.taskmanager.model.Project;
import com.taskmanager.model.User;
import com.taskmanager.repository.InvitationRepository;
import com.taskmanager.repository.ProjectRepository;
import com.taskmanager.repository.UserRepository;
import com.taskmanager.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final InvitationRepository invitationRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(@RequestBody @Valid SendOtpRequest request) {
        authService.sendSignupOtp(request.getEmail());
        return ResponseEntity.ok(Map.of("message", "OTP sent to " + request.getEmail()));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody @Valid VerifyOtpRequest request) {
        authService.verifyOtp(request.getEmail(), request.getOtp(), request.getPurpose());
        return ResponseEntity.ok(Map.of("message", "OTP verified successfully"));
    }

    @PostMapping("/complete-signup")
    public ResponseEntity<?> completeSignup(@RequestBody @Valid CompleteSignupRequest request) {
        String token = authService.completeSignup(request);
        return ResponseEntity.ok(Map.of("token", token));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody @Valid LoginRequest request) {
        String token = authService.login(request);
        return ResponseEntity.ok(Map.of("token", token));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody @Valid SendOtpRequest request) {
        authService.sendResetOtp(request.getEmail());
        return ResponseEntity.ok(Map.of("message", "Reset OTP sent to " + request.getEmail()));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody @Valid ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(Map.of("message", "Password reset successful. Please login."));
    }

    // ✅ Invite info endpoint — shows project/inviter details before login
    @GetMapping("/invite-info")
    public ResponseEntity<?> getInviteInfo(@RequestParam String token) {
        Invitation inv = invitationRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid or expired invitation"));
        return ResponseEntity.ok(Map.of(
                "projectName", inv.getProjectName(),
                "invitedBy", inv.getInvitedByName(),
                "email", inv.getInvitedEmail()
        ));
    }

    // ✅ FIX 2: Accept invite endpoint — called after login/signup when inviteToken in localStorage
    @PostMapping("/accept-invite")
    public ResponseEntity<?> acceptInvite(
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserDetails userDetails) {

        String token = body.get("token");
        if (token == null || token.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Token is required"));
        }

        Invitation inv = invitationRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid or expired invitation link."));

        // Expiry check
        if (inv.getExpiresAt().isBefore(java.time.LocalDateTime.now())) {
            invitationRepository.delete(inv);
            return ResponseEntity.badRequest().body(Map.of("message", "Invitation has expired."));
        }

        // Accept only if logged-in user's email matches the invited email
        String loggedInEmail = userDetails.getUsername();
        if (!loggedInEmail.equalsIgnoreCase(inv.getInvitedEmail())) {
            return ResponseEntity.status(403).body(Map.of(
                "message", "This invitation was sent to " + inv.getInvitedEmail() + ". Please login with that email."
            ));
        }

        User user = userRepository.findByEmail(loggedInEmail)
                .orElseThrow(() -> new RuntimeException("User not found."));

        Project project = projectRepository.findById(inv.getProjectId())
                .orElseThrow(() -> new RuntimeException("Project not found."));

        // Check if already a member
        boolean alreadyMember = project.getMembers().stream()
                .anyMatch(m -> m.getEmail().equalsIgnoreCase(user.getEmail()));

        if (!alreadyMember) {
            Project.ProjectMember member = new Project.ProjectMember();
            member.setUserId(user.getId());
            member.setName(user.getName());
            member.setEmail(user.getEmail());
            member.setRole("MEMBER");
            project.getMembers().add(member);
            projectRepository.save(project);
        }

        // Mark as accepted and delete invitation
        inv.setAccepted(true);
        invitationRepository.delete(inv);

        return ResponseEntity.ok(Map.of(
            "message", "You have successfully joined: " + project.getName(),
            "projectName", project.getName(),
            "projectId", project.getId()
        ));
    }
}
