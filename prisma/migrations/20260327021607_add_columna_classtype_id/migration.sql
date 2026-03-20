/*
  Warnings:

  - You are about to drop the column `type` on the `Classroom` table. All the data in the column will be lost.
  - The `startPopulationSize` column on the `ScheduleConfig` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `classTypeId` to the `Classroom` table without a default value. This is not possible if the table is not empty.
  - Added the required column `typeOfSchedule` to the `Classroom` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
CREATE SEQUENCE classroom_classroomid_seq;
ALTER TABLE "Classroom" DROP COLUMN "type",
ADD COLUMN     "classTypeId" INTEGER NOT NULL,
ADD COLUMN     "typeOfSchedule" TEXT NOT NULL,
ALTER COLUMN "classroomId" SET DEFAULT nextval('classroom_classroomid_seq');
ALTER SEQUENCE classroom_classroomid_seq OWNED BY "Classroom"."classroomId";

-- AlterTable
ALTER TABLE "ConfigClassroom" ALTER COLUMN "classroomType" DROP DEFAULT;

-- AlterTable
ALTER TABLE "GeneratedSchedule" ALTER COLUMN "periodDurationM" DROP DEFAULT,
ALTER COLUMN "morningStartTime" DROP DEFAULT,
ALTER COLUMN "morningEndTime" DROP DEFAULT,
ALTER COLUMN "afternoonStartTime" DROP DEFAULT,
ALTER COLUMN "afternoonEndTime" DROP DEFAULT;

-- AlterTable
ALTER TABLE "GeneratedScheduleItem" ALTER COLUMN "careerCodes" DROP DEFAULT;

-- AlterTable
ALTER TABLE "ScheduleConfig" DROP COLUMN "startPopulationSize",
ADD COLUMN     "startPopulationSize" INTEGER;
