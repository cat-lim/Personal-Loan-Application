package com.Group1.personalLoanApp.service;

import com.Group1.personalLoanApp.dto.CustomerApplication;
import com.Group1.personalLoanApp.repository.LoanApplicationRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class CustomerApplicationService {
    private final LoanApplicationRepository applicationRepo;

    public CustomerApplicationService(LoanApplicationRepository applicationRepo) {
        this.applicationRepo = applicationRepo;
    }

    @Transactional(readOnly = true)
    public List<CustomerApplication> getApplications(Long customerId) {
        return applicationRepo.findByCustomerIdOrderBySubmittedAtDescIdDesc(customerId)
                .stream()
                .map(CustomerApplication::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public CustomerApplication getApplication(Long customerId, Long applicationId) {
        return applicationRepo.findByIdAndCustomerId(applicationId, customerId)
                .map(CustomerApplication::from)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Application not found"));
    }
}