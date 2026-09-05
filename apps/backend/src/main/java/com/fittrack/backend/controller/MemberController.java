package com.fittrack.backend.controller;

import com.fittrack.backend.dto.common.ApiResponse;
import com.fittrack.backend.dto.CreateMemberRequest;
import com.fittrack.backend.dto.MemberDTO;
import com.fittrack.backend.dto.common.PaginatedResponse;
import com.fittrack.backend.service.MemberService;
import com.fittrack.backend.util.AuthenticationContextHelper;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
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

@RestController
@RequestMapping("/api/members")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN','TRAINER','RECEPTIONIST')")
public class MemberController {

    private final MemberService memberService;
    private final AuthenticationContextHelper authContextHelper;

    @PostMapping
    public ResponseEntity<ApiResponse<MemberDTO>> createMember(
        @Valid @RequestBody CreateMemberRequest request,
        Authentication authentication) {
        Long orgId = authContextHelper.getOrganizationId(authentication);
        Long branchId = authContextHelper.getBranchId(authentication);
        MemberDTO member = memberService.createMember(orgId, branchId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Member created successfully", member));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MemberDTO>> getMember(
        @PathVariable Long id,
        Authentication authentication) {
        Long orgId = authContextHelper.getOrganizationId(authentication);
        // Verify that the member belongs to the user's organization
         MemberDTO member = memberService.getMember(id);
         if (!member.getOrganizationId().equals(orgId)) {
             return ResponseEntity.status(HttpStatus.FORBIDDEN)
                 .body(ApiResponse.error("FORBIDDEN", "You do not have permission to access this member"));
         }
        return ResponseEntity.ok(ApiResponse.success(member));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PaginatedResponse<MemberDTO>>> listMembers(
        Authentication authentication,
        Pageable pageable) {
        Long orgId = authContextHelper.getOrganizationId(authentication);
        Long branchId = authContextHelper.getBranchId(authentication);
        Page<MemberDTO> page = memberService.listMembers(orgId, branchId, pageable);
        PaginatedResponse<MemberDTO> response = PaginatedResponse.<MemberDTO>builder()
            .content(page.getContent())
            .page(page.getNumber())
            .pageSize(page.getSize())
            .totalElements(page.getTotalElements())
            .totalPages(page.getTotalPages())
            .hasNext(page.hasNext())
            .hasPrevious(page.hasPrevious())
            .build();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<PaginatedResponse<MemberDTO>>> searchMembers(
        @RequestParam String query,
        Authentication authentication,
        Pageable pageable) {
        Long orgId = authContextHelper.getOrganizationId(authentication);
        Page<MemberDTO> page = memberService.searchMembers(orgId, query, pageable);
        PaginatedResponse<MemberDTO> response = PaginatedResponse.<MemberDTO>builder()
            .content(page.getContent())
            .page(page.getNumber())
            .pageSize(page.getSize())
            .totalElements(page.getTotalElements())
            .totalPages(page.getTotalPages())
            .hasNext(page.hasNext())
            .hasPrevious(page.hasPrevious())
            .build();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<MemberDTO>> updateMember(
        @PathVariable Long id,
        @Valid @RequestBody CreateMemberRequest request,
        Authentication authentication) {
        Long orgId = authContextHelper.getOrganizationId(authentication);
         // Verify member belongs to user's organization
         MemberDTO existingMember = memberService.getMember(id);
         if (!existingMember.getOrganizationId().equals(orgId)) {
             return ResponseEntity.status(HttpStatus.FORBIDDEN)
                 .body(ApiResponse.error("FORBIDDEN", "You do not have permission to update this member"));
         }
        MemberDTO member = memberService.updateMember(id, request);
        return ResponseEntity.ok(ApiResponse.success("Member updated successfully", member));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteMember(
        @PathVariable Long id,
        Authentication authentication) {
        Long orgId = authContextHelper.getOrganizationId(authentication);
         // Verify member belongs to user's organization
         MemberDTO member = memberService.getMember(id);
         if (!member.getOrganizationId().equals(orgId)) {
             return ResponseEntity.status(HttpStatus.FORBIDDEN)
                 .body(ApiResponse.error("FORBIDDEN", "You do not have permission to delete this member"));
         }
        memberService.deleteMember(id);
        return ResponseEntity.ok(ApiResponse.success("Member deleted successfully", null));
    }
}


