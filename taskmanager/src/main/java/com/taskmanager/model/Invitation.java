package com.taskmanager.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "invitations")
public class Invitation {

    @Id
    private String id;

    private String projectId;
    private String projectName;
    private String invitedEmail;
    private String invitedByName;
    private String token;
    private boolean accepted = false;
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime expiresAt = LocalDateTime.now().plusDays(7);
}