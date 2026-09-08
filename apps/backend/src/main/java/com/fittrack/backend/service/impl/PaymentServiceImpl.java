package com.fittrack.backend.service.impl;

import com.fittrack.backend.dto.CreatePaymentRequest;
import com.fittrack.backend.dto.PaymentDTO;
import com.fittrack.backend.entity.Member;
import com.fittrack.backend.entity.Membership;
import com.fittrack.backend.entity.Organization;
import com.fittrack.backend.entity.Payment;
import com.fittrack.backend.entity.enums.MemberStatus;
import com.fittrack.backend.exception.BadRequestException;
import com.fittrack.backend.exception.ResourceNotFoundException;
import com.fittrack.backend.repository.MemberRepository;
import com.fittrack.backend.repository.MembershipRepository;
import com.fittrack.backend.repository.OrganizationRepository;
import com.fittrack.backend.repository.PaymentRepository;
import com.fittrack.backend.service.PaymentCollectionSummary;
import com.fittrack.backend.service.PaymentService;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final MemberRepository memberRepository;
    private final MembershipRepository membershipRepository;
    private final OrganizationRepository organizationRepository;

    @Override
    public PaymentDTO createPayment(Long organizationId, CreatePaymentRequest request) {
        Organization org = organizationRepository.findById(organizationId)
            .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));

        Member member = memberRepository.findById(request.getMemberId())
            .orElseThrow(() -> new ResourceNotFoundException("Member not found"));

        // Validate member belongs to organization
        if (!member.getOrganization().getId().equals(organizationId)) {
            throw new ResourceNotFoundException("Member does not belong to this organization");
        }

        Payment payment = new Payment();
        payment.setOrganization(org);
        payment.setMember(member);
        payment.setAmount(request.getAmount());
        payment.setDiscountPercentage(request.getDiscountPercentage() != null ? request.getDiscountPercentage() : BigDecimal.ZERO);
        payment.setDiscountAmount(request.getDiscountAmount() != null ? request.getDiscountAmount() : BigDecimal.ZERO);
        payment.setTaxPercentage(request.getTaxPercentage() != null ? request.getTaxPercentage() : BigDecimal.ZERO);
        payment.setTaxAmount(request.getTaxAmount() != null ? request.getTaxAmount() : BigDecimal.ZERO);

        // Calculate final amount: amount - discount + tax
        BigDecimal finalAmount = request.getAmount()
            .subtract(request.getDiscountAmount() != null ? request.getDiscountAmount() : BigDecimal.ZERO)
            .add(request.getTaxAmount() != null ? request.getTaxAmount() : BigDecimal.ZERO);
        payment.setFinalAmount(finalAmount);

        payment.setPaymentMethod(request.getPaymentMethod());
        String paymentMethod = request.getPaymentMethod() != null ? request.getPaymentMethod().trim().toUpperCase() : "";
        String transactionId = request.getTransactionId() != null ? request.getTransactionId().trim() : "";
        boolean hasTransactionId = !transactionId.isEmpty();

        if (("CARD".equals(paymentMethod) || "UPI".equals(paymentMethod)) && !hasTransactionId) {
            throw new BadRequestException("TRANSACTION_ID_REQUIRED", "Transaction ID is required for CARD and UPI payments");
        }

        boolean isCardOrUpiConfirmed = "CARD".equals(paymentMethod) || "UPI".equals(paymentMethod);

        if ("CASH".equals(paymentMethod) || isCardOrUpiConfirmed) {
            payment.setPaymentStatus("PAID");
            payment.setPaidAt(LocalDateTime.now());
            payment.setReceiptNumber(generateReceiptNumber(organizationId));
        } else {
            payment.setPaymentStatus("PENDING");
        }
        payment.setTransactionId(hasTransactionId ? transactionId : request.getTransactionId());
        payment.setReferenceNumber(request.getReferenceNumber());
        payment.setPaymentReason(request.getPaymentReason());
        payment.setNotes(request.getNotes());

        if (request.getMembershipId() != null) {
            Membership membership = membershipRepository.findById(request.getMembershipId())
                .orElseThrow(() -> new ResourceNotFoundException("Membership not found"));

            if (!membership.getMember().getId().equals(member.getId())) {
                throw new BadRequestException("MEMBERSHIP_MEMBER_MISMATCH", "Membership does not belong to the provided member");
            }

            payment.setMembership(membership);
        }

        if ("PAID".equals(payment.getPaymentStatus())) {
            syncMembershipStatusAfterPayment(payment);
        }

        Payment saved = paymentRepository.save(payment);
        return toDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentDTO getPayment(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
            .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));
        return toDTO(payment);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PaymentDTO> listPayments(Long organizationId, Pageable pageable) {
        return paymentRepository.findByOrganizationId(organizationId, pageable)
            .map(this::toDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PaymentDTO> listPaymentsByStatus(Long organizationId, String status, Pageable pageable) {
        return paymentRepository.findByOrganizationIdAndPaymentStatus(organizationId, status, pageable)
            .map(this::toDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PaymentDTO> listMemberPayments(Long organizationId, Long memberId, Pageable pageable) {
        return paymentRepository.findByOrganizationIdAndMemberId(organizationId, memberId, pageable)
            .map(this::toDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaymentDTO> getPendingPayments(Long organizationId) {
        return paymentRepository.findPendingPayments(organizationId).stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaymentDTO> getTodayPayments(Long organizationId) {
        return paymentRepository.findTodayPayments(organizationId).stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
    }

    @Override
    public PaymentDTO markPaymentAsPaid(Long organizationId, Long paymentId) {
        Payment payment = paymentRepository.findByIdAndOrganizationId(paymentId, organizationId)
            .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));

        payment.setPaymentStatus("PAID");
        payment.setPaidAt(LocalDateTime.now());

        // Generate receipt number if not already set
        if (payment.getReceiptNumber() == null) {
            payment.setReceiptNumber(generateReceiptNumber(payment.getOrganization().getId()));
        }

        syncMembershipStatusAfterPayment(payment);

        Payment updated = paymentRepository.save(payment);
        return toDTO(updated);
    }

    @Override
    public PaymentDTO updatePayment(Long organizationId, Long paymentId, CreatePaymentRequest request) {
        Payment payment = paymentRepository.findByIdAndOrganizationId(paymentId, organizationId)
            .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));

        payment.setAmount(request.getAmount());
        payment.setDiscountPercentage(request.getDiscountPercentage() != null ? request.getDiscountPercentage() : BigDecimal.ZERO);
        payment.setDiscountAmount(request.getDiscountAmount() != null ? request.getDiscountAmount() : BigDecimal.ZERO);
        payment.setTaxPercentage(request.getTaxPercentage() != null ? request.getTaxPercentage() : BigDecimal.ZERO);
        payment.setTaxAmount(request.getTaxAmount() != null ? request.getTaxAmount() : BigDecimal.ZERO);

        BigDecimal finalAmount = request.getAmount()
            .subtract(request.getDiscountAmount() != null ? request.getDiscountAmount() : BigDecimal.ZERO)
            .add(request.getTaxAmount() != null ? request.getTaxAmount() : BigDecimal.ZERO);
        payment.setFinalAmount(finalAmount);

        payment.setPaymentMethod(request.getPaymentMethod());
        payment.setTransactionId(request.getTransactionId());
        payment.setReferenceNumber(request.getReferenceNumber());
        payment.setPaymentReason(request.getPaymentReason());
        payment.setNotes(request.getNotes());

        Payment updated = paymentRepository.save(payment);
        return toDTO(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public BigDecimal getTotalRevenue(Long organizationId, LocalDateTime startDate, LocalDateTime endDate) {
        return paymentRepository.calculateTotalRevenue(organizationId, startDate, endDate);
    }

    @Override
    @Transactional(readOnly = true)
    public BigDecimal getTotalPendingAmount(Long organizationId) {
        return paymentRepository.calculatePendingAmount(organizationId);
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentCollectionSummary getCollectionSummary(Long organizationId) {
        long totalPaidPayments = paymentRepository.countByOrganizationIdAndPaymentStatus(organizationId, "PAID");
        long totalPendingPayments = paymentRepository.countByOrganizationIdAndPaymentStatus(organizationId, "PENDING");
        long totalPartialPayments = paymentRepository.countByOrganizationIdAndPaymentStatus(organizationId, "PARTIAL");

        BigDecimal totalCollected = paymentRepository.calculateTotalRevenue(organizationId,
            LocalDateTime.now().minusDays(30), LocalDateTime.now());
        BigDecimal totalPending = paymentRepository.calculatePendingAmount(organizationId);

        long totalMembers = memberRepository.countByOrganizationId(organizationId);
        long paidMembers = totalPaidPayments;
        long pendingMembers = totalPendingPayments + totalPartialPayments;
        long overdueMembers = calculateOverdueMembers(organizationId);

        BigDecimal todayCollection = paymentRepository.calculateTotalRevenue(organizationId,
            LocalDateTime.now().minusDays(1), LocalDateTime.now());

        Double collectionPercentage = totalMembers > 0 ?
            (double) paidMembers / totalMembers * 100 : 0.0;

        return PaymentCollectionSummary.builder()
            .totalMembers(totalMembers)
            .paidMembers(paidMembers)
            .pendingMembers(pendingMembers)
            .overdueMembers(overdueMembers)
            .totalCollected(totalCollected != null ? totalCollected : BigDecimal.ZERO)
            .totalPending(totalPending != null ? totalPending : BigDecimal.ZERO)
            .todayCollection(todayCollection != null ? todayCollection : BigDecimal.ZERO)
            .collectionPercentage(collectionPercentage)
            .totalPaidPayments(totalPaidPayments)
            .totalPendingPayments(totalPendingPayments)
            .build();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PaymentDTO> searchPayments(Long organizationId, String searchTerm, Pageable pageable) {
        // Search by member name or reference number
        List<PaymentDTO> allPayments = paymentRepository.findByOrganizationId(organizationId, pageable)
            .stream()
            .filter(p -> p.getMember().getFullName().toLowerCase().contains(searchTerm.toLowerCase())
                || (p.getReferenceNumber() != null && p.getReferenceNumber().contains(searchTerm)))
            .map(this::toDTO)
            .collect(Collectors.toList());

        // Return as a list wrapped in a pageable response
        // For better performance, use native queries in production
        return paymentRepository.findByOrganizationId(organizationId, pageable)
            .map(this::toDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PaymentDTO> filterPaymentsByDateRange(Long organizationId, LocalDateTime startDate,
                                                       LocalDateTime endDate, Pageable pageable) {
        return paymentRepository.findByOrganizationIdAndDateRange(organizationId, startDate, endDate, pageable)
            .map(this::toDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> getAvailablePaymentMethods() {
        return List.of("CASH", "CARD", "UPI", "BANK_TRANSFER", "CHEQUE", "ONLINE", "AUTO_RENEWAL");
    }

    @Override
    public void deletePayment(Long organizationId, Long paymentId) {
        Payment payment = paymentRepository.findByIdAndOrganizationId(paymentId, organizationId)
            .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));
        payment.setActive(false);
        paymentRepository.save(payment);
    }

    private String generateReceiptNumber(Long organizationId) {
        long count = paymentRepository.countByOrganizationIdAndPaymentStatus(organizationId, "PAID") + 1;
        return String.format("RCP%d%04d", organizationId, count);
    }

    private long calculateOverdueMembers(Long organizationId) {
        // This would typically check membership expiry dates
        // For now, return 0
        return 0;
    }

    private void syncMembershipStatusAfterPayment(Payment payment) {
        Membership membership = payment.getMembership();
        if (membership == null) {
            return;
        }

        MemberStatus targetStatus = determineMembershipStatusFromEndDate(membership.getEndDate());
        membership.setStatus(targetStatus);
        membership.setActive(true);
        membershipRepository.save(membership);

        Member membershipMember = membership.getMember();
        if (membershipMember != null) {
            membershipMember.setStatus(targetStatus);
            memberRepository.save(membershipMember);
        }
    }

    private MemberStatus determineMembershipStatusFromEndDate(LocalDate endDate) {
        LocalDate today = LocalDate.now();

        if (endDate == null || endDate.isBefore(today)) {
            return MemberStatus.EXPIRED;
        }

        if (!endDate.isAfter(today.plusDays(7))) {
            return MemberStatus.EXPIRING_SOON;
        }

        return MemberStatus.ACTIVE;
    }

    private PaymentDTO toDTO(Payment payment) {
        return PaymentDTO.builder()
            .id(payment.getId())
            .organizationId(payment.getOrganization() != null ? payment.getOrganization().getId() : null)
            .branchId(payment.getBranch() != null ? payment.getBranch().getId() : null)
            .memberId(payment.getMember() != null ? payment.getMember().getId() : null)
            .memberName(payment.getMember() != null ? payment.getMember().getFullName() : null)
            .membershipId(payment.getMembership() != null ? payment.getMembership().getId() : null)
            .leadId(payment.getLead() != null ? payment.getLead().getId() : null)
            .amount(payment.getAmount())
            .discountPercentage(payment.getDiscountPercentage())
            .discountAmount(payment.getDiscountAmount())
            .taxPercentage(payment.getTaxPercentage())
            .taxAmount(payment.getTaxAmount())
            .finalAmount(payment.getFinalAmount())
            .paymentMethod(payment.getPaymentMethod())
            .paymentStatus(payment.getPaymentStatus())
            .transactionId(payment.getTransactionId())
            .referenceNumber(payment.getReferenceNumber())
            .receiptNumber(payment.getReceiptNumber())
            .collectedById(payment.getCollectedBy() != null ? payment.getCollectedBy().getId() : null)
            .collectedByName(payment.getCollectedBy() != null ? payment.getCollectedBy().getFullName() : null)
            .paymentReason(payment.getPaymentReason())
            .notes(payment.getNotes())
            .paidAt(payment.getPaidAt())
            .createdAt(payment.getCreatedAt())
            .updatedAt(payment.getUpdatedAt())
            .build();
    }
}

