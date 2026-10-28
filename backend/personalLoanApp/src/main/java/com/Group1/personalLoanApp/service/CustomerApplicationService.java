package com.Group1.personalLoanApp.service;

import com.Group1.personalLoanApp.dto.CustomerApplication;
import com.Group1.personalLoanApp.repository.LoanApplicationRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

/* Note: The readonly transactional annotation tells Spring to run
        the annotated method inside a read-only database transaction
 */
@Service
public class CustomerApplicationService
{
    private final LoanApplicationRepository applicationRepo;

    public CustomerApplicationService(LoanApplicationRepository applicationRepo)
    {
        this.applicationRepo = applicationRepo;
    }

    @Transactional(readOnly = true)
    public List<CustomerApplication> getApplications(Long customerId)
    {
        return applicationRepo.findByCustomerIdOrderBySubmittedAtDescIdDesc(customerId)
                .stream()
                .map(CustomerApplication::from)
                .toList();
    }

    /**
     * That query only returns the application if it belongs to that customer; otherwise it returns 404.
     * @param customerId , the customer's ID
     * @param applicationId , the application's ID
     * @return the matching application if found, 404 otherwise
     */
    @Transactional(readOnly = true)
    public CustomerApplication getApplication(Long customerId, Long applicationId)
    {
        return applicationRepo.findByIdAndCustomerId(applicationId, customerId)
                .map(CustomerApplication::from)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Application not found"));
    }
    /* Note: the repo enforces customers can only get their own applications
        because the SQL query looks like this:
            SELECT la.*
            FROM loan_application la
            WHERE la.id = :id
            AND la.customer_id = :customerId;
     */
}