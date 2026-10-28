package com.Group1.personalLoanApp.decision.service;

import com.Group1.personalLoanApp.decision.dto.DecisionRequest;
import com.Group1.personalLoanApp.decision.dto.DecisionResponse;
import com.Group1.personalLoanApp.decision.model.Decision;
import com.Group1.personalLoanApp.repository.LoanApplicationRepository;

import java.time.Instant;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class DecisionService {

    private final LoanApplicationRepository repository;

    public DecisionService(LoanApplicationRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public DecisionResponse decide(
            Long applicationId,
            DecisionRequest request,
            Long officerId) {

        if (applicationId == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "An application ID is required."
            );
        }

        if (request == null || request.decision() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "A decision is required."
            );
        }

        if (officerId == null) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "An authenticated officer is required."
            );
        }

        // Normalize the reason so whitespace-only text becomes null.
        String reason = request.reason();

        if (reason != null) {
            reason = reason.trim();

            if (reason.isEmpty()) {
                reason = null;
            }
        }

        // Rejections must include a meaningful reason.
        if (request.decision() == Decision.REJECTED && reason == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "A rejection reason is required."
            );
        }

        if (reason != null && reason.length() > 1000) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "The decision reason cannot exceed 1000 characters."
            );
        }

        // The server generates the decision timestamp.
        Instant decidedAt = Instant.now();

        // This repository query updates only applications still SUBMITTED.
        int updated = repository.decideIfSubmitted(
                applicationId,
                request.decision().name(),
                reason,
                officerId,
                decidedAt
        );

        if (updated == 1) {
            return new DecisionResponse(
                    applicationId,
                    request.decision()
            );
        }

        // The atomic update failed: distinguish a missing application
        // from an application that is no longer eligible for a decision.
        if (!repository.existsById(applicationId)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Application not found."
            );
        }

        throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "This application has already been decided or is no longer eligible for a decision."
        );
    }
}