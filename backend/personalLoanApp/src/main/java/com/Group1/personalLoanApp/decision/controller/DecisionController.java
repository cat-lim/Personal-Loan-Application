package com.Group1.personalLoanApp.decision.controller;

import com.Group1.personalLoanApp.decision.dto.DecisionRequest;
import com.Group1.personalLoanApp.decision.dto.DecisionResponse;
import com.Group1.personalLoanApp.decision.service.DecisionService;
import com.Group1.personalLoanApp.models.LoanOfficer;
import com.Group1.personalLoanApp.repository.LoanOfficerRepository;

import jakarta.validation.Valid;

import java.util.Locale;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/officer/applications")
public class DecisionController {

    private final DecisionService service;
    private final LoanOfficerRepository loanOfficerRepository;

    public DecisionController(
            DecisionService service,
            LoanOfficerRepository loanOfficerRepository) {
        this.service = service;
        this.loanOfficerRepository = loanOfficerRepository;
    }

//     @PostMapping("/{applicationId}/decision")
//     @PreAuthorize("isAuthenticated() and hasRole('OFFICER')")
//     public ResponseEntity<DecisionResponse> decide(
//             @PathVariable Long applicationId,
//             @Valid @RequestBody DecisionRequest request,
//             Authentication authentication) {
        
//         if (authentication == null
//                 || authentication instanceof AnonymousAuthenticationToken) {
//             throw new ResponseStatusException(
//                     HttpStatus.UNAUTHORIZED,
//                     "Authentication is required."
//             );
//         }

//         String username = authentication.getName()
//                 .trim()
//                 .toLowerCase(Locale.ROOT);

//         LoanOfficer officer = loanOfficerRepository
//                 .findByUsername(username)
//                 .orElseThrow(() -> new ResponseStatusException(
//                         HttpStatus.FORBIDDEN,
//                         "The authenticated user is not a registered officer."
//                 ));

//         DecisionResponse response = service.decide(
//                 applicationId,
//                 request,
//                 officer.getId()
//         );

//         return ResponseEntity.ok(response);
//     }

    @PostMapping("/{applicationId}/decision")
// @PreAuthorize("isAuthenticated() and hasRole('OFFICER')")
public ResponseEntity<DecisionResponse> decide(
        @PathVariable Long applicationId,
        @Valid @RequestBody DecisionRequest request,
        Authentication authentication) {

    System.out.println("DECISION ENDPOINT HIT");

    if (authentication != null) {
        System.out.println("USERNAME: " + authentication.getName());
        System.out.println("AUTHORITIES: "
                + authentication.getAuthorities());
    }

    LoanOfficer officer = loanOfficerRepository
            .findByUsername(
                    authentication.getName()
                            .trim()
                            .toLowerCase(Locale.ROOT))
            .orElseThrow(() -> new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "The authenticated user is not a registered officer."
            ));

    DecisionResponse response = service.decide(
            applicationId,
            request,
            officer.getId()
    );

    return ResponseEntity.ok(response);
}
}