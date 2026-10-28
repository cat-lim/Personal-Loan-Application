
-- T-05: Customer without applications
-- US-02

BEGIN;

-- Create Avery if not already present.
-- Avoid duplicate usernames.

INSERT INTO customer (
    username,
    password_hash,
    full_name
)
VALUES (
    'avery.brooks',
    'DEVELOPMENT-ONLY-NOT-FOR-LOGIN',
    'Avery Brooks'
)
ON CONFLICT (username) DO NOTHING;


-- Retrieve Avery and count applications.
-- Expected application_count = 0.

SELECT
    c.id,
    c.username,
    c.full_name,
    COUNT(l.id) AS application_count
FROM customer c
LEFT JOIN loan_application l
    ON l.customer_id = c.id
WHERE c.username = 'avery.brooks'
GROUP BY
    c.id,
    c.username,
    c.full_name;


-- Automatically verify the expected result.

DO $$
BEGIN
    IF (
        SELECT COUNT(*)
        FROM customer
        WHERE username = 'avery.brooks'
    ) <> 1 THEN
        RAISE EXCEPTION 'FAIL: Avery is missing';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM loan_application l
        JOIN customer c
            ON c.id = l.customer_id
        WHERE c.username = 'avery.brooks'
    ) THEN
        RAISE EXCEPTION 'FAIL: Avery has loan applications';
    END IF;

    RAISE NOTICE 'PASS: Customer has zero applications';
END $$;


-- Restore original database state.
ROLLBACK;
