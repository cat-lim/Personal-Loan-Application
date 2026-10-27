package com.Group1.personalLoanApp.repository;

import com.Group1.personalLoanApp.models.LoanApplication;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface LoanApplicationRepository extends JpaRepository<LoanApplication, Long> {

    /** "My applications": newest first. */
    List<LoanApplication> findByCustomerIdOrderBySubmittedAtDescIdDesc(Long customerId);

    /** Officer's "Pending applications": oldest first. */
    List<LoanApplication> findByStatusOrderBySubmittedAtAscIdAsc(LoanApplication.ApplicationStatus status);

    /** Idempotent submit: if this key was already used, return the existing loan instead of a new one. */
    Optional<LoanApplication> findByCustomerIdAndRequestKey(Long customerId, UUID requestKey);

    /** A customer can only open their own application. */
    Optional<LoanApplication> findByIdAndCustomerId(Long id, Long customerId);

    /**
     * Atomically records a decision only while the application is still submitted.
     * Returns 1 when recorded, or 0 when it was missing or already decided.
     */
    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Transactional
    @Query(value = "UPDATE loan_application "
        + "SET status = :decision, decision_note = :decisionNote, "
        + "decided_by_officer_id = :officerId, decided_at = :decidedAt "
        + "WHERE id = :applicationId AND status = 'SUBMITTED' "
        + "AND :decision IN ('APPROVED', 'REJECTED') "
        + "AND :officerId IS NOT NULL AND :decidedAt IS NOT NULL "
        + "AND (:decisionNote IS NULL OR CHAR_LENGTH(:decisionNote) <= 1000) "
        + "AND (:decision <> 'REJECTED' OR NULLIF(BTRIM(:decisionNote), '') IS NOT NULL)",
        nativeQuery = true)
    int decideIfSubmitted(@Param("applicationId") Long applicationId,
                          @Param("decision") String decision,
                          @Param("decisionNote") String decisionNote,
                          @Param("officerId") Long officerId,
                          @Param("decidedAt") Instant decidedAt);
}
