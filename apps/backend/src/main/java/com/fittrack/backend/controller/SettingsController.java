package com.fittrack.backend.controller;

import com.fittrack.backend.dto.AppSettingsResponse;
import com.fittrack.backend.dto.UpdateSettingsRequest;
import com.fittrack.backend.service.SettingsService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/settings")
@PreAuthorize("isAuthenticated()")
public class SettingsController {

    private final SettingsService settingsService;

    public SettingsController(SettingsService settingsService) {
        this.settingsService = settingsService;
    }

    @GetMapping
    public AppSettingsResponse get(Authentication authentication) {
        return settingsService.getSettings(authentication.getName());
    }

    @PutMapping
    public AppSettingsResponse update(Authentication authentication, @Valid @RequestBody UpdateSettingsRequest request) {
        return settingsService.updateSettings(authentication.getName(), request);
    }
}

