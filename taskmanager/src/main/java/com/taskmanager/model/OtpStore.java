package com.taskmanager.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@Document(collection = "otp_store")
public class OtpStore {

    @Id
    private String id;

    @Indexed(unique = true)
    private String email;

    private String otp;

    private String purpose; // "signup" or "reset"

    private boolean verified = false;

    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(10);

    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiresAt);
    }
}
