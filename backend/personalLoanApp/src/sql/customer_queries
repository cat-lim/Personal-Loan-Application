--Query Testing


-- US-02: Views applications for one customer
-- Replace integer with valid customer IDs.

SELECT *
FROM loan_application
WHERE customer_id = 1
ORDER BY submitted_at DESC, id DESC;


-- US-02: View a particular application
-- Only return it if the specified customer owns it.

SELECT *
FROM loan_application
WHERE id = 1001
AND customer_id = 1;


-- Security test:
-- A different customer should not see this application.

SELECT *
FROM loan_application
WHERE id = 1001
AND customer_id = 2;
