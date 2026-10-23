package com.Group1.personalLoanApp.seed;

import com.Group1.personalLoanApp.models.LoanApplication;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

/** Shape of src/main/resources/seed/seed-data.json. Jackson maps the JSON straight onto these records. */
public record SeedData(List<UserSeed> customers,
                       List<UserSeed> officers,
                       List<ApplicationSeed> applications) {

    public record UserSeed(String username, String password, String fullName) { }

    public record ApplicationSeed(String customerUsername,
                                  UUID requestKey,
                                  BigDecimal loanAmount,
                                  int termMonths,
                                  String purpose,
                                  LoanApplication.EmploymentStatus employmentStatus,
                                  BigDecimal monthlyIncome,
                                  LoanApplication.ApplicationStatus status,
                                  Instant submittedAt,
                                  String decisionNote,
                                  Instant decidedAt,
                                  String decidedByUsername) { }
}
