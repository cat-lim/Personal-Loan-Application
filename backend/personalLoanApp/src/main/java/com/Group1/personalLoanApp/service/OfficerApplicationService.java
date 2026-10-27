package com.Group1.personalLoanApp.service;

import com.Group1.personalLoanApp.dto.OfficerApplication;
import com.Group1.personalLoanApp.models.LoanApplication;
import com.Group1.personalLoanApp.repository.LoanApplicationRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class OfficerApplicationService
{
    private final LoanApplicationRepository applicationRepo;

    public OfficerApplicationService(LoanApplicationRepository applicationRepo)
    {
        this.applicationRepo = applicationRepo;
    }

    @Transactional(readOnly = true)
    public List<OfficerApplication> getPendingApplications()
    {
        /* The officer service asks the repository for applications
            with status SUBMITTED, then orders them by submission time and ID.
            So... approved/rejected applications are excluded and oldest submissions come first.
            If 2 submissions have the same timestamp, the smaller ID comes first.
         */
        return applicationRepo.findByStatusOrderBySubmittedAtAscIdAsc(
                        LoanApplication.ApplicationStatus.SUBMITTED)
                .stream()
                .map(OfficerApplication::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public OfficerApplication getApplication(Long applicationId)
    {
        return applicationRepo.findById(applicationId)
                .map(OfficerApplication::from)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Application not found"));
    }
}