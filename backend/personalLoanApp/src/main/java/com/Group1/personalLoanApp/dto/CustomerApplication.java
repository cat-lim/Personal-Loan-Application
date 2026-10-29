package com.Group1.personalLoanApp.dto;

import com.Group1.personalLoanApp.models.LoanApplication;

import java.math.BigDecimal;
import java.time.Instant;

public record CustomerApplication(
        Long id,
        String reference,
        String applicantName,
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
    /**
     * @param application: LoanApplication
     * @return a CustomerApplication created by copying the fields of the parameter application
     */
    public static CustomerApplication from(LoanApplication application) {
        return new CustomerApplication(
                application.getId(),
                application.getReference(),
                application.getCustomer().getFullName(),
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