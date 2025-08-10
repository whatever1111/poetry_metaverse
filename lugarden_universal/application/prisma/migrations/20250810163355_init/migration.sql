-- CreateTable
CREATE TABLE "Theme" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT
);

-- CreateTable
CREATE TABLE "Emotion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "polarity" TEXT NOT NULL,
    "intensity" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "Universe" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT
);

-- CreateTable
CREATE TABLE "UniverseTheme" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "universeId" TEXT NOT NULL,
    "themeId" TEXT NOT NULL,
    "confidence" REAL,
    "note" TEXT,
    CONSTRAINT "UniverseTheme_universeId_fkey" FOREIGN KEY ("universeId") REFERENCES "Universe" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UniverseTheme_themeId_fkey" FOREIGN KEY ("themeId") REFERENCES "Theme" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UniverseEmotion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "universeId" TEXT NOT NULL,
    "emotionId" TEXT NOT NULL,
    "weight" REAL,
    CONSTRAINT "UniverseEmotion_universeId_fkey" FOREIGN KEY ("universeId") REFERENCES "Universe" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UniverseEmotion_emotionId_fkey" FOREIGN KEY ("emotionId") REFERENCES "Emotion" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ZhouProject" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "poet" TEXT,
    "status" TEXT,
    "universeId" TEXT NOT NULL,
    CONSTRAINT "ZhouProject_universeId_fkey" FOREIGN KEY ("universeId") REFERENCES "Universe" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ZhouSubProject" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "universeId" TEXT NOT NULL,
    CONSTRAINT "ZhouSubProject_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "ZhouProject" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ZhouSubProject_universeId_fkey" FOREIGN KEY ("universeId") REFERENCES "Universe" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ZhouQA" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "chapter" TEXT NOT NULL,
    "index" INTEGER NOT NULL,
    "question" TEXT NOT NULL,
    "optionA" TEXT NOT NULL,
    "optionB" TEXT NOT NULL,
    "meaningA" TEXT NOT NULL,
    "meaningB" TEXT NOT NULL,
    "universeId" TEXT NOT NULL,
    "subProjectId" TEXT,
    CONSTRAINT "ZhouQA_universeId_fkey" FOREIGN KEY ("universeId") REFERENCES "Universe" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ZhouQA_subProjectId_fkey" FOREIGN KEY ("subProjectId") REFERENCES "ZhouSubProject" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ZhouMapping" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "chapter" TEXT NOT NULL,
    "combination" TEXT NOT NULL,
    "poemTitle" TEXT NOT NULL,
    "universeId" TEXT NOT NULL,
    "subProjectId" TEXT,
    CONSTRAINT "ZhouMapping_universeId_fkey" FOREIGN KEY ("universeId") REFERENCES "Universe" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ZhouMapping_subProjectId_fkey" FOREIGN KEY ("subProjectId") REFERENCES "ZhouSubProject" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ZhouPoem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "chapter" TEXT NOT NULL,
    "body" TEXT,
    "filePath" TEXT,
    "coreTheme" TEXT,
    "problemSolved" TEXT,
    "spiritualConsolation" TEXT,
    "classicalEcho" TEXT,
    "poetExplanation" TEXT,
    "universeId" TEXT NOT NULL,
    "subProjectId" TEXT,
    CONSTRAINT "ZhouPoem_universeId_fkey" FOREIGN KEY ("universeId") REFERENCES "Universe" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ZhouPoem_subProjectId_fkey" FOREIGN KEY ("subProjectId") REFERENCES "ZhouSubProject" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MaoxiaodouPoem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "summary" TEXT,
    "body" TEXT,
    "emotionalTone" TEXT,
    "conflictExplicit" TEXT,
    "conflictImplicit" TEXT,
    "metadata" TEXT,
    "universeId" TEXT NOT NULL,
    CONSTRAINT "MaoxiaodouPoem_universeId_fkey" FOREIGN KEY ("universeId") REFERENCES "Universe" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MaoxiaodouCharacter" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "aliases" TEXT,
    "role" TEXT,
    "description" TEXT,
    "coreMotivation" TEXT,
    "developmentArc" TEXT,
    "notes" TEXT,
    "category" TEXT,
    "universeId" TEXT NOT NULL,
    CONSTRAINT "MaoxiaodouCharacter_universeId_fkey" FOREIGN KEY ("universeId") REFERENCES "Universe" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MaoxiaodouCharacterRelation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sourceCharacterId" TEXT NOT NULL,
    "targetCharacterId" TEXT NOT NULL,
    "relationType" TEXT NOT NULL,
    "description" TEXT,
    "strength" REAL,
    "universeId" TEXT NOT NULL,
    CONSTRAINT "MaoxiaodouCharacterRelation_sourceCharacterId_fkey" FOREIGN KEY ("sourceCharacterId") REFERENCES "MaoxiaodouCharacter" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MaoxiaodouCharacterRelation_targetCharacterId_fkey" FOREIGN KEY ("targetCharacterId") REFERENCES "MaoxiaodouCharacter" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MaoxiaodouCharacterRelation_universeId_fkey" FOREIGN KEY ("universeId") REFERENCES "Universe" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MaoxiaodouScene" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "scenario" TEXT NOT NULL,
    "type" TEXT,
    "description" TEXT,
    "poemId" TEXT NOT NULL,
    "universeId" TEXT NOT NULL,
    CONSTRAINT "MaoxiaodouScene_poemId_fkey" FOREIGN KEY ("poemId") REFERENCES "MaoxiaodouPoem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MaoxiaodouScene_universeId_fkey" FOREIGN KEY ("universeId") REFERENCES "Universe" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MaoxiaodouTerminology" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "term" TEXT NOT NULL,
    "category" TEXT,
    "definition" TEXT,
    "context" TEXT,
    "usage" TEXT,
    "universeId" TEXT NOT NULL,
    CONSTRAINT "MaoxiaodouTerminology_universeId_fkey" FOREIGN KEY ("universeId") REFERENCES "Universe" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MaoxiaodouTheme" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "manifestations" TEXT,
    "universeId" TEXT NOT NULL,
    CONSTRAINT "MaoxiaodouTheme_universeId_fkey" FOREIGN KEY ("universeId") REFERENCES "Universe" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MaoxiaodouTimeline" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "timeRange" TEXT,
    "description" TEXT,
    "keyEvents" TEXT,
    "universeId" TEXT NOT NULL,
    CONSTRAINT "MaoxiaodouTimeline_universeId_fkey" FOREIGN KEY ("universeId") REFERENCES "Universe" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MaoxiaodouTheory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "concept" TEXT,
    "description" TEXT,
    "manifestations" TEXT,
    "universeId" TEXT NOT NULL,
    CONSTRAINT "MaoxiaodouTheory_universeId_fkey" FOREIGN KEY ("universeId") REFERENCES "Universe" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MaoxiaodouReadingLayer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "accessibility" TEXT,
    "readingGoals" TEXT,
    "universeId" TEXT NOT NULL,
    CONSTRAINT "MaoxiaodouReadingLayer_universeId_fkey" FOREIGN KEY ("universeId") REFERENCES "Universe" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MaoxiaodouMapping" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sourceType" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "mappingType" TEXT NOT NULL,
    "universeId" TEXT NOT NULL,
    CONSTRAINT "MaoxiaodouMapping_universeId_fkey" FOREIGN KEY ("universeId") REFERENCES "Universe" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MaoxiaodouMetadata" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "universeName" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "description" TEXT,
    "dataSources" TEXT,
    "statistics" TEXT,
    "relationships" TEXT,
    "universeId" TEXT NOT NULL,
    CONSTRAINT "MaoxiaodouMetadata_universeId_fkey" FOREIGN KEY ("universeId") REFERENCES "Universe" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Theme_name_key" ON "Theme"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Emotion_name_key" ON "Emotion"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Universe_code_key" ON "Universe"("code");

-- CreateIndex
CREATE UNIQUE INDEX "UniverseTheme_universeId_themeId_key" ON "UniverseTheme"("universeId", "themeId");

-- CreateIndex
CREATE UNIQUE INDEX "UniverseEmotion_universeId_emotionId_key" ON "UniverseEmotion"("universeId", "emotionId");

-- CreateIndex
CREATE UNIQUE INDEX "ZhouMapping_universeId_chapter_combination_key" ON "ZhouMapping"("universeId", "chapter", "combination");

-- CreateIndex
CREATE UNIQUE INDEX "ZhouPoem_universeId_title_key" ON "ZhouPoem"("universeId", "title");

-- CreateIndex
CREATE UNIQUE INDEX "MaoxiaodouPoem_universeId_title_key" ON "MaoxiaodouPoem"("universeId", "title");

-- CreateIndex
CREATE UNIQUE INDEX "MaoxiaodouCharacter_universeId_name_key" ON "MaoxiaodouCharacter"("universeId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "MaoxiaodouTerminology_universeId_term_key" ON "MaoxiaodouTerminology"("universeId", "term");

-- CreateIndex
CREATE UNIQUE INDEX "MaoxiaodouTheme_universeId_name_key" ON "MaoxiaodouTheme"("universeId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "MaoxiaodouTheory_universeId_name_key" ON "MaoxiaodouTheory"("universeId", "name");
