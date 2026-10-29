# Personal-Loan-Application

## Database setup

### Prerequisites

- Java 21
- Maven 3.9+ (or the IDE's bundled Maven)
- PostgreSQL 16 (any recent version works), running on `localhost:5432`
- pgAdmin 4 (optional, for viewing data)
### 1. Create the database (one time)

The name is case-sensitive and must be exactly `personalLoanApp`.

- **pgAdmin:** right-click *Databases* → *Create* → *Database*, name it `personalLoanApp`, then *Save*.
- **psql:** quotes are required, otherwise Postgres creates `personalloanapp`:
```sql
  CREATE DATABASE "personalLoanApp";
```

### 2. Configure the connection

`src/main/resources/application.properties`. Change the username and password if your local
Postgres differs:

```properties
# Database URL
spring.datasource.url=jdbc:postgresql://localhost:5432/personalLoanApp
# Database Credentials
spring.datasource.username=postgres
spring.datasource.password=12345
# PostgreSQL Driver
spring.datasource.driver-class-name=org.postgresql.Driver
 
# Tables come from schema.sql, not from Hibernate
spring.jpa.hibernate.ddl-auto=none
spring.sql.init.mode=always
 
# Log SQL to the console
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
```

### 3. Start the app

```bash
mvn spring-boot:run
```

Or run `PersonalLoanAppApplication` from your IDE.

On startup:

1. `schema.sql` drops and recreates the `customer`, `loan_officer` and `loan_application`
   tables, plus the `loan_application_seq` sequence.
2. `DataSeeder` reads `seed-data.json` and inserts the sample customers, officer and
   applications. It skips seeding if the `customer` table already has rows.
   A successful start ends with `Started PersonalLoanAppApplication in ... seconds`, and the
   console shows the `insert` statements from the seeder.

> **Every restart resets the database.** `schema.sql` drops all tables each time the app
> starts, so any data entered by hand is lost. To keep data between restarts, set
> `spring.sql.init.mode=never` after the first run.

### 4. Verify

In pgAdmin, right-click **personalLoanApp** → **Query Tool**, paste the query below and press
**F5**:

```sql
SELECT 'LN-' || l.id        AS reference,
       c.full_name          AS customer,
       l.loan_amount,
       l.term_months,
       l.purpose,
       l.employment_status,
       l.monthly_income,
       l.status,
       l.submitted_at,
       o.full_name          AS decided_by,
       l.decided_at,
       l.decision_note
FROM loan_application l
JOIN customer c          ON c.id = l.customer_id
LEFT JOIN loan_officer o ON o.id = l.decided_by_officer_id
ORDER BY l.id;
```

Expected result: four rows.

| reference | customer    | loan_amount | term_months | status    | decided_by |
|-----------|-------------|-------------|-------------|-----------|------------|
| LN-1001   | Olivia Chen | 12000.00    | 24          | SUBMITTED |            |
| LN-1002   | Mateo Singh | 8000.00     | 12          | SUBMITTED |            |
| LN-1003   | Olivia Chen | 5000.00     | 12          | APPROVED  | Jordan Lee |
| LN-1004   | Olivia Chen | 20000.00    | 36          | REJECTED  | Jordan Lee |

pgAdmin shows timestamps in your local time zone, so they may differ from the UTC times in
`seed-data.json`. That is expected.

### Reset to a clean seeded state

- **If `spring.sql.init.mode=always`** (the default above): restart the app.
- **If `spring.sql.init.mode=never`:** set it back to `always` for one run, or run the script
  manually and then restart so the seeder reloads the data:
```bash
  psql -U postgres -d personalLoanApp -f src/main/resources/schema.sql
```

In pgAdmin you can instead open `schema.sql` in the Query Tool and run it.
 
---

## Seed data (fictional)

### Accounts

| Role     | Username      | Password      |
|----------|---------------|---------------|
| Customer | `olivia.chen` | `password123` |
| Customer | `mateo.singh` | `password123` |
| Officer  | `jordan.lee`  | `password123` |

Passwords are currently stored as plain text for development. Hashing (BCrypt) will be added
during server-side development; the column is already named `password_hash` so no schema
change will be needed.

### Applications

| Reference | Customer    | Amount  | Term | Purpose            | Status    |
|-----------|-------------|---------|------|--------------------|-----------|
| LN-1001   | Olivia Chen | $12,000 | 24   | Home improvement   | SUBMITTED |
| LN-1002   | Mateo Singh | $8,000  | 12   | Car repair         | SUBMITTED |
| LN-1003   | Olivia Chen | $5,000  | 12   | Debt consolidation | APPROVED  |
| LN-1004   | Olivia Chen | $20,000 | 36   | Home improvement   | REJECTED  |

To change the sample data, edit `seed-data.json` and restart. Applications are inserted in
file order, so the first one becomes LN-1001.
 
---

## Field dictionary

**Source:** *Client* = sent by the frontend form. *Server* = set by the backend, never accepted
from the client. *Officer* = entered by the loan officer when deciding.

### `customer` (`Customer.java`)

| Column          | Java field     | Type         | Required | Source | Notes |
|-----------------|----------------|--------------|----------|--------|-------|
| `id`            | `id`           | bigint       | Yes      | Server | Primary key, auto-generated |
| `username`      | `username`     | varchar(50)  | Yes      | Client | Unique |
| `password_hash` | `passwordHash` | varchar(100) | Yes      | Server | Plain text for now; BCrypt hash later |
| `full_name`     | `fullName`     | varchar(120) | Yes      | Client | Shown on screens, e.g. "Olivia Chen" |

### `loan_officer` (`LoanOfficer.java`)

| Column          | Java field     | Type         | Required | Source | Notes |
|-----------------|----------------|--------------|----------|--------|-------|
| `id`            | `id`           | bigint       | Yes      | Server | Primary key, auto-generated |
| `username`      | `username`     | varchar(50)  | Yes      | Client | Unique; stored lowercase |
| `password_hash` | `passwordHash` | varchar(100) | Yes      | Server | Plain text for now; BCrypt hash later |
| `full_name`     | `fullName`     | varchar(100) | Yes      | Client | Shown on decisions, e.g. "Jordan Lee" |

### `loan_application` (`LoanApplication.java`)

| Column                  | Java field         | Type          | Required | Source  | Notes |
|-------------------------|--------------------|---------------|----------|---------|-------|
| `id`                    | `id`               | bigint        | Yes      | Server  | Primary key from `loan_application_seq`, starts at 1001. Displayed as reference `LN-{id}` |
| `customer_id`           | `customer`         | bigint        | Yes      | Server  | FK → `customer.id`; taken from the logged-in customer |
| `request_key`           | `requestKey`       | uuid          | Yes      | Client  | Idempotency key. Unique per customer; reused when retrying the same submission |
| `loan_amount`           | `loanAmount`       | numeric(12,2) | Yes      | Client  | USD. Form allows $1,000 to $50,000 |
| `term_months`           | `termMonths`       | integer       | Yes      | Client  | 12, 24 or 36 |
| `purpose`               | `purpose`          | varchar(200)  | Yes      | Client  | Free text, e.g. "Home improvement" |
| `employment_status`     | `employmentStatus` | varchar(20)   | Yes      | Client  | `EMPLOYED`, `SELF_EMPLOYED`, `RETIRED`, `OTHER` |
| `monthly_income`        | `monthlyIncome`    | numeric(12,2) | Yes      | Client  | USD |
| `status`                | `status`           | varchar(20)   | Yes      | Server  | `SUBMITTED` on creation (= pending queue); officer sets `APPROVED` or `REJECTED` |
| `submitted_at`          | `submittedAt`      | timestamptz   | Yes      | Server  | Set when the application is created |
| `decision_note`         | `decisionNote`     | varchar(1000) | No       | Officer | Required when rejecting. Visible to the customer |
| `decided_at`            | `decidedAt`        | timestamptz   | No       | Server  | Set when an officer approves or rejects |
| `decided_by_officer_id` | `decidedBy`        | bigint        | No       | Server  | FK → `loan_officer.id`; empty while `SUBMITTED` |

### Relationships

```
customer 1 ──── * loan_application * ──── 0..1 loan_officer
           (customer_id)          (decided_by_officer_id)
```

- One customer has many loan applications. Each application belongs to exactly one customer.
- One loan officer decides many loan applications. An application has no officer until it is decided.
### Keys and constraints

- **Primary keys:** `id` on every table.
- **Foreign keys:**
    - `loan_application.customer_id` → `customer.id`
    - `loan_application.decided_by_officer_id` → `loan_officer.id`
- **Unique:**
    - `customer.username`
    - `loan_officer.username`
    - (`loan_application.customer_id`, `loan_application.request_key`)
- **NOT NULL:** every column marked *Required* above.
- **Check** `ck_loan_decision_consistent` on `loan_application`:
    - `SUBMITTED` rows have no `decided_at`, `decided_by_officer_id` or `decision_note`.
    - `APPROVED` and `REJECTED` rows have both `decided_at` and `decided_by_officer_id`.
    - `REJECTED` rows have a non-blank `decision_note`.
- **Other business rules** (amount range, allowed terms) are checked in the backend by
  `LoanApplicationValidator`.
---

## Changing the schema

Keep `schema.sql` and the entity classes in `models/` in sync. When you add, rename or remove
a field in a model:

1. Make the same change in `schema.sql`.
2. Update `seed-data.json` (and `DataSeeder.java`) if the field should have sample data.
3. Update the field dictionary in this README.
4. Restart the app and re-run the verify query.
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

Restart the app afterwards to put LN-1001 back to `SUBMITTED` (see
[Reset to a clean seeded state](#reset-to-a-clean-seeded-state)).

---

## Troubleshooting

| Error message contains | Cause | Fix |
|---|---|---|
| `database "personalLoanApp" does not exist` | Database was created as `personalloanapp` | `CREATE DATABASE "personalLoanApp";` with quotes, or create it in pgAdmin |
| `password authentication failed` | Wrong credentials in `application.properties` | Use your local Postgres username and password |
| `relation "customer" does not exist` | `schema.sql` didn't run | Check it is in `src/main/resources` (not in a Java package) and `spring.sql.init.mode=always` is set |
| `relation "loan_application" does not exist` in pgAdmin | Query Tool opened on the `postgres` database | Open the Query Tool from **personalLoanApp** |
| `FileNotFoundException ... seed-data.json` | JSON in the wrong folder | Must be at `src/main/resources/seed/seed-data.json` |
| Tables exist but are empty | Spring didn't find `DataSeeder` | The `seed` folder must be inside `com/Group1/personalLoanApp/` |
| `required a bean of type 'com.fasterxml.jackson.databind.ObjectMapper'` | Jackson not available, or Spring Boot 4 (Jackson 3) | Boot 4: import `tools.jackson.databind.ObjectMapper` in `DataSeeder`. Boot 3: add `spring-boot-starter-json` or `spring-boot-starter-web` to `pom.xml` |
| `Cannot deserialize value of type EmploymentStatus` | Typo in `seed-data.json` | Use exactly `EMPLOYED`, `SELF_EMPLOYED`, `RETIRED` or `OTHER` |
| `violates check constraint "ck_loan_decision_consistent"` | A row's decision fields don't match its status | `SUBMITTED` rows need no decision fields; decided rows need `decidedAt` and `decidedByUsername`; `REJECTED` rows need a `decisionNote` |
