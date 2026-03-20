CREATE TYPE "ClassroomType" AS ENUM ('CLASS', 'LAB', 'BOTH');

ALTER TABLE "ConfigClassroom"
ADD COLUMN "classroomType" "ClassroomType" NOT NULL DEFAULT 'CLASS';

ALTER TABLE "ConfigCourse"
ADD COLUMN "isFixed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "fixedDayIndex" INTEGER,
ADD COLUMN "fixedStartSlot" INTEGER;

ALTER TABLE "ScheduleConfig"
RENAME COLUMN "startPopulationNumber" TO "startPopulationSize";
