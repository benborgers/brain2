-- CreateTable
CREATE TABLE "Notecard" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "body" TEXT,
    "tags" TEXT[],
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notecard_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Notecard" ADD CONSTRAINT "Notecard_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
