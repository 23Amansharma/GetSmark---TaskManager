package com.taskmanager.controller;

import com.taskmanager.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping
    public ResponseEntity<?> getDashboard(
            @AuthenticationPrincipal UserDetails userDetails) {
        Map<String, Object> data = dashboardService.getDashboard(userDetails.getUsername());
        return ResponseEntity.ok(data);
    }
}