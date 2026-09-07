package com.fittrack.backend.service;

import com.fittrack.backend.dto.ExpenseDTO;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ExpenseService {
    ExpenseDTO createExpense(Long organizationId, ExpenseDTO request);
    ExpenseDTO getExpense(Long expenseId);
    Page<ExpenseDTO> listExpenses(Long organizationId, Pageable pageable);
    Page<ExpenseDTO> listExpensesByCategory(Long organizationId, Long categoryId, Pageable pageable);
    Page<ExpenseDTO> filterByDateRange(Long organizationId, LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);
    BigDecimal getTotalExpenses(Long organizationId, LocalDateTime startDate, LocalDateTime endDate);
    ExpenseDTO updateExpense(Long expenseId, ExpenseDTO request);
    void deleteExpense(Long expenseId);
}

