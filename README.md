# Personal-Loan-Application

## Database setup

The schema is defined by the JPA entities in `src/main/java/com/Group1/personalLoanApp/models/`.
Hibernate creates the tables on startup, and `DataSeeder` loads fictional data
from `src/main/resources/seed/seed-data.json`. There are no `.sql` files to run.

### Prerequisites

- Java 21
- Maven 3.9+
- PostgreSQL 16 (any recent version works), running on `localhost:5432`

### 1. Create the database (one time)

The name is case-sensitive and must be exactly `personalLoanApp`.

- **pgAdmin:** right-click *Databases* → *Create* → *Database*, name it `personalLoanApp`.
- **psql:** quotes are required, otherwise Postgres creates `personalloanapp`:

```sql
  CREATE DATABASE "personalLoanApp";
```

### 2. Configure the connection

`src/main/resources/application.properties` is not committed (it is in `.gitignore`),
so each developer keeps their own credentials. Create it with the contents below,
changing the URL, user and password to match your Postgres:

```properties
spring.application.name=personalLoanApp

spring.datasource.url=jdbc:postgresql://localhost:5432/personalLoanApp
spring.datasource.username=postgres
spring.datasource.password=<your-password>
spring.datasource.driver-class-name=org.postgresql.Driver

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.open-in-view=false
spring.sql.init.mode=never

# Load seed/seed-data.json on startup if the tables are empty
app.seed.enabled=true
```

### 3. Start the app

```bash
mvn spring-boot:run
```

On first start, Hibernate creates the `customer`, `loan_officer` and
`loan_application` tables, and the seeder inserts the sample data. On later
starts the seeder sees existing data and skips, so nothing is duplicated.

### 4. Verify

```sql
\c "personalLoanApp"
\dt
SELECT id, status, loan_amount FROM loan_application ORDER BY id;
```

You should see four applications, with ids 1001–1004.

### Reset to a clean seeded state

This drops all tables, recreates them from the entities, and reseeds:

```bash
mvn spring-boot:run -Dspring-boot.run.profiles=reset
```

Stop the app after it starts, then run normally with `mvn spring-boot:run`.
Any data you entered by hand is deleted.

### Seed accounts (fictional)

| Role     | Username      | Password      |
|----------|---------------|---------------|
| Customer | `olivia.chen` | `password123` |
| Customer | `mateo.singh` | `password123` |
| Officer  | `jordan.lee`  | `password123` |

Passwords are stored as BCrypt hashes.

### Seed applications

| Reference | Customer    | Amount  | Term | Status    |
|-----------|-------------|---------|------|-----------|
| LN-1001   | Olivia Chen | $12,000 | 24   | SUBMITTED |
| LN-1002   | Mateo Singh | $8,000  | 12   | SUBMITTED |
| LN-1003   | Olivia Chen | $5,000  | 12   | APPROVED  |
| LN-1004   | Olivia Chen | $20,000 | 36   | REJECTED  |

---

## Field dictionary

**Source:** *Client* = sent by the frontend form. *Server* = set by the backend,
never accepted from the client.

### `customer`

| Column          | Java field     | Type          | Required | Source | Notes |
|-----------------|----------------|---------------|----------|--------|-------|
| `id`            | `id`           | bigint        | Yes      | Server | Primary key, auto-increment |
| `username`      | `username`     | varchar(50)   | Yes      | Client | Unique |
| `password_hash` | `passwordHash` | varchar(100)  | Yes      | Server | BCrypt hash of the password; raw password is never stored |
| `full_name`     | `fullName`     | varchar(120)  | Yes      | Client | Shown on screens, e.g. "Olivia Chen" |

### `loan_officer`

| Column          | Java field     | Type          | Required | Source | Notes |
|-----------------|----------------|---------------|----------|--------|-------|
| `id`            | `id`           | bigint        | Yes      | Server | Primary key, auto-increment |
| `username`      | `username`     | varchar(50)   | Yes      | Client | Unique |
| `password_hash` | `passwordHash` | varchar(100)  | Yes      | Server | BCrypt hash |
| `full_name`     | `fullName`     | varchar(100)  | Yes      | Client | Shown on decisions, e.g. "Jordan Lee" |

### `loan_application`

| Column                  | Java field         | Type           | Required | Source | Notes |
|-------------------------|--------------------|----------------|----------|--------|-------|
| `id`                    | `id`               | bigint         | Yes      | Server | Primary key from `loan_application_seq`, starts at 1001. Displayed as reference `LN-{id}` |
| `customer_id`           | `customer`         | bigint         | Yes      | Server | FK → `customer.id`; taken from the logged-in customer |
| `request_key`           | `requestKey`       | uuid           | Yes      | Client | Idempotency key. Unique per customer (`customer_id`, `request_key`); reused when retrying the same submission |
| `loan_amount`           | `loanAmount`       | numeric(12,2)  | Yes      | Client | USD. Form allows $1,000–$50,000 |
| `term_months`           | `termMonths`       | integer        | Yes      | Client | 12, 24 or 36 |
| `purpose`               | `purpose`          | varchar(200)   | Yes      | Client | Free text, e.g. "Home improvement" |
| `employment_status`     | `employmentStatus` | varchar(20)    | Yes      | Client | `EMPLOYED`, `SELF_EMPLOYED`, `RETIRED`, `OTHER` |
| `monthly_income`        | `monthlyIncome`    | numeric(12,2)  | Yes      | Client | USD |
| `status`                | `status`           | varchar(20)    | Yes      | Server | `SUBMITTED` on creation; officer sets `APPROVED` or `REJECTED`. `SUBMITTED` = pending queue |
| `submitted_at`          | `submittedAt`      | timestamptz    | Yes      | Server | Set when the application is created |
| `decision_note`         | `decisionNote`     | varchar(1000)  | No       | Officer| Required when rejecting. Visible to the customer |
| `decided_at`            | `decidedAt`        | timestamptz    | No       | Server | Set when an officer approves or rejects |
| `decided_by_officer_id` | `decidedBy`        | bigint         | No       | Server | FK → `loan_officer.id`; the officer who decided |

### Relationships

- One `customer` has many `loan_application` rows (`loan_application.customer_id`).
- One `loan_officer` decides many `loan_application` rows (`loan_application.decided_by_officer_id`, empty while `SUBMITTED`).

### Keys and constraints

- Primary keys on every table.
- Foreign keys: `loan_application.customer_id` → `customer.id`, `loan_application.decided_by_officer_id` → `loan_officer.id`.
- Unique: `customer.username`, `loan_officer.username`, (`loan_application.customer_id`, `loan_application.request_key`).
- NOT NULL on every column marked *Required* above.
- Check `ck_loan_decision_consistent` on `loan_application`:
  - `SUBMITTED` rows have no `decided_at`, `decided_by_officer_id` or `decision_note`.
  - `APPROVED` and `REJECTED` rows have both `decided_at` and `decided_by_officer_id`.
  - `REJECTED` rows have a non-blank `decision_note`.
- Other business rules (amount range, allowed terms) are enforced in the backend by `LoanApplicationValidator`.

`ddl-auto=update` does not add the check constraint to a table that already
exists. Either run the reset profile, or add it by hand once:

```sql
ALTER TABLE loan_application ADD CONSTRAINT ck_loan_decision_consistent CHECK (
  (status = 'SUBMITTED' AND decided_at IS NULL
     AND decided_by_officer_id IS NULL AND decision_note IS NULL)
  OR (status IN ('APPROVED', 'REJECTED') AND decided_at IS NOT NULL
     AND decided_by_officer_id IS NOT NULL
     AND (status <> 'REJECTED' OR NULLIF(BTRIM(decision_note), '') IS NOT NULL))
);
```

### Changing the schema

Schema changes are made by editing the entity classes in `models/`.
`ddl-auto=update` adds new tables and columns but never removes or changes
existing ones. After renaming or removing a field, or changing a constraint,
run the reset profile above.

---

## Recording a decision

An officer's approve or reject is saved by
`LoanApplicationRepository.decideIfSubmitted`. It is a single conditional
`UPDATE`, so the status, note, officer and timestamp are written together, and
only if the application is still `SUBMITTED`. Two officers can never both
decide the same application, and a later decision never overwrites an earlier one.

### Service contract

```java
int decideIfSubmitted(Long applicationId, String decision, String decisionNote,
                      Long officerId, Instant decidedAt)
```

| Parameter       | Value |
|-----------------|-------|
| `applicationId` | The application's `id` (1001 for LN-1001) |
| `decision`      | `"APPROVED"` or `"REJECTED"` (use `ApplicationStatus.name()`) |
| `decisionNote`  | Optional when approving. Required and non-blank when rejecting. Max 1000 characters |
| `officerId`     | `id` of the logged-in officer |
| `decidedAt`     | `Instant.now()` on the server; never taken from the client |

**Returns** the number of rows changed:

- `1`: the decision was recorded.
- `0`: nothing was changed. The application doesn't exist, it was already
  decided, or the arguments broke one of the rules above.

The service that calls it should:

1. Run `LoanApplicationValidator.validateDecision(...)` and return **400** with the
   errors if there are any.
2. Call `decideIfSubmitted(...)`.
3. On `1`, reload the application with `findById` and return **200**.
4. On `0`, call `findById`. If it is empty, return **404**. Otherwise another
   officer decided first: return **409 Conflict** with the current application,
   so the officer sees the decision that was kept.

The validator is an early check that gives readable error messages. The
conditional `UPDATE` is what actually prevents a conflict, because the
application can change between the check and the update.

### Success and conflict scenario

LN-1001 is `SUBMITTED`. Officers A and B both open it from the pending queue.

| Step | Action | Result |
|------|--------|--------|
| 1 | A approves LN-1001 | `UPDATE` matches the `SUBMITTED` row and returns `1`. LN-1001 is now `APPROVED` by A |
| 2 | B rejects LN-1001 with "Income too low" | The row is no longer `SUBMITTED`, so the `UPDATE` returns `0`. The service returns 409 |
| 3 | Anyone reads LN-1001 | Still `APPROVED` by A, with A's timestamp. B's note was never saved |
| 4 | Load the pending queue | LN-1001 is gone, because `findByStatusOrderBySubmittedAtAscIdAsc(SUBMITTED)` only returns `SUBMITTED` rows |

If both clicks arrive at the same moment, PostgreSQL locks the row for the
first `UPDATE`. The second waits until the first commits, then checks
`status = 'SUBMITTED'` again against the committed row, finds it no longer
matches, and changes 0 rows.

You can watch this happen with two `psql` windows connected to the database:

```sql
-- Window A
BEGIN;
UPDATE loan_application
   SET status = 'APPROVED', decided_by_officer_id = 1, decided_at = now()
 WHERE id = 1001 AND status = 'SUBMITTED';
-- UPDATE 1   (do not commit yet)

-- Window B: this waits, because A holds the row
UPDATE loan_application
   SET status = 'REJECTED', decision_note = 'Income too low',
       decided_by_officer_id = 1, decided_at = now()
 WHERE id = 1001 AND status = 'SUBMITTED';

-- Window A
COMMIT;

-- Window B now finishes with: UPDATE 0

SELECT id, status, decision_note, decided_at FROM loan_application WHERE id = 1001;
-- APPROVED, no note: A's decision was kept
```

Run the reset profile afterwards to put LN-1001 back to `SUBMITTED`.