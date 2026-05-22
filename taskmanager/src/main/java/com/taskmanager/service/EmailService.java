package com.taskmanager.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import jakarta.mail.internet.MimeMessage;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from}")
    private String fromEmail;

    @Value("${app.url}")
    private String appUrl;

    @Async
    public void sendOtpEmail(String toEmail, String otp, String purpose) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            if ("signup".equals(purpose)) {
                helper.setSubject("Verify your email – 5Mart W0rk");
                helper.setText(buildSignupOtpHtml(otp), true);
            } else {
                helper.setSubject("Reset your password – 5Mart W0rk");
                helper.setText(buildResetOtpHtml(otp), true);
            }
            mailSender.send(message);
            log.info("OTP email sent to {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send OTP email to {}: {}", toEmail, e.getMessage());
            throw new RuntimeException("Failed to send email. Please try again.");
        }
    }

    @Async
    public void sendMemberAddedEmail(String toEmail, String memberName, String projectName) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("You've been added to project: " + projectName);
            helper.setText(buildMemberAddedHtml(memberName, projectName), true);
            mailSender.send(message);
            log.info("Member added email sent to {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send member email to {}: {}", toEmail, e.getMessage());
        }
    }

    @Async
    public void sendInviteEmail(String toEmail, String invitedByName,
                                String projectName, String inviteLink) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject(invitedByName + " invited you to join: " + projectName);
            helper.setText(buildInviteHtml(invitedByName, projectName, inviteLink), true);
            mailSender.send(message);
            log.info("Invite email sent to {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send invite email to {}: {}", toEmail, e.getMessage());
        }
    }

    @Async
    public void sendTaskAssignedEmail(String toEmail, String memberName, String taskTitle,
                                      String taskDescription, String projectName,
                                      String dueDate, String priority) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("New task assigned to you: " + taskTitle);
            helper.setText(buildTaskAssignedHtml(memberName, taskTitle,
                    taskDescription, projectName, dueDate, priority), true);
            mailSender.send(message);
            log.info("Task assigned email sent to {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send task email to {}: {}", toEmail, e.getMessage());
        }
    }

    private String buildSignupOtpHtml(String otp) {
        return """
            <div style="font-family:Segoe UI,sans-serif;max-width:500px;margin:auto;border-radius:12px;overflow:hidden;">
              <div style="background:linear-gradient(135deg,#667eea,#764ba2);padding:35px;text-align:center;">
                <h1 style="color:white;margin:0;font-size:24px;">⚡ 5Mart W0rk</h1>
                <p style="color:rgba(255,255,255,0.85);margin:6px 0 0;">Team Task Manager</p>
              </div>
              <div style="background:white;padding:35px;">
                <h2 style="color:#333;margin-top:0;">Verify your email</h2>
                <p style="color:#555;line-height:1.7;">Your verification OTP is:</p>
                <div style="font-size:38px;font-weight:bold;letter-spacing:10px;color:#667eea;
                            text-align:center;padding:20px;background:#f0f4ff;border-radius:10px;margin:20px 0;">
                  %s
                </div>
                <p style="color:#999;font-size:13px;">Valid for <strong>10 minutes</strong>. Do not share with anyone.</p>
              </div>
              <div style="background:#f8faff;padding:15px;text-align:center;color:#999;font-size:12px;">
                © 2026 5Mart W0rk
              </div>
            </div>""".formatted(otp);
    }

    private String buildResetOtpHtml(String otp) {
        return """
            <div style="font-family:Segoe UI,sans-serif;max-width:500px;margin:auto;border-radius:12px;overflow:hidden;">
              <div style="background:linear-gradient(135deg,#ff4d4f,#ff7875);padding:35px;text-align:center;">
                <h1 style="color:white;margin:0;font-size:24px;">⚡ 5Mart W0rk</h1>
                <p style="color:rgba(255,255,255,0.85);margin:6px 0 0;">Password Reset</p>
              </div>
              <div style="background:white;padding:35px;">
                <h2 style="color:#333;margin-top:0;">Reset your password</h2>
                <p style="color:#555;line-height:1.7;">Your password reset OTP is:</p>
                <div style="font-size:38px;font-weight:bold;letter-spacing:10px;color:#ff4d4f;
                            text-align:center;padding:20px;background:#fff1f0;border-radius:10px;margin:20px 0;">
                  %s
                </div>
                <p style="color:#999;font-size:13px;">Valid for <strong>10 minutes</strong>. If you didn't request this, ignore.</p>
              </div>
              <div style="background:#f8faff;padding:15px;text-align:center;color:#999;font-size:12px;">
                © 2026 5Mart W0rk
              </div>
            </div>""".formatted(otp);
    }

    private String buildMemberAddedHtml(String name, String projectName) {
        return """
            <div style="font-family:Segoe UI,sans-serif;max-width:500px;margin:auto;border-radius:12px;overflow:hidden;">
              <div style="background:linear-gradient(135deg,#667eea,#764ba2);padding:35px;text-align:center;">
                <h1 style="color:white;margin:0;font-size:24px;">⚡ 5Mart W0rk</h1>
                <p style="color:rgba(255,255,255,0.85);margin:6px 0 0;">Team Task Manager</p>
              </div>
              <div style="background:white;padding:35px;">
                <h2 style="color:#333;margin-top:0;">Hello, %s! 👋</h2>
                <p style="color:#555;line-height:1.7;">You have been added as a member to:</p>
                <div style="background:#f0f4ff;border-left:4px solid #667eea;padding:15px 20px;border-radius:6px;margin:20px 0;">
                  <strong style="color:#333;font-size:18px;">📁 %s</strong>
                </div>
                <p style="color:#555;line-height:1.7;">Login to view your tasks and collaborate with your team.</p>
                <div style="text-align:center;margin:25px 0;">
                  <a href="%s/login" style="background:linear-gradient(135deg,#667eea,#764ba2);color:white;
                     padding:13px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;">
                    Open Dashboard →
                  </a>
                </div>
              </div>
              <div style="background:#f8faff;padding:15px;text-align:center;color:#999;font-size:12px;">
                © 2026 5Mart W0rk
              </div>
            </div>""".formatted(name, projectName, appUrl);
    }

    private String buildInviteHtml(String invitedByName, String projectName, String inviteLink) {
        return """
            <div style="font-family:Segoe UI,sans-serif;max-width:500px;margin:auto;border-radius:12px;overflow:hidden;">
              <div style="background:linear-gradient(135deg,#667eea,#764ba2);padding:35px;text-align:center;">
                <h1 style="color:white;margin:0;font-size:24px;">⚡ 5Mart W0rk</h1>
                <p style="color:rgba(255,255,255,0.85);margin:6px 0 0;">Team Invitation</p>
              </div>
              <div style="background:white;padding:35px;">
                <h2 style="color:#333;margin-top:0;">You're invited! 🎉</h2>
                <p style="color:#555;line-height:1.7;"><strong>%s</strong> has invited you to join:</p>
                <div style="background:#f0f4ff;border-left:4px solid #667eea;padding:15px 20px;border-radius:6px;margin:20px 0;">
                  <strong style="color:#333;font-size:18px;">📁 %s</strong>
                </div>
                <p style="color:#555;line-height:1.7;">Click below to accept the invitation and join the team.</p>
                <div style="text-align:center;margin:25px 0;">
                  <a href="%s" style="background:linear-gradient(135deg,#667eea,#764ba2);color:white;
                     padding:13px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;">
                    Accept Invitation →
                  </a>
                </div>
                <p style="color:#999;font-size:13px;text-align:center;">This invitation expires in 7 days.</p>
              </div>
              <div style="background:#f8faff;padding:15px;text-align:center;color:#999;font-size:12px;">
                © 2026 5Mart W0rk
              </div>
            </div>""".formatted(invitedByName, projectName, inviteLink);
    }

    private String buildTaskAssignedHtml(String name, String taskTitle, String taskDescription,
                                          String projectName, String dueDate, String priority) {
        String priorityColor = switch (priority != null ? priority : "MEDIUM") {
            case "HIGH" -> "#ff4d4f";
            case "LOW" -> "#52c41a";
            default -> "#faad14";
        };
        return """
            <div style="font-family:Segoe UI,sans-serif;max-width:500px;margin:auto;border-radius:12px;overflow:hidden;">
              <div style="background:linear-gradient(135deg,#667eea,#764ba2);padding:35px;text-align:center;">
                <h1 style="color:white;margin:0;font-size:24px;">⚡ 5Mart W0rk</h1>
                <p style="color:rgba(255,255,255,0.85);margin:6px 0 0;">New Task Assigned</p>
              </div>
              <div style="background:white;padding:35px;">
                <h2 style="color:#333;margin-top:0;">Hello, %s! 📋</h2>
                <p style="color:#555;line-height:1.7;">A new task has been assigned to you:</p>
                <div style="background:#f8faff;border:1px solid #e8f0fe;border-radius:10px;padding:20px;margin:20px 0;">
                  <h3 style="color:#333;margin:0 0 10px;">%s</h3>
                  <p style="color:#666;margin:0 0 15px;line-height:1.6;">%s</p>
                  <div>
                    <span style="background:#f0f4ff;color:#667eea;padding:4px 12px;border-radius:20px;font-size:13px;margin-right:8px;">📁 %s</span>
                    <span style="background:#fff0f0;color:%s;padding:4px 12px;border-radius:20px;font-size:13px;font-weight:600;margin-right:8px;">⚡ %s</span>
                    <span style="background:#f0fff4;color:#52c41a;padding:4px 12px;border-radius:20px;font-size:13px;">📅 %s</span>
                  </div>
                </div>
                <div style="text-align:center;margin:25px 0;">
                  <a href="%s/tasks" style="background:linear-gradient(135deg,#667eea,#764ba2);color:white;
                     padding:13px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;">
                    View My Tasks →
                  </a>
                </div>
              </div>
              <div style="background:#f8faff;padding:15px;text-align:center;color:#999;font-size:12px;">
                © 2026 5Mart W0rk
              </div>
            </div>""".formatted(name, taskTitle,
                taskDescription != null ? taskDescription : "No description",
                projectName, priorityColor, priority != null ? priority : "MEDIUM",
                dueDate != null ? dueDate : "No due date", appUrl);
    }
}