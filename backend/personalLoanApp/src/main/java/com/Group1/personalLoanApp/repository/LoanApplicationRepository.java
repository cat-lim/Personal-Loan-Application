package com.Group1.personalLoanApp.repository;

import com.Group1.personalLoanApp.models.LoanApplication;
import org.springframework.data.jpa.repository.JpaRepository;

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
}
