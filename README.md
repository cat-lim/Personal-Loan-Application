# Personal-Loan-Application

## Database setup

The schema is defined by the JPA entities in `src/main/java/com/loanapp/model/`.
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

Edit `src/main/resources/application.properties` if your Postgres user or password differ:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/personalLoanApp
spring.datasource.username=postgres
spring.datasource.password=12345
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
- Business rules (amount range, allowed terms, note required on rejection) are enforced in the backend.

### Changing the schema

Schema changes are made by editing the entity classes in `model/`.
`ddl-auto=update` adds new tables and columns but never removes or changes
existing ones. After renaming or removing a field, or changing a constraint,
run the reset profile above.