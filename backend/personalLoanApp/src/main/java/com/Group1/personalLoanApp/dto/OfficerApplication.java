package com.Group1.personalLoanApp.dto;

import com.Group1.personalLoanApp.models.LoanApplication;

import java.math.BigDecimal;
import java.time.Instant;

public record OfficerApplication(
        Long id,
        String reference,
        String applicantName,
        String applicantUsername,
        BigDecimal loanAmount,
        Integer termMonths,
        String purpose,
        LoanApplication.EmploymentStatus employmentStatus,
        BigDecimal monthlyIncome,
        LoanApplication.ApplicationStatus status,
        Instant submittedAt,
        String decisionNote,
        Instant decidedAt,
        String decisionOfficerName
) {
    public static OfficerApplication from(LoanApplication application) {
        return new OfficerApplication(
                application.getId(),
                application.getReference(),
                application.getCustomer().getFullName(),
                application.getCustomer().getUsername(),
                application.getLoanAmount(),
                application.getTermMonths(),
                application.getPurpose(),
                application.getEmploymentStatus(),
                application.getMonthlyIncome(),
                application.getStatus(),
                application.getSubmittedAt(),
                application.getDecisionNote(),
                application.getDecidedAt(),
                application.getDecidedBy() == null
                        ? null
                        : application.getDecidedBy().getFullName()
        );
    }
}