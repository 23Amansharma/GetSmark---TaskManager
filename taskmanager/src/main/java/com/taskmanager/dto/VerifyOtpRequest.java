package com.taskmanager.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class VerifyOtpRequest {
    @Email
    @NotBlank
    private String email;

    @NotBlank(message = "OTP is required")
    private String otp;

    @NotBlank(message = "Purpose is required")
    private String purpose; // "signup" or "reset"
}
