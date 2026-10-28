package com.Group1.personalLoanApp.decision.dto;

import com.Group1.personalLoanApp.decision.model.Decision;
import jakarta.validation.constraints.NotNull;

public record DecisionRequest(
        @NotNull(message = "A decision is required.")
        Decision decision,
        String reason
) {
}