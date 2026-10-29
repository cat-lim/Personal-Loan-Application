# T-05 — Repository Queries, Indexes, and Test Scenarios

## Overview

This task supports the following user stories:

- US-02: Customer application history and customer-specific application details.
- US-03: Loan officer pending application queue.

The goal is to verify repository query behavior, create PostgreSQL indexes, and provide repeatable testing scenarios.

## 1. Method Contracts

The existing `LoanApplicationRepository.java` defines the following methods:

**Customer application history**

`List<LoanApplication> findByCustomerIdOrderBySubmittedAtDescIdDesc(Long customerId)`

Returns applications belonging to the specified customer, newest first. Returns an empty list if none exist.

**Customer application details**

`Optional<LoanApplication> findByIdAndCustomerId(Long id, Long customerId)`

Returns one application only if it belongs to the specified customer. Otherwise returns `Optional.empty()`.

**Officer pending queue**

`List<LoanApplication> findByStatusOrderBySubmittedAtAscIdAsc(ApplicationStatus status)`

When called with `ApplicationStatus.SUBMITTED`, returns pending applications ordered by submission time ascending, then ID ascending.

**Duplicate-submission lookup**

`Optional<LoanApplication> findByCustomerIdAndRequestKey(Long customerId, UUID requestKey)`

Finds an existing application for the specified customer and request key.

The SQL verification scripts check the equivalent database behavior. They are not called directly by these Java repository methods.

## 2. Required Files

- `verify_baseline.sql`
- `pending_queue.sql`
- `no_applications.sql`
- `index_check.sql`

Database initialization files:

- `src/main/resources/schema.sql`
- `src/main/resources/seed/seed-data.json`

The schema contains the required indexes, and the seed data includes a customer with no applications.

## 3. Local Environment Setup

Requirements:

- Java 21
- Maven
- PostgreSQL
- pgAdmin (optional)

Create a local PostgreSQL database named `personalLoanApp`.

Configure the application's local `application.properties` with the correct connection information.

Do not commit real passwords or database credentials.

Use a dedicated disposable local database because the existing startup schema destroys and recreates tables.

Start the application from the project root:

```bash
mvn spring-boot:run
```

On startup, Spring Boot runs `schema.sql` and creates the required tables and indexes.

`DataSeeder.java` reads `seed/seed-data.json` to insert fictional customers, officers, and applications.

## 4. Baseline Seed Data

The expected fictional customers are:

| Customer | Username | Applications |
|---|---|---|
| Olivia Chen | olivia.chen | 3 |
| Mateo Singh | mateo.singh | 1 |
| Avery Brooks | avery.brooks | 0 |

Expected application statuses:

| Application | Customer | Status |
|---|---|---|
| 1001 | Olivia Chen | SUBMITTED |
| 1002 | Mateo Singh | SUBMITTED |
| 1003 | Olivia Chen | APPROVED |
| 1004 | Olivia Chen | REJECTED |

These application IDs assume a clean database initialization.

## 5. Test Procedure

Open pgAdmin and connect to the `personalLoanApp` database.

Run these scripts:

1. `verify_baseline.sql` — Verify seeded data, customer isolation, pending ordering, and indexes.
2. `pending_queue.sql` — Verify that an empty pending queue returns zero applications.
3. `no_applications.sql` — Verify that a customer without loan applications returns zero associated applications.
4. `index_check.sql` — Verify the required database indexes exist.

Run each scenario script as a complete execution.

### Scenario A: Customer Without Applications

The test selects Avery Brooks and counts associated applications.

Expected results:

- Avery exists as a customer.
- Avery has zero applications.
- The query returns an application count of 0.

The scenario can create Avery temporarily if Avery has not yet been seeded.

The final `ROLLBACK` restores the original database state. A previously seeded Avery remains in place.

### Scenario B: Empty Pending Queue

The test begins a transaction and temporarily changes all applications with `SUBMITTED` status to `APPROVED`.

Expected results:

- Pending queue before test: 2 applications.
- Pending queue during test: 0 applications.
- Pending queue after rollback: 2 applications.

These updates are for SQL verification only and are not actual officer approval decisions.

The transaction ends with `ROLLBACK` to restore the records.

## 6. Reset Instructions

### Full Database Reset

**Warning: Destructive operation. Local disposable databases only.**

The current `schema.sql` contains `DROP TABLE` statements.

When `spring.sql.init.mode=always`, restarting the Spring Boot application:

1. Drops the existing loan application, customer, and officer tables.
2. Recreates the tables and loan application sequence.
3. Recreates the customer history and pending queue indexes.
4. Reloads the fictional seed data through `DataSeeder.java`.

To perform a full local reset:

1. Stop the Spring Boot application.
2. Confirm that `spring.sql.init.mode=always` is configured locally.
3. Restart with `mvn spring-boot:run`.
4. Run `verify_baseline.sql` again.
5. Confirm that the expected applications and indexes exist.

Do not perform this reset against shared or production data.

### Individual Scenario Reset

Both scenario scripts use transactions.

`BEGIN` starts the scenario.

`ROLLBACK` reverses temporary changes.

No manual deletion or reseeding is needed after a successfully completed scenario.

If a statement fails and leaves the transaction open, execute `ROLLBACK;` in the same pgAdmin session before continuing.

Do not restart the application while a scenario transaction is active.

### Restart Verification

After the full reset, run `index_check.sql`.

Expected result: two named indexes.

Restart Spring Boot and execute the same SQL script again.

Expected result: the same two named indexes are present because `schema.sql` recreated them.

If `spring.sql.init.mode=never`, a restart does not recreate tables or indexes. Returning to `always` performs the destructive reset, so use it only on a disposable database.

## 7. Indexes

**Customer history index**

`idx_loan_application_customer_history`

Supports retrieving applications by customer ID, ordered newest first.

**Officer pending queue index**

`idx_loan_application_pending_queue`

A partial PostgreSQL index for applications whose status is `SUBMITTED`, ordered by submission time and ID.

Both indexes are defined in `schema.sql` after the `loan_application` table definition.

## 8. Expected Verification Results

| Test | Expected result |
|---|---|
| Olivia's application history | 3 applications |
| Mateo's application history | 1 application |
| Avery's application history | 0 applications |
| Olivia retrieves application 1001 | 1 row |
| Mateo retrieves application 1001 | 0 rows |
| Officer pending queue | 1001, then 1002 |
| Empty pending queue scenario | 0 pending applications |
| Queue after rollback | 2 pending applications |
| Index verification | 2 indexes |
| Index verification after restart | 2 indexes |

## 9. Integration Notes

The existing Java repository methods remain unchanged.

Customer IDs used by customer-facing services must be obtained from the authenticated user, rather than trusted directly from user input.

The officer's API or service layer must also load applicant details appropriately and enforce officer authorization.

The SQL files are verification and setup scripts, not replacements for Spring Data JPA repository implementations.

The index definitions and seed data changes must be merged into the team's shared database initialization for the changes to be available automatically to all developers.

Java repository integration tests are recommended to verify the actual repository method execution.

## 10. Verification Status

SQL files and setup documentation are prepared.

Local verification must be completed against the current team project before marking all checklist items as passed.

Record the date, observed results, and any issues after execution.
