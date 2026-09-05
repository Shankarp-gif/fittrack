package com.fittrack.backend.service;

import com.fittrack.backend.dto.AppSettingsResponse;
import com.fittrack.backend.dto.UpdateSettingsRequest;

public interface SettingsService {
    AppSettingsResponse getSettings(String email);

    AppSettingsResponse updateSettings(String email, UpdateSettingsRequest request);
}

