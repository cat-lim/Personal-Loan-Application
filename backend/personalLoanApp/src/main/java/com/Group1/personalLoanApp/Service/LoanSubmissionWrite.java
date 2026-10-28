package com.Group1.personalLoanApp.service;

import com.Group1.personalLoanApp.dto.LoanSubmissionRequest;
import com.Group1.personalLoanApp.models.LoanApplication;
import com.Group1.personalLoanApp.repository.CustomerRepository;
import com.Group1.personalLoanApp.repository.LoanApplicationRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@Service
public class LoanSubmissionWrite {
    private final LoanApplicationRepository loans;
    private final CustomerRepository customers;

    public LoanSubmissionWrite(LoanApplicationRepository loans, CustomerRepository customers){
        this.loans = loans;
        this.customers = customers;
    }

    @Transactional
    public LoanApplication insert(Long customerId, UUID requestKey, LoanSubmissionRequest request){
        var customer = customers.findById(customerId).orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Session customer not found"));

        LoanApplication loan = new LoanApplication();

        loan.setCustomer(customer);
        loan.setRequestKey(requestKey);
        loan.setLoanAmount(request.amount());
        loan.setTermMonths(request.termMonths());
        loan.setPurpose(request.purpose());
        loan.setEmploymentStatus(request.employmentStatus());
        loan.setMonthlyIncome(request.monthlyIncome());

        return loans.saveAndFlush(loan);
    }
}

//getting customer from Sahil's database using customer ID, creating LoanApplication entity,
// saving it using jpa and then letting Sahil's entity automatically assign SUBMITTED, a timestamp and a generated reference
