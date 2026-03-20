ALTER TABLE "GeneratedSchedule"
ADD COLUMN "periodDurationM" INTEGER NOT NULL DEFAULT 50,
ADD COLUMN "morningStartTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "morningEndTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "afternoonStartTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "afternoonEndTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

UPDATE "GeneratedSchedule" gs
SET
  "periodDurationM" = sc."periodDurationM",
  "morningStartTime" = sc."morningStartTime",
  "morningEndTime" = sc."morningEndTime",
  "afternoonStartTime" = sc."afternoonStartTime",
  "afternoonEndTime" = sc."afternoonEndTime"
FROM "ScheduleConfig" sc
WHERE gs."scheduleConfigId" = sc."scheduleConfigId";
