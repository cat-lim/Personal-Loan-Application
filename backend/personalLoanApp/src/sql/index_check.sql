
-- T-05: Verify required indexes

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

-- Expected: exactly 2 rows.
--
-- Run after database setup.
-- Restart Spring Boot and run again.
-- Both indexes should still exist because
-- schema.sql recreates them on startup.
