package com.Group1.personalLoanApp.models;

import jakarta.persistence.*;

import java.util.Locale;

/**
 * The staff user who works the "Pending applications" queue and records decisions.
 * Kept separate from Customer so a customer account can never approve a loan.
 */
@Entity
@Table(name = "loan_officer",
       uniqueConstraints = @UniqueConstraint(name = "uk_loan_officer_username", columnNames = "username"))
public class LoanOfficer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String username;

    @Column(name = "password_hash", nullable = false, length = 100)
    private String passwordHash;

    /** Printed on decisions: "Decision recorded 2026-10-21 · Jordan Lee". */
    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;

    protected LoanOfficer() {
        // for JPA
    }

    public LoanOfficer(String username, String passwordHash, String fullName) {
        this.username = username.trim().toLowerCase(Locale.ROOT);
        this.passwordHash = passwordHash;
        this.fullName = fullName;
    }

    public Long getId() { return id; }
    public String getUsername() { return username; }
    public String getPasswordHash() { return passwordHash; }
    public String getFullName() { return fullName; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
}
