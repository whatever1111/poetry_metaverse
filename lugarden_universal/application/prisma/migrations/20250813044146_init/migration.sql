-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Universe" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Universe" ("code", "description", "id", "name", "type") SELECT "code", "description", "id", "name", "type" FROM "Universe";
DROP TABLE "Universe";
ALTER TABLE "new_Universe" RENAME TO "Universe";
CREATE UNIQUE INDEX "Universe_code_key" ON "Universe"("code");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
