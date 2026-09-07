package com.fittrack.backend.repository;

import com.fittrack.backend.entity.ExpenseCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExpenseCategoryRepository extends JpaRepository<ExpenseCategory, Long> {

    // Find all active categories for organization
    List<ExpenseCategory> findByOrganizationIdAndIsActiveTrue(Long organizationId);

    // Find all categories for organization (including inactive)
    List<ExpenseCategory> findByOrganizationId(Long organizationId);

    // Check if category exists
    boolean existsByOrganizationIdAndCategoryName(Long organizationId, String categoryName);
}

