package com.fittrack.backend.service.impl;

import com.fittrack.backend.dto.ExpenseDTO;
import com.fittrack.backend.entity.Expense;
import com.fittrack.backend.entity.ExpenseCategory;
import com.fittrack.backend.entity.Organization;
import com.fittrack.backend.exception.ResourceNotFoundException;
import com.fittrack.backend.repository.ExpenseCategoryRepository;
import com.fittrack.backend.repository.ExpenseRepository;
import com.fittrack.backend.repository.OrganizationRepository;
import com.fittrack.backend.service.ExpenseService;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class ExpenseServiceImpl implements ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final ExpenseCategoryRepository categoryRepository;
    private final OrganizationRepository organizationRepository;

    @Override
    public ExpenseDTO createExpense(Long organizationId, ExpenseDTO request) {
        Organization org = organizationRepository.findById(organizationId)
            .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));

        ExpenseCategory category = categoryRepository.findById(request.getExpenseCategoryId())
            .orElseThrow(() -> new ResourceNotFoundException("Expense category not found"));

        Expense expense = new Expense();
        expense.setOrganization(org);
        expense.setExpenseCategory(category);
        expense.setDescription(request.getDescription());
        expense.setAmount(request.getAmount());
        expense.setExpenseDate(request.getExpenseDate() != null ? request.getExpenseDate() : LocalDateTime.now());
        expense.setPaymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : "CASH");
        expense.setReferenceNumber(request.getReferenceNumber());
        expense.setNotes(request.getNotes());
        expense.setReceiptUrl(request.getReceiptUrl());
        expense.setIsRecurring(request.getIsRecurring() != null ? request.getIsRecurring() : false);
        expense.setRecurrencePattern(request.getRecurrencePattern());

        Expense saved = expenseRepository.save(expense);
        return toDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public ExpenseDTO getExpense(Long expenseId) {
        Expense expense = expenseRepository.findById(expenseId)
            .orElseThrow(() -> new ResourceNotFoundException("Expense not found"));
        return toDTO(expense);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ExpenseDTO> listExpenses(Long organizationId, Pageable pageable) {
        return expenseRepository.findByOrganizationId(organizationId, pageable)
            .map(this::toDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ExpenseDTO> listExpensesByCategory(Long organizationId, Long categoryId, Pageable pageable) {
        return expenseRepository.findByOrganizationIdAndExpenseCategoryId(organizationId, categoryId, pageable)
            .map(this::toDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ExpenseDTO> filterByDateRange(Long organizationId, LocalDateTime startDate, LocalDateTime endDate, Pageable pageable) {
        return expenseRepository.findByOrganizationIdAndDateRange(organizationId, startDate, endDate, pageable)
            .map(this::toDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public BigDecimal getTotalExpenses(Long organizationId, LocalDateTime startDate, LocalDateTime endDate) {
        return expenseRepository.calculateTotalExpenses(organizationId, startDate, endDate);
    }

    @Override
    public ExpenseDTO updateExpense(Long expenseId, ExpenseDTO request) {
        Expense expense = expenseRepository.findById(expenseId)
            .orElseThrow(() -> new ResourceNotFoundException("Expense not found"));

        expense.setDescription(request.getDescription());
        expense.setAmount(request.getAmount());
        expense.setExpenseDate(request.getExpenseDate());
        expense.setPaymentMethod(request.getPaymentMethod());
        expense.setReferenceNumber(request.getReferenceNumber());
        expense.setNotes(request.getNotes());

        Expense updated = expenseRepository.save(expense);
        return toDTO(updated);
    }

    @Override
    public void deleteExpense(Long expenseId) {
        Expense expense = expenseRepository.findById(expenseId)
            .orElseThrow(() -> new ResourceNotFoundException("Expense not found"));
        expense.setActive(false);
        expenseRepository.save(expense);
    }

    private ExpenseDTO toDTO(Expense expense) {
        return ExpenseDTO.builder()
            .id(expense.getId())
            .organizationId(expense.getOrganization() != null ? expense.getOrganization().getId() : null)
            .branchId(expense.getBranch() != null ? expense.getBranch().getId() : null)
            .expenseCategoryId(expense.getExpenseCategory() != null ? expense.getExpenseCategory().getId() : null)
            .categoryName(expense.getExpenseCategory() != null ? expense.getExpenseCategory().getCategoryName() : null)
            .description(expense.getDescription())
            .amount(expense.getAmount())
            .expenseDate(expense.getExpenseDate())
            .paymentMethod(expense.getPaymentMethod())
            .referenceNumber(expense.getReferenceNumber())
            .recordedById(expense.getRecordedBy() != null ? expense.getRecordedBy().getId() : null)
            .recordedByName(expense.getRecordedBy() != null ? expense.getRecordedBy().getFullName() : null)
            .notes(expense.getNotes())
            .receiptUrl(expense.getReceiptUrl())
            .isRecurring(expense.getIsRecurring())
            .recurrencePattern(expense.getRecurrencePattern())
            .createdAt(expense.getCreatedAt())
            .updatedAt(expense.getUpdatedAt())
            .build();
    }
}

