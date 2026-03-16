-- CreateTable
CREATE TABLE "Career" (
    "careerCode" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Career_pkey" PRIMARY KEY ("careerCode")
);

-- CreateTable
CREATE TABLE "Classroom" (
    "classroomId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Classroom_pkey" PRIMARY KEY ("classroomId")
);

-- CreateTable
CREATE TABLE "ConfigClassroom" (
    "configClassroomId" BIGINT NOT NULL,
    "classroomId" INTEGER NOT NULL,
    "scheduleConfigId" BIGINT NOT NULL,
    "typeOfSchedule" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ConfigClassroom_pkey" PRIMARY KEY ("configClassroomId")
);

-- CreateTable
CREATE TABLE "ConfigCourseProfessor" (
    "configCourseProfessorId" BIGINT NOT NULL,
    "configProfessorId" BIGINT NOT NULL,
    "configCourseId" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ConfigCourseProfessor_pkey" PRIMARY KEY ("configCourseProfessorId")
);

-- CreateTable
CREATE TABLE "ConfigCourse" (
    "configCourseId" BIGINT NOT NULL,
    "scheduleConfigId" BIGINT NOT NULL,
    "courseCode" INTEGER NOT NULL,
    "sectionQty" INTEGER NOT NULL,
    "scheduleTime" TIMESTAMP(3) NOT NULL,
    "requireClassroom" BOOLEAN NOT NULL,
    "typeOfSchedule" TEXT NOT NULL,
    "configClassroomId" BIGINT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ConfigCourse_pkey" PRIMARY KEY ("configCourseId")
);

-- CreateTable
CREATE TABLE "ConfigProfessor" (
    "configProfessorId" BIGINT NOT NULL,
    "professorCode" INTEGER NOT NULL,
    "scheduleConfigId" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ConfigProfessor_pkey" PRIMARY KEY ("configProfessorId")
);

-- CreateTable
CREATE TABLE "CourseCareer" (
    "id" SERIAL NOT NULL,
    "courseCode" INTEGER NOT NULL,
    "careerCode" INTEGER NOT NULL,
    "semester" INTEGER NOT NULL,
    "isMandatory" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "CourseCareer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Course" (
    "courseCode" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "semester" INTEGER,
    "isMandatory" BOOLEAN NOT NULL,
    "hasLab" BOOLEAN NOT NULL,
    "numberOfPeriods" INTEGER NOT NULL,
    "typeOfSchedule" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("courseCode")
);

-- CreateTable
CREATE TABLE "Professor" (
    "professorCode" INTEGER NOT NULL,
    "firstName" TEXT NOT NULL,
    "secondName" TEXT,
    "lastName" TEXT NOT NULL,
    "secondLastName" TEXT,
    "entryTime" TIMESTAMP(3) NOT NULL,
    "exitTime" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Professor_pkey" PRIMARY KEY ("professorCode")
);

-- CreateTable
CREATE TABLE "ScheduleConfig" (
    "scheduleConfigId" BIGINT NOT NULL,
    "periodDurationM" INTEGER NOT NULL,
    "morningStartTime" TIMESTAMP(3) NOT NULL,
    "morningEndTime" TIMESTAMP(3) NOT NULL,
    "afternoonStartTime" TIMESTAMP(3) NOT NULL,
    "afternoonEndTime" TIMESTAMP(3) NOT NULL,
    "maxGeneration" INTEGER,
    "startPopulationNumber" TEXT,
    "selectionMethod" INTEGER NOT NULL,
    "crossMethod" INTEGER NOT NULL,
    "mutationMethod" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ScheduleConfig_pkey" PRIMARY KEY ("scheduleConfigId")
);

-- CreateTable
CREATE TABLE "TimeSlot" (
    "timeSlotId" BIGINT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "TimeSlot_pkey" PRIMARY KEY ("timeSlotId")
);

-- AddForeignKey
ALTER TABLE "ConfigClassroom" ADD CONSTRAINT "ConfigClassroom_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "Classroom"("classroomId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConfigClassroom" ADD CONSTRAINT "ConfigClassroom_scheduleConfigId_fkey" FOREIGN KEY ("scheduleConfigId") REFERENCES "ScheduleConfig"("scheduleConfigId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConfigCourseProfessor" ADD CONSTRAINT "ConfigCourseProfessor_configProfessorId_fkey" FOREIGN KEY ("configProfessorId") REFERENCES "ConfigProfessor"("configProfessorId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConfigCourseProfessor" ADD CONSTRAINT "ConfigCourseProfessor_configCourseId_fkey" FOREIGN KEY ("configCourseId") REFERENCES "ConfigCourse"("configCourseId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConfigCourse" ADD CONSTRAINT "ConfigCourse_scheduleConfigId_fkey" FOREIGN KEY ("scheduleConfigId") REFERENCES "ScheduleConfig"("scheduleConfigId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConfigCourse" ADD CONSTRAINT "ConfigCourse_courseCode_fkey" FOREIGN KEY ("courseCode") REFERENCES "Course"("courseCode") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConfigProfessor" ADD CONSTRAINT "ConfigProfessor_professorCode_fkey" FOREIGN KEY ("professorCode") REFERENCES "Professor"("professorCode") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConfigProfessor" ADD CONSTRAINT "ConfigProfessor_scheduleConfigId_fkey" FOREIGN KEY ("scheduleConfigId") REFERENCES "ScheduleConfig"("scheduleConfigId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseCareer" ADD CONSTRAINT "CourseCareer_courseCode_fkey" FOREIGN KEY ("courseCode") REFERENCES "Course"("courseCode") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseCareer" ADD CONSTRAINT "CourseCareer_careerCode_fkey" FOREIGN KEY ("careerCode") REFERENCES "Career"("careerCode") ON DELETE RESTRICT ON UPDATE CASCADE;
