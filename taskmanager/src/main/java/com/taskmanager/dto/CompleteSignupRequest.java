package com.taskmanager.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CompleteSignupRequest {
    @Email
    @NotBlank
    private String email;

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;
}
