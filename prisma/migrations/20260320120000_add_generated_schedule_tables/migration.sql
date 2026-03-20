CREATE TABLE "GeneratedSchedule" (
  "generatedScheduleId" BIGSERIAL NOT NULL,
  "scheduleConfigId" BIGINT NOT NULL,
  "name" TEXT,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "fitness" DOUBLE PRECISION NOT NULL,
  "hardPenalty" INTEGER NOT NULL,
  "softPenalty" INTEGER NOT NULL,
  "feasibilityPenalty" INTEGER NOT NULL,
  "requiredGeneCount" INTEGER NOT NULL,
  "assignedGeneCount" INTEGER NOT NULL,
  "unassignedClassroomCount" INTEGER NOT NULL,
  "unassignedProfessorCount" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdBy" TEXT,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "updatedBy" TEXT,
  "active" BOOLEAN NOT NULL DEFAULT true,

  CONSTRAINT "GeneratedSchedule_pkey" PRIMARY KEY ("generatedScheduleId")
);

CREATE TABLE "GeneratedScheduleItem" (
  "generatedScheduleItemId" BIGSERIAL NOT NULL,
  "generatedScheduleId" BIGINT NOT NULL,
  "configCourseId" BIGINT NOT NULL,
  "courseCode" INTEGER NOT NULL,
  "sectionIndex" INTEGER NOT NULL,
  "sessionType" TEXT NOT NULL,
  "dayIndex" INTEGER NOT NULL,
  "startSlot" INTEGER NOT NULL,
  "periodCount" INTEGER NOT NULL,
  "requireClassroom" BOOLEAN NOT NULL,
  "configClassroomId" BIGINT,
  "configProfessorId" BIGINT,
  "assignmentStatus" TEXT NOT NULL,
  "isFixed" BOOLEAN NOT NULL,
  "semester" INTEGER NOT NULL,
  "isMandatory" BOOLEAN NOT NULL,
  "isCommonArea" BOOLEAN NOT NULL,
  "careerCodes" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdBy" TEXT,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "updatedBy" TEXT,
  "active" BOOLEAN NOT NULL DEFAULT true,

  CONSTRAINT "GeneratedScheduleItem_pkey" PRIMARY KEY ("generatedScheduleItemId")
);

ALTER TABLE "GeneratedSchedule"
ADD CONSTRAINT "GeneratedSchedule_scheduleConfigId_fkey"
FOREIGN KEY ("scheduleConfigId") REFERENCES "ScheduleConfig"("scheduleConfigId")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "GeneratedScheduleItem"
ADD CONSTRAINT "GeneratedScheduleItem_generatedScheduleId_fkey"
FOREIGN KEY ("generatedScheduleId") REFERENCES "GeneratedSchedule"("generatedScheduleId")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "GeneratedScheduleItem"
ADD CONSTRAINT "GeneratedScheduleItem_configCourseId_fkey"
FOREIGN KEY ("configCourseId") REFERENCES "ConfigCourse"("configCourseId")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "GeneratedScheduleItem"
ADD CONSTRAINT "GeneratedScheduleItem_configClassroomId_fkey"
FOREIGN KEY ("configClassroomId") REFERENCES "ConfigClassroom"("configClassroomId")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "GeneratedScheduleItem"
ADD CONSTRAINT "GeneratedScheduleItem_configProfessorId_fkey"
FOREIGN KEY ("configProfessorId") REFERENCES "ConfigProfessor"("configProfessorId")
ON DELETE SET NULL ON UPDATE CASCADE;
