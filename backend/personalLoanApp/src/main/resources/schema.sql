-- schema.sql
-- Runs on every startup, so drop the old tables first.
-- loan_applications is dropped first because it points to users.
DROP TABLE IF EXISTS loan_applications;
DROP TABLE IF EXISTS users;


-- ============================================================
-- Step 1: Create tables with primary/foreign keys,
--         role/status constraints and exact decimal fields
-- ============================================================

CREATE TABLE users (
    user_id       INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role          VARCHAR(20)  NOT NULL,

    CONSTRAINT chk_users_role CHECK (role IN ('CUSTOMER', 'OFFICER'))
);

CREATE TABLE loan_applications (
    application_id      INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    customer_id         INTEGER       NOT NULL REFERENCES users(user_id),
    loan_amount         NUMERIC(12,2) NOT NULL,
    term_months         INTEGER       NOT NULL,
    purpose             VARCHAR(120)  NOT NULL,
    employment_status   VARCHAR(20)   NOT NULL,
    monthly_income      NUMERIC(12,2) NOT NULL,
    status              VARCHAR(20)   NOT NULL DEFAULT 'SUBMITTED',
    submission_time     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    request_key         UUID          NOT NULL,
    decision_note       VARCHAR(500),
    decision_officer_id INTEGER REFERENCES users(user_id),
    decision_time       TIMESTAMPTZ,

    CONSTRAINT chk_loan_status
        CHECK (status IN ('SUBMITTED', 'APPROVED', 'REJECTED')),

    CONSTRAINT chk_loan_employment_status
        CHECK (employment_status IN ('EMPLOYED', 'SELF_EMPLOYED', 'RETIRED', 'OTHER'))
);


-- ============================================================
-- Step 2: Allowed term, amount range, positive income and
--         required-field constraints
-- ============================================================

ALTER TABLE loan_applications
    ADD CONSTRAINT chk_loan_term
        CHECK (term_months IN (12, 24, 36));

ALTER TABLE loan_applications
    ADD CONSTRAINT chk_loan_amount_range
        CHECK (loan_amount >= 1000 AND loan_amount <= 50000);

ALTER TABLE loan_applications
    ADD CONSTRAINT chk_loan_income_positive
        CHECK (monthly_income > 0);

-- Purpose can't be blank (NOT NULL alone still allows '   ')
ALTER TABLE loan_applications
    ADD CONSTRAINT chk_loan_purpose_not_blank
        CHECK (TRIM(purpose) <> '');

-- A rejection must have a decision note
ALTER TABLE loan_applications
    ADD CONSTRAINT chk_loan_rejection_note
        CHECK (status <> 'REJECTED' OR decision_note IS NOT NULL);

-- Officer and decision time are set together with the final status
ALTER TABLE loan_applications
    ADD CONSTRAINT chk_loan_decision_fields
        CHECK (status = 'SUBMITTED' OR (decision_officer_id IS NOT NULL AND decision_time IS NOT NULL));


-- ============================================================
-- Step 3: Unique customer/request key
-- ============================================================
-- If the same customer sends the same request_key twice (a retry),
-- the second insert fails with this constraint. T-04 handles that
-- error in the API by returning the application that already exists.

ALTER TABLE loan_applications
    ADD CONSTRAINT uq_loan_customer_request_key
        UNIQUE (customer_id, request_key);
