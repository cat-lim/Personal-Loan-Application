package com.Group1.personalLoanApp.Controller;

import com.Group1.personalLoanApp.dto.LoanSubmissionRequest;
import com.Group1.personalLoanApp.dto.LoanSubmissionResponse;
import com.Group1.personalLoanApp.Service.LoanSubmissionService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@RestController
@RequestMapping("/api/loans")

public class LoanSubmissionController {
    private final LoanSubmissionService service;
    public LoanSubmissionController(LoanSubmissionService service){
        this.service = service;
    }

    @PostMapping("/submit")
    public ResponseEntity<LoanSubmissionResponse> submit(
            @Valid @RequestBody LoanSubmissionRequest request,
            @RequestHeader("Idempotency-key") String requestKey,
            HttpServletRequest httpRequest){

        HttpSession session = httpRequest.getSession(false);

        if (session == null || session.getAttribute("userId") == null){
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Login required!");
        }
        if (!"CUSTOMER".equals(session.getAttribute("role"))){
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Customer role required");
        }
        if (requestKey.isBlank()){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Request key required");
        }

        UUID idempotencyKey;
        try {
            idempotencyKey = UUID.fromString(requestKey);
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Request key must be a valid UUID");
        }

        Long customerId = (Long) session.getAttribute("userId");
        var result = service.submit(customerId, idempotencyKey, request);

        HttpStatus status = result.created()
                ? HttpStatus.CREATED
                : HttpStatus.OK;

        return ResponseEntity.status(status).body(result.response());
    }

}

