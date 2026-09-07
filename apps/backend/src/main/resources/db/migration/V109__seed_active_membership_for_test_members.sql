-- Ensure test member dashboards show valid membership/payment data.
-- Seeds an active membership only when a test member has no currently active membership.

WITH test_members AS (
    SELECT id, organization_id
    FROM members
    WHERE email IN ('david.member@fittrack.app', 'emma.member@fittrack.app', 'frank.member@fittrack.app')
),
plan_per_org AS (
    SELECT DISTINCT ON (mp.organization_id)
        mp.id,
        mp.organization_id,
        mp.price,
        mp.duration_days,
        COALESCE(mp.tax_percentage, 0) AS tax_percentage
    FROM membership_plans mp
    WHERE mp.active = true
    ORDER BY mp.organization_id, mp.duration_days ASC, mp.id ASC
)
INSERT INTO memberships (
    member_id,
    membership_plan_id,
    start_date,
    end_date,
    status,
    price,
    discount_amount,
    tax_amount,
    total_amount,
    freeze_count,
    active,
    created_at,
    updated_at
)
SELECT
    tm.id,
    ppo.id,
    CURRENT_DATE,
    CURRENT_DATE + (ppo.duration_days || ' days')::interval,
    'ACTIVE',
    ppo.price,
    0,
    ROUND((ppo.price * ppo.tax_percentage) / 100, 2),
    ROUND(ppo.price + ((ppo.price * ppo.tax_percentage) / 100), 2),
    0,
    true,
    NOW(),
    NOW()
FROM test_members tm
JOIN plan_per_org ppo ON ppo.organization_id = tm.organization_id
WHERE NOT EXISTS (
    SELECT 1
    FROM memberships m
    WHERE m.member_id = tm.id
      AND m.active = true
      AND m.status IN ('ACTIVE', 'EXPIRING_SOON')
      AND m.end_date >= CURRENT_DATE
);

UPDATE members
SET status = 'ACTIVE',
    updated_at = NOW()
WHERE email IN ('david.member@fittrack.app', 'emma.member@fittrack.app', 'frank.member@fittrack.app')
  AND active = true;

