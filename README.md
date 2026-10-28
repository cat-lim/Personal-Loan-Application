# T-05 — Repository Queries, Indexes and Scenarios

## Objective
Implement and verify the database queries and supporting indexes for customer loan application tracking (US-02) and the officer pending queue (US-03).

## Technologies
- Java 21 / Spring Boot / Spring Data JPA
- PostgreSQL
- pgAdmin
- SQL

## Files
- `customer-queries.sql` — Customer-scoped application history and details
- `officer-queue.sql` — Pending applications with applicant information
- `repository-indexes.sql` — Customer history and pending queue indexes

## Repository contracts
The existing `LoanApplicationRepository` exposes:

- `findByCustomerIdOrderBySubmittedAtDescIdDesc(Long customerId)`
- `findByIdAndCustomerId(Long id, Long customerId)`
- `findByStatusOrderBySubmittedAtAscIdAsc(ApplicationStatus status)`
- `findByCustomerIdAndRequestKey(Long customerId, UUID requestKey)`

The officer queue uses `ApplicationStatus.SUBMITTED`.

## Test procedure
1. Start the local PostgreSQL database.
2. Start the application to initialize the original schema and seed data.
3. Execute the customer and officer queries in pgAdmin.
4. Execute the index creation script.
5. Run the test scenarios using transactions.
6. Verify the returned records and ordering.

## Expected results
- Customer history is restricted to the requested customer.
- A customer cannot retrieve another customer's application using a mismatched customer ID.
- The officer queue includes only submitted applications and is ordered oldest first, with ID as the tiebreaker.
- The no-application customer returns no records.
- The empty pending queue returns no records.

## Integration notes
The original Java repository methods remain unchanged.
The new indexes must be included in the shared database initialization or migration process for other environments.
