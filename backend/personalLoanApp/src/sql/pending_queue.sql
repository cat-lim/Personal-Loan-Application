
-- T-05: Empty pending queue scenario
-- US-03

-- Start a temporary transaction.
BEGIN;

-- Temporarily change pending applications
-- to approved applications.
-- This is a test only, not a real approval workflow.

UPDATE loan_application
SET
    status = 'APPROVED',
    decided_at = CURRENT_TIMESTAMP,
    decided_by_officer_id = (
        SELECT id
        FROM loan_officer
        WHERE username = 'jordan.lee'
    ),
    decision_note = NULL
WHERE status = 'SUBMITTED';

-- Check the pending queue.
-- Expected: zero rows.

SELECT
    l.id,
    c.full_name,
    l.status,
    l.submitted_at
FROM loan_application l
JOIN customer c
    ON c.id = l.customer_id
WHERE l.status = 'SUBMITTED'
ORDER BY l.submitted_at ASC, l.id ASC;


-- Automatically verify the test result.

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM loan_application
        WHERE status = 'SUBMITTED'
    ) THEN
        RAISE EXCEPTION 'FAIL: Pending queue is not empty';
    END IF;

    RAISE NOTICE 'PASS: Pending queue is empty';
END $$;


-- Undo all changes made during the test.
ROLLBACK;


-- Verify that pending applications were restored.
-- Expected: applications 1001 and 1002.

SELECT
    id,
    status
FROM loan_application
WHERE status = 'SUBMITTED'
ORDER BY submitted_at ASC, id ASC;
