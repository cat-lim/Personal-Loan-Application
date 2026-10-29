package com.Group1.personalLoanApp.models;

import jakarta.persistence.*;

/**
 * A customer who applies for loans. Maps to table "customer".
 * The link to loan applications lives on LoanApplication (customer_id FK);
 * use LoanApplicationRepository to fetch "My applications".
 */
@Entity
@Table(name = "customer")
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String username;

    /** BCrypt hash, never the raw password. */
    @Column(name = "password_hash", nullable = false, length = 100)
    private String passwordHash;

    /** Shown on the screens as "Olivia Chen". */
    @Column(name = "full_name", nullable = false, length = 120)
    private String fullName;

    protected Customer() { }  // required by JPA

    public Customer(String username, String passwordHash, String fullName) {
        this.username = username;
        this.passwordHash = passwordHash;
        this.fullName = fullName;
    }

    public Long getId() { return id; }
    public String getUsername() { return username; }
    public String getPasswordHash() { return passwordHash; }
    public String getFullName() { return fullName; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
}
