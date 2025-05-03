-- CreateTable
CREATE TABLE "Reference" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "code" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,

    CONSTRAINT "Reference_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Reference_code_key" ON "Reference"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Reference_refreshToken_key" ON "Reference"("refreshToken");

-- CreateIndex
CREATE UNIQUE INDEX "Reference_accessToken_key" ON "Reference"("accessToken");
