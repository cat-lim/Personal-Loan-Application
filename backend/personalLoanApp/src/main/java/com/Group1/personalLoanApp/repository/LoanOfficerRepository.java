package com.Group1.personalLoanApp.repository;

import com.Group1.personalLoanApp.models.LoanOfficer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface LoanOfficerRepository extends JpaRepository<LoanOfficer, Long> {

    Optional<LoanOfficer> findByUsername(String username);
}
