package com.Group1.personalLoanApp.dto;
import java.time.Instant;

public record LoanSubmissionResponse (
        String reference,
        String status,
        Instant submittedAt
){}
// On successful submission the API will return a unique reference, submitted status with timestamp