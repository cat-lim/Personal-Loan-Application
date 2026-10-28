
-- T-05: Baseline verification
-- US-02 and US-03

-- Test 1: Count applications for each customer.
-- Expected:
-- Olivia = 3, Mateo = 1, Avery = 0

SELECT
    c.username,
    c.full_name,
    COUNT(l.id) AS application_count
FROM customer c
LEFT JOIN loan_application l
    ON l.customer_id = c.id
WHERE c.username IN (
    'olivia.chen',
    'mateo.singh',
    'avery.brooks'
)
GROUP BY c.id, c.username, c.full_name
ORDER BY c.username;


-- Test 2: Customer application history.
-- Olivia's applications, newest first.
-- Expected: 1004, 1003, 1001

SELECT
    l.id,
    l.status,
    l.submitted_at
FROM loan_application l
JOIN customer c
    ON c.id = l.customer_id
WHERE c.username = 'olivia.chen'
ORDER BY l.submitted_at DESC, l.id DESC;


-- Test 3: Valid customer application details.
-- Expected: one row for application 1001.

SELECT l.id, l.status
FROM loan_application l
JOIN customer c
    ON c.id = l.customer_id
WHERE l.id = 1001
AND c.username = 'olivia.chen';


-- Test 4: Invalid customer application details.
-- Mateo cannot retrieve Olivia's application.
-- Expected: zero rows.

SELECT l.id, l.status
FROM loan_application l
JOIN customer c
    ON c.id = l.customer_id
WHERE l.id = 1001
AND c.username = 'mateo.singh';


-- Test 5: Officer pending queue.
-- Expected: 1001, then 1002.

SELECT
    l.id,
    c.full_name AS applicant_name,
    l.status,
    l.submitted_at,
    l.loan_amount,
    l.term_months,
    l.purpose,
    l.employment_status,
    l.monthly_income
FROM loan_application l
JOIN customer c
    ON c.id = l.customer_id
WHERE l.status = 'SUBMITTED'
ORDER BY l.submitted_at ASC, l.id ASC;


-- Test 6: Verify required indexes exist.

SELECT
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename = 'loan_application'
AND indexname IN (
    'idx_loan_application_customer_history',
    'idx_loan_application_pending_queue'
)
ORDER BY indexname;
