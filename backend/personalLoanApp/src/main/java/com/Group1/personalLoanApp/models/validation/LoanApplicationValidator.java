package com.Group1.personalLoanApp.models.validation;

import com.Group1.personalLoanApp.models.LoanApplication;
import com.Group1.personalLoanApp.models.LoanOfficer;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

public final class LoanApplicationValidator {
    private static final BigDecimal MINIMUM_LOAN_AMOUNT = new BigDecimal("1000.00");
    private static final BigDecimal MAXIMUM_LOAN_AMOUNT = new BigDecimal("50000.00");

    private LoanApplicationValidator() { }

    public static List<String> validateSubmission(LoanApplication application) {
        List<String> errors = new ArrayList<>();
        if (application == null) {
            return List.of("Application is required");
        }

        if (application.getCustomer() == null) {
            errors.add("Customer is required");
        }
        if (application.getRequestKey() == null) {
            errors.add("Request key is required");
        }

        BigDecimal amount = application.getLoanAmount();
        if (amount == null) {
            errors.add("Loan amount is required");
        } else {
            if (amount.compareTo(MINIMUM_LOAN_AMOUNT) < 0 || amount.compareTo(MAXIMUM_LOAN_AMOUNT) > 0) {
                errors.add("Loan amount must be between 1000.00 and 50000.00");
            }
            if (amount.scale() > 2) {
                errors.add("Loan amount may have at most two fractional digits");
            }
        }

        Integer termMonths = application.getTermMonths();
        if (termMonths == null || (termMonths != 12 && termMonths != 24 && termMonths != 36)) {
            errors.add("Term must be 12, 24, or 36 months");
        }

        String purpose = application.getPurpose();
        if (purpose == null || purpose.isBlank()) {
            errors.add("Purpose is required");
        } else if (purpose.length() > 200) {
            errors.add("Purpose must be at most 200 characters");
        }

        if (application.getEmploymentStatus() == null) {
            errors.add("Employment status is required");
        }

        BigDecimal monthlyIncome = application.getMonthlyIncome();
        if (monthlyIncome == null || monthlyIncome.signum() <= 0) {
            errors.add("Monthly income must be positive");
        } else if (monthlyIncome.scale() > 2) {
            errors.add("Monthly income may have at most two fractional digits");
        }

        return List.copyOf(errors);
    }

    public static List<String> validateDecision(LoanApplication application,
                                                LoanApplication.ApplicationStatus decision,
                                                String decisionNote,
                                                LoanOfficer officer,
                                                Instant decidedAt) {
        List<String> errors = new ArrayList<>();
        if (application == null) {
            return List.of("Application is required");
        }
        if (application.getStatus() != LoanApplication.ApplicationStatus.SUBMITTED
                || application.getDecidedAt() != null
                || application.getDecidedBy() != null) {
            errors.add("Only an undecided submitted application can receive a decision");
        }
        if (decision != LoanApplication.ApplicationStatus.APPROVED
                && decision != LoanApplication.ApplicationStatus.REJECTED) {
            errors.add("Decision must be APPROVED or REJECTED");
        }
        if (officer == null) {
            errors.add("Decision officer is required");
        }
        if (decidedAt == null) {
            errors.add("Decision timestamp is required");
        }
        if (decision == LoanApplication.ApplicationStatus.REJECTED
                && (decisionNote == null || decisionNote.isBlank())) {
            errors.add("A rejection reason is required");
        }
        if (decisionNote != null && decisionNote.length() > 1000) {
            errors.add("Decision note must be at most 1000 characters");
        }

        return List.copyOf(errors);
    }
}