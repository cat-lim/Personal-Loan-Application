package com.Group1.personalLoanApp.Service;
import com.Group1.personalLoanApp.dto.LoanSubmissionRequest;
import com.Group1.personalLoanApp.dto.LoanSubmissionResponse;
import org.springframework.http.HttpStatus;
import org.springframework.security.web.access.intercept.RequestKey;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicBoolean;

@Service

public class LoanSubmissionService {
    private final ConcurrentHashMap<RequestKey, StoredSubmission>
              submissions = new ConcurrentHashMap<>();

    public SubmissionResult submit(
            String customerId,
            String requestKey,
            LoanSubmissionRequest request
    ) {
        AtomicBoolean created = new AtomicBoolean(false);
        RequestKey key = new RequestKey(customerId, requestKey);

        StoredSubmission stored = submissions.compute(
                key, (k, existing) -> {
                    if (existing != null){
                        if(!existing.request().equals(request)){
                            throw new ResponseStatusException(HttpStatus.CONFLICT, "Request key already used with different data");
                        }
                        return existing;
                    }
                    created.set(true);

                    LoanSubmissionResponse response =
                            new LoanSubmissionResponse(
                                    "LOAN-" +UUID.randomUUID(), "Submitted", Instant.now()
                            );
                    return new StoredSubmission(request, response);
                }
        );
        return new SubmissionResult(stored.response(), created.get());
    }
    private record RequestKey(String customerId, String key){}
    private record StoredSubmission(LoanSubmissionRequest request, LoanSubmissionResponse response){}
    public record SubmissionResult(LoanSubmissionResponse response, boolean created){}
}

//UUID gives unique reference
//Instant.now() captures submission time
//ConcurrentHashMap.compute() ensures that simultaneous request from same customer and request key don't create multiple entries.