package com.dataintelligence.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.Map;

/**
 * Ultra-lightweight public health check endpoint for uptime monitoring (e.g. UptimeRobot)
 * and container keep-alive pings.
 *
 * Performs zero database or I/O operations and requires no authentication.
 */
@RestController
public class HealthController {

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Collections.singletonMap("status", "ok"));
    }
}
