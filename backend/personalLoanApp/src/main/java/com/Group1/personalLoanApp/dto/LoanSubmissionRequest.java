package com.Group1.personalLoanApp.dto;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public record LoanSubmissionRequest (

        @NotNull
        @DecimalMin(value = "1000",
        message = "Minimum loan amount is 1000")
        @DecimalMax(value = "50000",
        message = "Maximum loan amount is 50000")
        @Digits(integer = 12, fraction = 2)
        BigDecimal amount,

        @NotNull(message = "Term is required")
        Integer termMonths,

        @NotBlank
        @Size(max = 200)
        String purpose,

        @NotBlank(message = "Employment status required")
        @Pattern(
                regexp = "EMPLOYED | SELF_EMPLOYED | UNEMPLOYED",
                message = "Employee status must be filled out."
        )
        String employmentStatus,

        @NotNull
        @DecimalMin("0.00")
        @Digits(integer = 12, fraction = 2)
        BigDecimal monthlyIncome
){
        @AssertTrue(message = "Term must be 12, 24 or 36 months")
        public boolean isValidTerm(){
                return termMonths == null ||
                        termMonths == 12 ||
                        termMonths == 24 ||
                        termMonths == 36;
        }
}
    //this class defines the information the customer submits

