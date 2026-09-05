package com.fittrack.backend.service;

import com.fittrack.backend.dto.DashboardResponse;

public interface DashboardService {
    DashboardResponse getDashboard(String email);
}

