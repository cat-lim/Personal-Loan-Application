
-- Index for customer-specific loan history
CREATE INDEX IF NOT EXISTS idx_customer_history
ON loan_application (
    customer_id,
    submitted_at DESC,
    id DESC
);

-- Index for the pending officer queue
CREATE INDEX IF NOT EXISTS idx_pending_queue
ON loan_application (
    submitted_at ASC,
    id ASC
)
WHERE status = 'SUBMITTED';

-- Confirm the indexes exist
SELECT
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'loan_application';
