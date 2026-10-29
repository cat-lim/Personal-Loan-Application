package com.Group1.personalLoanApp.decision.dto;

import com.Group1.personalLoanApp.decision.model.Decision;

public record DecisionResponse(
        Long applicationId,
        Decision status,
        Long officerId,
        String officerUsername
) {}