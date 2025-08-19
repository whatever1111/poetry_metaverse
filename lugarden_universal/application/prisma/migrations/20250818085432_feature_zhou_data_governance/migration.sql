/*
  Warnings:

  - You are about to alter the column `body` on the `ZhouPoem` table. The data in that column could be lost. The data in that column will be cast from `String` to `Json`.

*/
-- AlterTable
ALTER TABLE "ZhouMapping" ADD COLUMN "meaning" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ZhouPoem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "chapter" TEXT NOT NULL,
    "body" JSONB,
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
INSERT INTO "new_ZhouPoem" ("body", "chapter", "classicalEcho", "coreTheme", "filePath", "id", "poetExplanation", "problemSolved", "spiritualConsolation", "subProjectId", "title", "universeId") SELECT "body", "chapter", "classicalEcho", "coreTheme", "filePath", "id", "poetExplanation", "problemSolved", "spiritualConsolation", "subProjectId", "title", "universeId" FROM "ZhouPoem";
DROP TABLE "ZhouPoem";
ALTER TABLE "new_ZhouPoem" RENAME TO "ZhouPoem";
CREATE UNIQUE INDEX "ZhouPoem_universeId_title_key" ON "ZhouPoem"("universeId", "title");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
