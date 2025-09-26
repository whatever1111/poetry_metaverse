-- CreateTable
CREATE TABLE "CrossUniverseContentLink" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sourceUniverseId" TEXT NOT NULL,
    "sourceEntityType" TEXT NOT NULL,
    "sourceEntityId" TEXT NOT NULL,
    "targetUniverseId" TEXT NOT NULL,
    "targetEntityType" TEXT NOT NULL,
    "targetEntityId" TEXT NOT NULL,
    "mappingType" TEXT NOT NULL,
    "score" REAL,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CrossUniverseContentLink_sourceUniverseId_fkey" FOREIGN KEY ("sourceUniverseId") REFERENCES "Universe" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CrossUniverseContentLink_targetUniverseId_fkey" FOREIGN KEY ("targetUniverseId") REFERENCES "Universe" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "CrossUniverseContentLink_sourceUniverseId_sourceEntityType_sourceEntityId_targetUniverseId_targetEntityType_targetEntityId_key" ON "CrossUniverseContentLink"("sourceUniverseId", "sourceEntityType", "sourceEntityId", "targetUniverseId", "targetEntityType", "targetEntityId");
