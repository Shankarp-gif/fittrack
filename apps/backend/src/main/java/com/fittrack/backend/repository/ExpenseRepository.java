package com.fittrack.backend.repository;

import com.fittrack.backend.entity.Expense;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    // Find by organization
    Page<Expense> findByOrganizationId(Long organizationId, Pageable pageable);

    // Find by organization and category
    Page<Expense> findByOrganizationIdAndExpenseCategoryId(Long organizationId, Long categoryId, Pageable pageable);

    // Find by date range
    @Query("SELECT e FROM Expense e WHERE e.organization.id = :orgId AND e.expenseDate >= :startDate AND e.expenseDate <= :endDate ORDER BY e.expenseDate DESC")
    Page<Expense> findByOrganizationIdAndDateRange(@Param("orgId") Long orgId, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate, Pageable pageable);

    // Calculate total expenses for period
    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e WHERE e.organization.id = :orgId AND e.expenseDate >= :startDate AND e.expenseDate <= :endDate AND e.active = true")
    BigDecimal calculateTotalExpenses(@Param("orgId") Long orgId, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    // Find recurring expenses
    @Query("SELECT e FROM Expense e WHERE e.organization.id = :orgId AND e.isRecurring = true AND e.active = true")
    List<Expense> findRecurringExpenses(@Param("orgId") Long orgId);

    // Count expenses by category
    Long countByOrganizationIdAndExpenseCategoryId(Long organizationId, Long categoryId);

    // Get today's expenses
    @Query("SELECT e FROM Expense e WHERE e.organization.id = :orgId AND CAST(e.expenseDate AS date) = CURRENT_DATE AND e.active = true ORDER BY e.expenseDate DESC")
    List<Expense> findTodayExpenses(@Param("orgId") Long orgId);

    // Find expenses by payment method
    Page<Expense> findByOrganizationIdAndPaymentMethod(Long organizationId, String paymentMethod, Pageable pageable);
}

