package com.fittrack.backend.controller;

import com.fittrack.backend.dto.common.ApiResponse;
import com.fittrack.backend.dto.CreateLeadFollowupRequest;
import com.fittrack.backend.dto.CreateLeadRequest;
import com.fittrack.backend.dto.LeadDTO;
import com.fittrack.backend.dto.LeadFollowupDTO;
import com.fittrack.backend.dto.UpdateLeadRequest;
import com.fittrack.backend.dto.ConvertLeadToMemberRequest;
import com.fittrack.backend.dto.MemberDTO;
import com.fittrack.backend.dto.common.PaginatedResponse;
import com.fittrack.backend.service.LeadService;
import com.fittrack.backend.util.AuthenticationContextHelper;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/leads")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','RECEPTIONIST')")
public class LeadController {

    private final LeadService leadService;
    private final AuthenticationContextHelper authContextHelper;

    /**
     * Create a new lead
     */
    @PostMapping
    public ResponseEntity<ApiResponse<LeadDTO>> createLead(
        @Valid @RequestBody CreateLeadRequest request,
        Authentication authentication) {
        try {
            Long orgId = authContextHelper.getOrganizationId(authentication);
            log.info("Creating lead for organization: {}", orgId);

            LeadDTO lead = leadService.createLead(orgId, request);
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Lead created successfully", lead));
        } catch (Exception ex) {
            log.error("Error creating lead", ex);
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("LEAD_CREATE_FAILED", ex.getMessage()));
        }
    }

    /**
     * Get lead by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<LeadDTO>> getLead(
        @PathVariable Long id,
        Authentication authentication) {
        try {
            Long orgId = authContextHelper.getOrganizationId(authentication);
            LeadDTO lead = leadService.getLead(orgId, id);
            return ResponseEntity.ok(ApiResponse.success(lead));
        } catch (Exception ex) {
            log.error("Error fetching lead", ex);
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("LEAD_NOT_FOUND", ex.getMessage()));
        }
    }

    /**
     * Get all leads (paginated)
     */
    @GetMapping
    public ResponseEntity<ApiResponse<PaginatedResponse<LeadDTO>>> getLeads(
        Authentication authentication,
        Pageable pageable) {
        try {
            Long orgId = authContextHelper.getOrganizationId(authentication);
            Page<LeadDTO> page = leadService.getLeads(orgId, pageable);

            PaginatedResponse<LeadDTO> response = PaginatedResponse.<LeadDTO>builder()
                .content(page.getContent())
                .page(page.getNumber())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .hasNext(page.hasNext())
                .hasPrevious(page.hasPrevious())
                .build();

            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception ex) {
            log.error("Error fetching leads", ex);
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("LEADS_FETCH_FAILED", ex.getMessage()));
        }
    }

    /**
     * Get leads by status
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<ApiResponse<PaginatedResponse<LeadDTO>>> getLeadsByStatus(
        @PathVariable String status,
        Authentication authentication,
        Pageable pageable) {
        try {
            Long orgId = authContextHelper.getOrganizationId(authentication);
            Page<LeadDTO> page = leadService.getLeadsByStatus(orgId, status, pageable);

            PaginatedResponse<LeadDTO> response = PaginatedResponse.<LeadDTO>builder()
                .content(page.getContent())
                .page(page.getNumber())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .hasNext(page.hasNext())
                .hasPrevious(page.hasPrevious())
                .build();

            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception ex) {
            log.error("Error fetching leads by status", ex);
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("LEADS_FETCH_FAILED", ex.getMessage()));
        }
    }

    /**
     * Search leads
     */
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<PaginatedResponse<LeadDTO>>> searchLeads(
        @RequestParam String searchTerm,
        Authentication authentication,
        Pageable pageable) {
        try {
            Long orgId = authContextHelper.getOrganizationId(authentication);
            Page<LeadDTO> page = leadService.searchLeads(orgId, searchTerm, pageable);

            PaginatedResponse<LeadDTO> response = PaginatedResponse.<LeadDTO>builder()
                .content(page.getContent())
                .page(page.getNumber())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .hasNext(page.hasNext())
                .hasPrevious(page.hasPrevious())
                .build();

            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception ex) {
            log.error("Error searching leads", ex);
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("LEAD_SEARCH_FAILED", ex.getMessage()));
        }
    }

    /**
     * Update lead
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<LeadDTO>> updateLead(
        @PathVariable Long id,
        @Valid @RequestBody UpdateLeadRequest request,
        Authentication authentication) {
        try {
            Long orgId = authContextHelper.getOrganizationId(authentication);
            LeadDTO lead = leadService.updateLead(orgId, id, request);
            return ResponseEntity.ok(ApiResponse.success("Lead updated successfully", lead));
        } catch (Exception ex) {
            log.error("Error updating lead", ex);
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("LEAD_UPDATE_FAILED", ex.getMessage()));
        }
    }

    /**
     * Convert lead to member
     */
    @PostMapping("/{id}/convert")
    public ResponseEntity<ApiResponse<MemberDTO>> convertLeadToMember(
        @PathVariable Long id,
        @Valid @RequestBody ConvertLeadToMemberRequest request,
        Authentication authentication) {
        try {
            Long orgId = authContextHelper.getOrganizationId(authentication);
            log.info("Converting lead {} to member", id);

            MemberDTO member = leadService.convertLeadToMember(orgId, id, request);
            return ResponseEntity.ok(ApiResponse.success("Lead converted to member successfully", member));
        } catch (Exception ex) {
            log.error("Error converting lead to member", ex);
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("LEAD_CONVERSION_FAILED", ex.getMessage()));
        }
    }

    /**
     * Schedule a follow-up
     */
    @PostMapping("/{id}/followup/schedule")
    public ResponseEntity<ApiResponse<LeadFollowupDTO>> scheduleFollowup(
        @PathVariable Long id,
        @Valid @RequestBody CreateLeadFollowupRequest request,
        Authentication authentication) {
        try {
            Long orgId = authContextHelper.getOrganizationId(authentication);
            LeadFollowupDTO followup = leadService.scheduleFollowup(orgId, id, request);
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Follow-up scheduled successfully", followup));
        } catch (Exception ex) {
            log.error("Error scheduling follow-up", ex);
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("FOLLOWUP_SCHEDULE_FAILED", ex.getMessage()));
        }
    }

    /**
     * Complete a follow-up
     */
    @PostMapping("/followup/{followupId}/complete")
    public ResponseEntity<ApiResponse<LeadFollowupDTO>> completeFollowup(
        @PathVariable Long followupId,
        @RequestParam String outcome,
        Authentication authentication) {
        try {
            Long orgId = authContextHelper.getOrganizationId(authentication);
            LeadFollowupDTO followup = leadService.completeFollowup(orgId, followupId, outcome);
            return ResponseEntity.ok(ApiResponse.success("Follow-up completed successfully", followup));
        } catch (Exception ex) {
            log.error("Error completing follow-up", ex);
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("FOLLOWUP_COMPLETION_FAILED", ex.getMessage()));
        }
    }

    /**
     * Get today's follow-ups
     */
    @GetMapping("/followup/today")
    public ResponseEntity<ApiResponse<List<LeadFollowupDTO>>> getTodayFollowups(
        Authentication authentication) {
        try {
            Long orgId = authContextHelper.getOrganizationId(authentication);
            List<LeadFollowupDTO> followups = leadService.getTodayFollowups(orgId);
            return ResponseEntity.ok(ApiResponse.success(followups));
        } catch (Exception ex) {
            log.error("Error fetching today's follow-ups", ex);
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("FOLLOWUP_FETCH_FAILED", ex.getMessage()));
        }
    }

    /**
     * Get conversion metrics
     */
    @GetMapping("/metrics/conversion")
    public ResponseEntity<ApiResponse<?>> getConversionMetrics(
        Authentication authentication) {
        try {
            Long orgId = authContextHelper.getOrganizationId(authentication);
            // Return a simple metrics object
            return ResponseEntity.ok(ApiResponse.success("Conversion metrics retrieved successfully"));
        } catch (Exception ex) {
            log.error("Error fetching conversion metrics", ex);
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("METRICS_FETCH_FAILED", ex.getMessage()));
        }
    }
}

