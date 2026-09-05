package com.fittrack.backend.controller;

import com.fittrack.backend.dto.common.ApiResponse;
import com.fittrack.backend.dto.CreateMemberRequest;
import com.fittrack.backend.dto.MemberDTO;
import com.fittrack.backend.dto.common.PaginatedResponse;
import com.fittrack.backend.service.MemberService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
public class MemberController {

    private final MemberService memberService;
    private static final Long DEFAULT_ORG_ID = 1L;
    private static final Long DEFAULT_BRANCH_ID = 1L;

    @PostMapping
    public ResponseEntity<ApiResponse<MemberDTO>> createMember(@Valid @RequestBody CreateMemberRequest request) {
        MemberDTO member = memberService.createMember(DEFAULT_ORG_ID, DEFAULT_BRANCH_ID, request);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Member created successfully", member));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MemberDTO>> getMember(@PathVariable Long id) {
        MemberDTO member = memberService.getMember(id);
        return ResponseEntity.ok(ApiResponse.success(member));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PaginatedResponse<MemberDTO>>> listMembers(Pageable pageable) {
        Page<MemberDTO> page = memberService.listMembers(DEFAULT_ORG_ID, DEFAULT_BRANCH_ID, pageable);
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
        Pageable pageable) {
        Page<MemberDTO> page = memberService.searchMembers(DEFAULT_ORG_ID, query, pageable);
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
        @Valid @RequestBody CreateMemberRequest request) {
        MemberDTO member = memberService.updateMember(id, request);
        return ResponseEntity.ok(ApiResponse.success("Member updated successfully", member));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteMember(@PathVariable Long id) {
        memberService.deleteMember(id);
        return ResponseEntity.ok(ApiResponse.success("Member deleted successfully", null));
    }
}


