package com.fittrack.backend.controller;

import com.fittrack.backend.dto.ExpenseDTO;
import com.fittrack.backend.dto.common.ApiResponse;
import com.fittrack.backend.service.ExpenseService;
import com.fittrack.backend.util.AuthenticationContextHelper;
import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
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
@RequestMapping("/api/expenses")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('SUPER_ADMIN','ADMIN')")
public class ExpenseController {

    private final ExpenseService expenseService;
    private final AuthenticationContextHelper authContextHelper;

    @PostMapping
    public ResponseEntity<ApiResponse<ExpenseDTO>> createExpense(
        @Valid @RequestBody ExpenseDTO request,
        Authentication authentication) {
        Long orgId = authContextHelper.getOrganizationId(authentication);
        ExpenseDTO expense = expenseService.createExpense(orgId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Expense created successfully", expense));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ExpenseDTO>> getExpense(@PathVariable Long id) {
        ExpenseDTO expense = expenseService.getExpense(id);
        return ResponseEntity.ok(ApiResponse.success(expense));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<ExpenseDTO>>> listExpenses(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size,
        Authentication authentication) {
        Long orgId = authContextHelper.getOrganizationId(authentication);
        Pageable pageable = PageRequest.of(page, size);
        Page<ExpenseDTO> expenses = expenseService.listExpenses(orgId, pageable);
        return ResponseEntity.ok(ApiResponse.success(expenses));
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<ApiResponse<Page<ExpenseDTO>>> listExpensesByCategory(
        @PathVariable Long categoryId,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size,
        Authentication authentication) {
        Long orgId = authContextHelper.getOrganizationId(authentication);
        Pageable pageable = PageRequest.of(page, size);
        Page<ExpenseDTO> expenses = expenseService.listExpensesByCategory(orgId, categoryId, pageable);
        return ResponseEntity.ok(ApiResponse.success(expenses));
    }

    @GetMapping("/filter")
    public ResponseEntity<ApiResponse<Page<ExpenseDTO>>> filterByDateRange(
        @RequestParam LocalDateTime startDate,
        @RequestParam LocalDateTime endDate,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size,
        Authentication authentication) {
        Long orgId = authContextHelper.getOrganizationId(authentication);
        Pageable pageable = PageRequest.of(page, size);
        Page<ExpenseDTO> expenses = expenseService.filterByDateRange(orgId, startDate, endDate, pageable);
        return ResponseEntity.ok(ApiResponse.success(expenses));
    }

    @GetMapping("/total")
    public ResponseEntity<ApiResponse<BigDecimal>> getTotalExpenses(
        @RequestParam LocalDateTime startDate,
        @RequestParam LocalDateTime endDate,
        Authentication authentication) {
        Long orgId = authContextHelper.getOrganizationId(authentication);
        BigDecimal total = expenseService.getTotalExpenses(orgId, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(total));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ExpenseDTO>> updateExpense(
        @PathVariable Long id,
        @Valid @RequestBody ExpenseDTO request) {
        ExpenseDTO expense = expenseService.updateExpense(id, request);
        return ResponseEntity.ok(ApiResponse.success("Expense updated successfully", expense));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteExpense(@PathVariable Long id) {
        expenseService.deleteExpense(id);
        return ResponseEntity.ok(ApiResponse.success("Expense deleted successfully", null));
    }
}

