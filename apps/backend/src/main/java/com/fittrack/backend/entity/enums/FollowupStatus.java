package com.fittrack.backend.entity.enums;

public enum FollowupStatus {
    SCHEDULED("Scheduled"),
    COMPLETED("Completed"),
    PENDING("Pending"),
    CANCELLED("Cancelled"),
    RESCHEDULED("Rescheduled");

    private final String displayName;

    FollowupStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}

