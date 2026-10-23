package com.Group1.personalLoanApp.seed;

import com.Group1.personalLoanApp.models.LoanApplication;
import com.Group1.personalLoanApp.models.LoanOfficer;
import com.Group1.personalLoanApp.repository.CustomerRepository;
import com.Group1.personalLoanApp.repository.LoanApplicationRepository;
import com.Group1.personalLoanApp.repository.LoanOfficerRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.Group1.personalLoanApp.models.Customer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.ClassPathResource;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Runs once at startup, after Hibernate has created the tables.
 * Loads fictional data from seed/seed-data.json, but only if the database is empty,
 * so restarting the app never duplicates rows.
 */
@Component
@ConditionalOnProperty(name = "app.seed.enabled", havingValue = "true")
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final CustomerRepository customers;
    private final LoanOfficerRepository officers;
    private final LoanApplicationRepository applications;
    private final ObjectMapper objectMapper;
    private final PasswordEncoder encoder;

    public DataSeeder(CustomerRepository customers, LoanOfficerRepository officers,
                      LoanApplicationRepository applications, ObjectMapper objectMapper,
                      PasswordEncoder encoder) {
        this.customers = customers;
        this.officers = officers;
        this.applications = applications;
        this.objectMapper = objectMapper;
        this.encoder = encoder;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (customers.count() > 0) {
            log.info("Seed skipped: data already present");
            return;
        }

        SeedData data;
        try (InputStream in = new ClassPathResource("seed/seed-data.json").getInputStream()) {
            data = objectMapper.readValue(in, SeedData.class);
        }

        Map<String, Customer> customerByUsername = data.customers().stream()
            .map(c -> customers.save(new Customer(c.username(), encoder.encode(c.password()), c.fullName())))
            .collect(Collectors.toMap(Customer::getUsername, Function.identity()));

        Map<String, LoanOfficer> officerByUsername = data.officers().stream()
            .map(o -> officers.save(new LoanOfficer(o.username(), encoder.encode(o.password()), o.fullName())))
            .collect(Collectors.toMap(LoanOfficer::getUsername, Function.identity()));

        // Saved in file order, so the sequence hands out LN-1001, LN-1002, ... in that order.
        for (SeedData.ApplicationSeed a : data.applications()) {
            Customer owner = require(customerByUsername, a.customerUsername(), "customer");
            LoanApplication loan = new LoanApplication();
            loan.setCustomer(owner);
            loan.setRequestKey(a.requestKey());
            loan.setLoanAmount(a.loanAmount());
            loan.setTermMonths(a.termMonths());
            loan.setPurpose(a.purpose());
            loan.setEmploymentStatus(a.employmentStatus());
            loan.setMonthlyIncome(a.monthlyIncome());
            loan.setStatus(a.status());
            loan.setSubmittedAt(a.submittedAt());
            loan.setDecisionNote(a.decisionNote());
            loan.setDecidedAt(a.decidedAt());
            if (a.decidedByUsername() != null) {
                loan.setDecidedBy(require(officerByUsername, a.decidedByUsername(), "officer"));
            }
            applications.save(loan);
        }

        log.info("Seeded {} customers, {} officers, {} applications",
            customerByUsername.size(), officerByUsername.size(), data.applications().size());
    }

    private static <T> T require(Map<String, T> map, String key, String kind) {
        T value = map.get(key);
        if (value == null) throw new IllegalStateException("Seed file references unknown " + kind + ": " + key);
        return value;
    }
}
