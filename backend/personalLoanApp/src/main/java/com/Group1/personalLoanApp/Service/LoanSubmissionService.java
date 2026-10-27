package com.Group1.personalLoanApp.Service;
import com.Group1.personalLoanApp.dto.LoanSubmissionRequest;
import com.Group1.personalLoanApp.dto.LoanSubmissionResponse;
import com.Group1.personalLoanApp.models.LoanApplication;
import com.Group1.personalLoanApp.repository.LoanApplicationRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;

import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.UUID;

@Service

public class LoanSubmissionService {
    private final LoanApplicationRepository loans;
    private final LoanSubmissionWrite write;

    public LoanSubmissionService(LoanApplicationRepository loans, LoanSubmissionWrite write){
        this.loans = loans;
        this.write = write;
    }
    public SubmissionResult submit(
            Long customerId,
            UUID requestKey,
            LoanSubmissionRequest request
    ) {
        var existing = loans.findByCustomerIdAndRequestKey(customerId, requestKey);
        if (existing.isPresent()) {
            return checkRetry(existing.get(), request);
        }
        try {
            LoanApplication saved = write.insert(customerId, requestKey, request);
            return new SubmissionResult(toResponse(saved), true);
        } catch (DataIntegrityViolationException ex) {
            LoanApplication saved = loans.findByCustomerIdAndRequestKey(customerId, requestKey).orElseThrow(() -> ex);

            return checkRetry(saved, request);
        }
    }

       private SubmissionResult checkRetry(LoanApplication saved, LoanSubmissionRequest request){

          boolean same =
                  saved.getLoanAmount().compareTo(request.amount()) == 0
                  && saved.getTermMonths().equals(request.termMonths())
                  && saved.getPurpose().equals(request.purpose())
                  && saved.getEmploymentStatus().name().equals(request.employmentStatus())
                  && saved.getMonthlyIncome().compareTo(request.monthlyIncome())== 0;

          if (!same){
              throw new ResponseStatusException(HttpStatus.CONFLICT, "Request key already used with different data");
          }

        return new SubmissionResult(toResponse(saved), false);
    }
    private LoanSubmissionResponse toResponse(LoanApplication loan){
        return new LoanSubmissionResponse(loan.getReference(),"SUBMITTED", loan.getSubmittedAt());
    }

    public record SubmissionResult(LoanSubmissionResponse response, boolean created){}
}

