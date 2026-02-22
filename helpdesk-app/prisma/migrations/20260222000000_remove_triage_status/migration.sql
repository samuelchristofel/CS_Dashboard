UPDATE "tickets"
SET "status" = 'OPEN'
WHERE "status"::text = 'TRIAGE';

ALTER TYPE "TicketStatus" RENAME TO "TicketStatus_old";

CREATE TYPE "TicketStatus" AS ENUM (
  'OPEN',
  'IN_PROGRESS',
  'RESOLVED',
  'CLOSED',
  'PENDING_REVIEW',
  'WITH_IT'
);

ALTER TABLE "tickets" ALTER COLUMN "status" DROP DEFAULT;

ALTER TABLE "tickets"
ALTER COLUMN "status" TYPE "TicketStatus"
USING (
  CASE
    WHEN "status"::text = 'TRIAGE' THEN 'OPEN'
    ELSE "status"::text
  END
)::"TicketStatus";

ALTER TABLE "tickets" ALTER COLUMN "status" SET DEFAULT 'OPEN';

DROP TYPE "TicketStatus_old";
