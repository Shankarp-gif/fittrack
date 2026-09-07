package com.fittrack.backend.entity.enums;

public enum LeadStatus {
    NEW("New Lead"),
    CONTACTED("Contact Made"),
    INTERESTED("Expressed Interest"),
    TRIAL("Trial Offered"),
    TRIAL_COMPLETED("Trial Completed"),
    CONVERTED("Converted to Member"),
    LOST("Lost Opportunity"),
    FOLLOW_UP_REQUIRED("Follow-up Needed");

    private final String displayName;

    LeadStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}

