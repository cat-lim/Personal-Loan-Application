package com.Group1.personalLoanApp.seed;

import com.Group1.personalLoanApp.models.Customer;
import com.Group1.personalLoanApp.models.LoanApplication;
import com.Group1.personalLoanApp.models.LoanApplication.ApplicationStatus;
import com.Group1.personalLoanApp.models.LoanApplication.EmploymentStatus;
import com.Group1.personalLoanApp.models.LoanOfficer;
import tools.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Loads fictional data from src/main/resources/seed/seed-data.json when the app starts.
 * Does nothing if the customer table already has rows.
 *
<<<<<<< HEAD
=======
 * Seed passwords are BCrypt-hashed. Existing plain-text seed records are upgraded in place.
>>>>>>> origin/main
 */
@Component
public class DataSeeder implements CommandLineRunner {

    // ---- Shape of seed-data.json ----
    record SeedData(List<UserSeed> customers, List<UserSeed> officers, List<ApplicationSeed> applications) { }

    record UserSeed(String username, String password, String fullName) { }

    record ApplicationSeed(String customerUsername, UUID requestKey, BigDecimal loanAmount, int termMonths,
                           String purpose, EmploymentStatus employmentStatus, BigDecimal monthlyIncome,
                           ApplicationStatus status, Instant submittedAt, String decisionNote,
                           Instant decidedAt, String decidedByUsername) { }

    // ---- Seeding ----
    @PersistenceContext
    private EntityManager em;

    private final ObjectMapper objectMapper;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(ObjectMapper objectMapper, PasswordEncoder passwordEncoder) {
        this.objectMapper = objectMapper;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        SeedData data;
        try (InputStream in = new ClassPathResource("seed/seed-data.json").getInputStream()) {
            data = objectMapper.readValue(in, SeedData.class);
        }

        Long existing = em.createQuery("select count(c) from Customer c", Long.class).getSingleResult();
        if (existing > 0) {
            upgradeLegacyPasswordHashes(data);
            return;
        }

        Map<String, Customer> customers = new HashMap<>();
        for (UserSeed u : data.customers()) {
            Customer c = new Customer(u.username(), passwordEncoder.encode(u.password()), u.fullName());
            em.persist(c);
            customers.put(c.getUsername(), c);
        }

        Map<String, LoanOfficer> officers = new HashMap<>();
        for (UserSeed u : data.officers()) {
            LoanOfficer o = new LoanOfficer(u.username(), passwordEncoder.encode(u.password()), u.fullName());
            em.persist(o);
            officers.put(o.getUsername(), o);
        }

        // Saved in file order, so ids come out as 1001, 1002, ... (LN-1001, LN-1002, ...)
        for (ApplicationSeed a : data.applications()) {
            LoanApplication loan = new LoanApplication();
            loan.setCustomer(customers.get(a.customerUsername()));
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
            loan.setDecidedBy(a.decidedByUsername() == null ? null : officers.get(a.decidedByUsername()));
            em.persist(loan);
        }
    }

    private void upgradeLegacyPasswordHashes(SeedData data) {
        for (UserSeed seed : data.customers()) {
            em.createQuery("select c from Customer c where c.username = :username", Customer.class)
                    .setParameter("username", seed.username())
                    .getResultStream()
                    .findFirst()
                    .ifPresent(customer -> upgradePasswordHash(customer::setPasswordHash, customer.getPasswordHash(), seed.password()));
        }

        for (UserSeed seed : data.officers()) {
            em.createQuery("select o from LoanOfficer o where o.username = :username", LoanOfficer.class)
                    .setParameter("username", seed.username())
                    .getResultStream()
                    .findFirst()
                    .ifPresent(officer -> upgradePasswordHash(officer::setPasswordHash, officer.getPasswordHash(), seed.password()));
        }
    }

    private void upgradePasswordHash(java.util.function.Consumer<String> setter, String storedHash, String seedPassword) {
        if (!storedHash.startsWith("$2")) {
            setter.accept(passwordEncoder.encode(seedPassword));
        }
    }
}
