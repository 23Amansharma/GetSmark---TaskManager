package com.taskmanager.service;

import com.taskmanager.dto.*;
import com.taskmanager.model.Invitation;
import com.taskmanager.model.OtpStore;
import com.taskmanager.model.Project;
import com.taskmanager.model.User;
import com.taskmanager.repository.InvitationRepository;
import com.taskmanager.repository.OtpRepository;
import com.taskmanager.repository.ProjectRepository;
import com.taskmanager.repository.UserRepository;
import com.taskmanager.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final OtpRepository otpRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final EmailService emailService;
    private final InvitationRepository invitationRepository;
    private final ProjectRepository projectRepository;

    private static final SecureRandom RANDOM = new SecureRandom();

    public void sendSignupOtp(String email) {
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email already registered. Please login.");
        }
        String otp = generateOtp();
        saveOtp(email, otp, "signup");
        emailService.sendOtpEmail(email, otp, "signup");
    }

    public void verifyOtp(String email, String otp, String purpose) {
        OtpStore store = otpRepository.findByEmailAndPurpose(email, purpose)
                .orElseThrow(() -> new RuntimeException("OTP not found. Please request a new one."));
        if (store.isExpired()) {
            otpRepository.delete(store);
            throw new RuntimeException("OTP has expired. Please request a new one.");
        }
        if (!store.getOtp().equals(otp)) {
            throw new RuntimeException("Invalid OTP. Please try again.");
        }
        store.setVerified(true);
        otpRepository.save(store);
    }

    public String completeSignup(CompleteSignupRequest request) {
        OtpStore store = otpRepository.findByEmailAndPurpose(request.getEmail(), "signup")
                .orElseThrow(() -> new RuntimeException("Please verify your email first."));
        if (!store.isVerified()) {
            throw new RuntimeException("Email not verified. Please verify OTP first.");
        }
        if (store.isExpired()) {
            otpRepository.delete(store);
            throw new RuntimeException("Session expired. Please start again.");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered.");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        userRepository.save(user);
        otpRepository.delete(store);

        // Pending invitations check — automatically project mein add karo
        List<Invitation> pendingInvites = invitationRepository
                .findAllByInvitedEmail(user.getEmail());
        for (Invitation inv : pendingInvites) {
            projectRepository.findById(inv.getProjectId()).ifPresent(project -> {
                boolean alreadyMember = project.getMembers().stream()
                        .anyMatch(m -> m.getEmail().equals(user.getEmail()));
                if (!alreadyMember) {
                    Project.ProjectMember member = new Project.ProjectMember();
                    member.setUserId(user.getId());
                    member.setName(user.getName());
                    member.setEmail(user.getEmail());
                    member.setRole("MEMBER");
                    project.getMembers().add(member);
                    projectRepository.save(project);
                }
            });
            invitationRepository.delete(inv);
        }

        return jwtUtil.generateToken(user.getEmail());
    }

    public String login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("No account found with this email."));
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Incorrect password. Please try again.");
        }

        // Login pe bhi pending invites check karo
        List<Invitation> pendingInvites = invitationRepository
                .findAllByInvitedEmail(user.getEmail());
        for (Invitation inv : pendingInvites) {
            projectRepository.findById(inv.getProjectId()).ifPresent(project -> {
                boolean alreadyMember = project.getMembers().stream()
                        .anyMatch(m -> m.getEmail().equals(user.getEmail()));
                if (!alreadyMember) {
                    Project.ProjectMember member = new Project.ProjectMember();
                    member.setUserId(user.getId());
                    member.setName(user.getName());
                    member.setEmail(user.getEmail());
                    member.setRole("MEMBER");
                    project.getMembers().add(member);
                    projectRepository.save(project);
                }
            });
            invitationRepository.delete(inv);
        }

        return jwtUtil.generateToken(user.getEmail());
    }

    public void sendResetOtp(String email) {
        if (!userRepository.existsByEmail(email)) {
            throw new RuntimeException("No account found with this email.");
        }
        String otp = generateOtp();
        saveOtp(email, otp, "reset");
        emailService.sendOtpEmail(email, otp, "reset");
    }

    public void resetPassword(ResetPasswordRequest request) {
        OtpStore store = otpRepository.findByEmailAndPurpose(request.getEmail(), "reset")
                .orElseThrow(() -> new RuntimeException("OTP not found. Please request a new one."));
        if (store.isExpired()) {
            otpRepository.delete(store);
            throw new RuntimeException("OTP has expired. Please request a new one.");
        }
        if (!store.getOtp().equals(request.getOtp())) {
            throw new RuntimeException("Invalid OTP. Please try again.");
        }
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found."));
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        otpRepository.delete(store);
    }

    private String generateOtp() {
        return String.format("%06d", RANDOM.nextInt(1_000_000));
    }

    private void saveOtp(String email, String otp, String purpose) {
        otpRepository.findByEmailAndPurpose(email, purpose)
                .ifPresent(otpRepository::delete);
        OtpStore store = new OtpStore();
        store.setEmail(email);
        store.setOtp(otp);
        store.setPurpose(purpose);
        store.setCreatedAt(LocalDateTime.now());
        store.setExpiresAt(LocalDateTime.now().plusMinutes(10));
        otpRepository.save(store);
    }
}