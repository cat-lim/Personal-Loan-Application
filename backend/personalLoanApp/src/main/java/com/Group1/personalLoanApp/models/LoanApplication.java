package com.Group1.personalLoanApp.models;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * One loan request. Maps to table "loan_application".
 *
 * Client-supplied: loanAmount, termMonths, purpose, employmentStatus, monthlyIncome, requestKey.
 * Server-generated: id (reference), status, submittedAt, decision fields.
 */
@Entity
@Table(
    name = "loan_application",
    uniqueConstraints = @UniqueConstraint(
        name = "uk_loan_customer_request_key",
        columnNames = {"customer_id", "request_key"}),  // request key is unique per customer
    // Pending rows have no decision fields; decided rows have all of them, and a rejection has a reason.
    check = @CheckConstraint(
        name = "ck_loan_decision_consistent",
        constraint = "(status = 'SUBMITTED' AND decided_at IS NULL "
            + "AND decided_by_officer_id IS NULL AND decision_note IS NULL) "
            + "OR (status IN ('APPROVED', 'REJECTED') AND decided_at IS NOT NULL "
            + "AND decided_by_officer_id IS NOT NULL "
            + "AND (status <> 'REJECTED' OR NULLIF(BTRIM(decision_note), '') IS NOT NULL))")
)
public class LoanApplication {

    // Allowed values for two columns of this table (stored as text, not separate tables).
    public enum EmploymentStatus { EMPLOYED, SELF_EMPLOYED, RETIRED, OTHER }
    public enum ApplicationStatus { SUBMITTED, APPROVED, REJECTED }

    /** Starts at 1001 so references read LN-1001, LN-1002, ... */
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "loan_application_seq")
    @SequenceGenerator(name = "loan_application_seq", sequenceName = "loan_application_seq",
                       initialValue = 1001, allocationSize = 1)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @Column(name = "request_key", nullable = false)
    private UUID requestKey;

    @Column(name = "loan_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal loanAmount;

    @Column(name = "term_months", nullable = false)
    private Integer termMonths;          // 12, 24 or 36

    @Column(nullable = false, length = 200)
    private String purpose;

    @Enumerated(EnumType.STRING)
    @Column(name = "employment_status", nullable = false, length = 20)
    private EmploymentStatus employmentStatus;

    @Column(name = "monthly_income", nullable = false, precision = 12, scale = 2)
    private BigDecimal monthlyIncome;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ApplicationStatus status;

    @Column(name = "submitted_at", nullable = false)
    private Instant submittedAt;

    @Column(name = "decision_note", length = 1000)
    private String decisionNote;

    @Column(name = "decided_at")
    private Instant decidedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "decided_by_officer_id")
    private LoanOfficer decidedBy;

    public LoanApplication() { }

    /** Server-generated defaults for a new submission. */
    @PrePersist
    void onCreate() {
        if (status == null) status = ApplicationStatus.SUBMITTED;
        if (submittedAt == null) submittedAt = Instant.now();
    }

    /** "LN-1004", derived from the id. */
    public String getReference() { return id == null ? null : "LN-" + id; }

    public Long getId() { return id; }

    public Customer getCustomer() { return customer; }
    public void setCustomer(Customer customer) { this.customer = customer; }

    public UUID getRequestKey() { return requestKey; }
    public void setRequestKey(UUID requestKey) { this.requestKey = requestKey; }

    public BigDecimal getLoanAmount() { return loanAmount; }
    public void setLoanAmount(BigDecimal loanAmount) { this.loanAmount = loanAmount; }

    public Integer getTermMonths() { return termMonths; }
    public void setTermMonths(Integer termMonths) { this.termMonths = termMonths; }

    public String getPurpose() { return purpose; }
    public void setPurpose(String purpose) { this.purpose = purpose; }

    public EmploymentStatus getEmploymentStatus() { return employmentStatus; }
    public void setEmploymentStatus(EmploymentStatus employmentStatus) { this.employmentStatus = employmentStatus; }

    public BigDecimal getMonthlyIncome() { return monthlyIncome; }
    public void setMonthlyIncome(BigDecimal monthlyIncome) { this.monthlyIncome = monthlyIncome; }

    public ApplicationStatus getStatus() { return status; }
    public void setStatus(ApplicationStatus status) { this.status = status; }

    public Instant getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(Instant submittedAt) { this.submittedAt = submittedAt; }

    public String getDecisionNote() { return decisionNote; }
    public void setDecisionNote(String decisionNote) { this.decisionNote = decisionNote; }

    public Instant getDecidedAt() { return decidedAt; }
    public void setDecidedAt(Instant decidedAt) { this.decidedAt = decidedAt; }

    public LoanOfficer getDecidedBy() { return decidedBy; }
    public void setDecidedBy(LoanOfficer decidedBy) { this.decidedBy = decidedBy; }
}
