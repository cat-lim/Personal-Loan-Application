
-- US-03: Retrieve all pending applications
-- Include customer information and order oldest first.

SELECT
    l.id,
    c.full_name AS applicant_name,
    c.username AS applicant_username,
    l.loan_amount,
    l.term_months,
    l.purpose,
    l.employment_status,
    l.monthly_income,
    l.status,
    l.submitted_at
FROM loan_application l
JOIN customer c
    ON l.customer_id = c.id
WHERE l.status = 'SUBMITTED'
ORDER BY l.submitted_at ASC, l.id ASC;
