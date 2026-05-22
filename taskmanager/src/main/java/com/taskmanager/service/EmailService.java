package com.taskmanager.service;

import lombok.extern.slf4j.Slf4j;
import okhttp3.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class EmailService {

    @Value("${brevo.api.key}")
    private String brevoApiKey;

    @Value("${brevo.sender.email}")
    private String senderEmail;

    @Value("${brevo.sender.name}")
    private String senderName;

    @Value("${app.url}")
    private String appUrl;

    private static final OkHttpClient client = new OkHttpClient();
    private static final MediaType JSON = MediaType.get("application/json; charset=utf-8");

    // ───────────── Core send method ─────────────
    private void sendEmail(String toEmail, String subject, String htmlContent) {
        String json = "{"
                + "\"sender\":{\"name\":\"" + senderName + "\",\"email\":\"" + senderEmail + "\"},"
                + "\"to\":[{\"email\":\"" + toEmail + "\"}],"
                + "\"subject\":\"" + subject + "\","
                + "\"htmlContent\":\"" + htmlContent.replace("\"", "\\\"").replace("\n", "") + "\""
                + "}";

        RequestBody body = RequestBody.create(json, JSON);
        Request request = new Request.Builder()
                .url("https://api.brevo.com/v3/smtp/email")
                .post(body)
                .addHeader("api-key", brevoApiKey)
                .addHeader("Content-Type", "application/json")
                .build();

        try (Response response = client.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                String resp = response.body() != null ? response.body().string() : "no body";
                log.error("Brevo API error {}: {}", response.code(), resp);
                throw new RuntimeException("Failed to send email.");
            }
            log.info("Email sent to {}", toEmail);
        } catch (Exception e) {
            log.error("Email send failed to {}: {}", toEmail, e.getMessage());
            throw new RuntimeException("Failed to send email. Please try again.");
        }
    }

    // ───────────── OTP Email ─────────────
    @Async
    public void sendOtpEmail(String toEmail, String otp, String purpose) {
        if ("signup".equals(purpose)) {
            sendEmail(toEmail,
                    "Verify your email – 5Mart W0rk",
                    buildSignupOtpHtml(otp));
        } else {
            sendEmail(toEmail,
                    "Reset your password – 5Mart W0rk",
                    buildResetOtpHtml(otp));
        }
    }

    // ───────────── Member Added Email ─────────────
    @Async
    public void sendMemberAddedEmail(String toEmail, String memberName, String projectName) {
        sendEmail(toEmail,
                "You've been added to project: " + projectName,
                buildMemberAddedHtml(memberName, projectName));
    }

    // ───────────── Invite Email ─────────────
    @Async
    public void sendInviteEmail(String toEmail, String invitedByName,
                                String projectName, String inviteLink) {
        sendEmail(toEmail,
                invitedByName + " invited you to join: " + projectName,
                buildInviteHtml(invitedByName, projectName, inviteLink));
    }

    // ───────────── Task Assigned Email ─────────────
    @Async
    public void sendTaskAssignedEmail(String toEmail, String memberName, String taskTitle,
                                      String taskDescription, String projectName,
                                      String dueDate, String priority) {
        sendEmail(toEmail,
                "New task assigned to you: " + taskTitle,
                buildTaskAssignedHtml(memberName, taskTitle,
                        taskDescription, projectName, dueDate, priority));
    }

    // ───────────── HTML Builders ─────────────
    private String buildSignupOtpHtml(String otp) {
        return "<div style='font-family:Segoe UI,sans-serif;max-width:500px;margin:auto;border-radius:12px;overflow:hidden;'>"
                + "<div style='background:linear-gradient(135deg,#667eea,#764ba2);padding:35px;text-align:center;'>"
                + "<h1 style='color:white;margin:0;font-size:24px;'>⚡ 5Mart W0rk</h1>"
                + "<p style='color:rgba(255,255,255,0.85);margin:6px 0 0;'>Team Task Manager</p></div>"
                + "<div style='background:white;padding:35px;'>"
                + "<h2 style='color:#333;margin-top:0;'>Verify your email</h2>"
                + "<p style='color:#555;line-height:1.7;'>Your verification OTP is:</p>"
                + "<div style='font-size:38px;font-weight:bold;letter-spacing:10px;color:#667eea;"
                + "text-align:center;padding:20px;background:#f0f4ff;border-radius:10px;margin:20px 0;'>" + otp + "</div>"
                + "<p style='color:#999;font-size:13px;'>Valid for <strong>10 minutes</strong>. Do not share with anyone.</p></div>"
                + "<div style='background:#f8faff;padding:15px;text-align:center;color:#999;font-size:12px;'>© 2026 5Mart W0rk</div></div>";
    }

    private String buildResetOtpHtml(String otp) {
        return "<div style='font-family:Segoe UI,sans-serif;max-width:500px;margin:auto;border-radius:12px;overflow:hidden;'>"
                + "<div style='background:linear-gradient(135deg,#ff4d4f,#ff7875);padding:35px;text-align:center;'>"
                + "<h1 style='color:white;margin:0;font-size:24px;'>⚡ 5Mart W0rk</h1>"
                + "<p style='color:rgba(255,255,255,0.85);margin:6px 0 0;'>Password Reset</p></div>"
                + "<div style='background:white;padding:35px;'>"
                + "<h2 style='color:#333;margin-top:0;'>Reset your password</h2>"
                + "<p style='color:#555;line-height:1.7;'>Your password reset OTP is:</p>"
                + "<div style='font-size:38px;font-weight:bold;letter-spacing:10px;color:#ff4d4f;"
                + "text-align:center;padding:20px;background:#fff1f0;border-radius:10px;margin:20px 0;'>" + otp + "</div>"
                + "<p style='color:#999;font-size:13px;'>Valid for <strong>10 minutes</strong>. If you did not request this, ignore.</p></div>"
                + "<div style='background:#f8faff;padding:15px;text-align:center;color:#999;font-size:12px;'>© 2026 5Mart W0rk</div></div>";
    }

    private String buildMemberAddedHtml(String name, String projectName) {
        return "<div style='font-family:Segoe UI,sans-serif;max-width:500px;margin:auto;border-radius:12px;overflow:hidden;'>"
                + "<div style='background:linear-gradient(135deg,#667eea,#764ba2);padding:35px;text-align:center;'>"
                + "<h1 style='color:white;margin:0;font-size:24px;'>⚡ 5Mart W0rk</h1></div>"
                + "<div style='background:white;padding:35px;'>"
                + "<h2 style='color:#333;margin-top:0;'>Hello, " + name + "! 👋</h2>"
                + "<p style='color:#555;'>You have been added as a member to: <strong>" + projectName + "</strong></p>"
                + "<div style='text-align:center;margin:25px 0;'>"
                + "<a href='" + appUrl + "/login' style='background:linear-gradient(135deg,#667eea,#764ba2);color:white;"
                + "padding:13px 32px;border-radius:8px;text-decoration:none;font-weight:600;'>Open Dashboard →</a></div></div>"
                + "<div style='background:#f8faff;padding:15px;text-align:center;color:#999;font-size:12px;'>© 2026 5Mart W0rk</div></div>";
    }

    private String buildInviteHtml(String invitedByName, String projectName, String inviteLink) {
        return "<div style='font-family:Segoe UI,sans-serif;max-width:500px;margin:auto;border-radius:12px;overflow:hidden;'>"
                + "<div style='background:linear-gradient(135deg,#667eea,#764ba2);padding:35px;text-align:center;'>"
                + "<h1 style='color:white;margin:0;font-size:24px;'>⚡ 5Mart W0rk</h1></div>"
                + "<div style='background:white;padding:35px;'>"
                + "<h2 style='color:#333;margin-top:0;'>You're invited! 🎉</h2>"
                + "<p style='color:#555;'><strong>" + invitedByName + "</strong> invited you to join: <strong>" + projectName + "</strong></p>"
                + "<div style='text-align:center;margin:25px 0;'>"
                + "<a href='" + inviteLink + "' style='background:linear-gradient(135deg,#667eea,#764ba2);color:white;"
                + "padding:13px 32px;border-radius:8px;text-decoration:none;font-weight:600;'>Accept Invitation →</a></div>"
                + "<p style='color:#999;font-size:13px;text-align:center;'>This invitation expires in 7 days.</p></div>"
                + "<div style='background:#f8faff;padding:15px;text-align:center;color:#999;font-size:12px;'>© 2026 5Mart W0rk</div></div>";
    }

    private String buildTaskAssignedHtml(String name, String taskTitle, String taskDescription,
                                          String projectName, String dueDate, String priority) {
        String priorityColor = switch (priority != null ? priority : "MEDIUM") {
            case "HIGH" -> "#ff4d4f";
            case "LOW" -> "#52c41a";
            default -> "#faad14";
        };
        return "<div style='font-family:Segoe UI,sans-serif;max-width:500px;margin:auto;border-radius:12px;overflow:hidden;'>"
                + "<div style='background:linear-gradient(135deg,#667eea,#764ba2);padding:35px;text-align:center;'>"
                + "<h1 style='color:white;margin:0;font-size:24px;'>⚡ 5Mart W0rk</h1></div>"
                + "<div style='background:white;padding:35px;'>"
                + "<h2 style='color:#333;margin-top:0;'>Hello, " + name + "! 📋</h2>"
                + "<p style='color:#555;'>New task assigned: <strong>" + taskTitle + "</strong></p>"
                + "<p style='color:#666;'>" + (taskDescription != null ? taskDescription : "No description") + "</p>"
                + "<p style='color:#555;'>Project: <strong>" + projectName + "</strong> | Priority: "
                + "<strong style='color:" + priorityColor + ";'>" + (priority != null ? priority : "MEDIUM") + "</strong>"
                + " | Due: " + (dueDate != null ? dueDate : "No due date") + "</p>"
                + "<div style='text-align:center;margin:25px 0;'>"
                + "<a href='" + appUrl + "/tasks' style='background:linear-gradient(135deg,#667eea,#764ba2);color:white;"
                + "padding:13px 32px;border-radius:8px;text-decoration:none;font-weight:600;'>View My Tasks →</a></div></div>"
                + "<div style='background:#f8faff;padding:15px;text-align:center;color:#999;font-size:12px;'>© 2026 5Mart W0rk</div></div>";
    }
}