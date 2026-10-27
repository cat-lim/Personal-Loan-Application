package com.Group1.personalLoanApp.dto;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public record LoanSubmissionRequest (

        @NotNull
        @DecimalMin("0.01")
        @Digits(integer = 12, fraction = 2)
        BigDecimal amount,

        @NotNull
        @Min(1)
        @Max(360)
        Integer termMonths,

        @NotBlank
        @Size(max = 200)
        String purpose,

        @NotBlank
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

