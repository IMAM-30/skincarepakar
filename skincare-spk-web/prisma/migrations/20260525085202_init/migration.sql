-- CreateTable
CREATE TABLE "Ingredient" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "inciName" TEXT NOT NULL,
    "normalizedName" TEXT NOT NULL,
    "aliasPrimary" TEXT,
    "ingredientGroup" TEXT,
    "cosmeticFunction" TEXT,
    "description" TEXT,
    "source" TEXT,
    "referenceUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active'
);

-- CreateTable
CREATE TABLE "IngredientAlias" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ingredientId" INTEGER NOT NULL,
    "aliasName" TEXT NOT NULL,
    "aliasType" TEXT,
    "source" TEXT,
    CONSTRAINT "IngredientAlias_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "Ingredient" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "IngredientBenefit" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ingredientId" INTEGER NOT NULL,
    "benefitTag" TEXT NOT NULL,
    "strengthScore" INTEGER NOT NULL,
    "evidenceNote" TEXT,
    "source" TEXT,
    CONSTRAINT "IngredientBenefit_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "Ingredient" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "IngredientRisk" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ingredientId" INTEGER NOT NULL,
    "riskTag" TEXT NOT NULL,
    "riskScore" INTEGER NOT NULL,
    "riskCondition" TEXT,
    "note" TEXT,
    "source" TEXT,
    CONSTRAINT "IngredientRisk_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "Ingredient" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SkinType" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "oilinessDefault" INTEGER NOT NULL,
    "drynessDefault" INTEGER NOT NULL,
    "sensitivityDefault" INTEGER NOT NULL,
    "barrierDamageDefault" INTEGER NOT NULL,
    "description" TEXT
);

-- CreateTable
CREATE TABLE "SkinCondition" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "acneLevel" INTEGER NOT NULL DEFAULT 0,
    "dullnessLevel" INTEGER NOT NULL DEFAULT 0,
    "rednessLevel" INTEGER NOT NULL DEFAULT 0,
    "barrierDamageLevel" INTEGER NOT NULL DEFAULT 0,
    "drynessLevel" INTEGER NOT NULL DEFAULT 0,
    "oilinessLevel" INTEGER NOT NULL DEFAULT 0,
    "description" TEXT
);

-- CreateTable
CREATE TABLE "FuzzyRule" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ruleCode" TEXT NOT NULL,
    "antecedentJson" TEXT NOT NULL,
    "consequentJson" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "RecommendationSession" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "skinType" TEXT NOT NULL,
    "selectedConditions" TEXT NOT NULL,
    "sensitivityLevel" TEXT NOT NULL,
    "selectedGoals" TEXT NOT NULL,
    "avoidPreferences" TEXT NOT NULL,
    "oilinessScore" REAL NOT NULL,
    "drynessScore" REAL NOT NULL,
    "acneScore" REAL NOT NULL,
    "sensitivityScore" REAL NOT NULL,
    "barrierDamageScore" REAL NOT NULL,
    "dullnessScore" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "RecommendationResult" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sessionId" INTEGER NOT NULL,
    "ingredientId" INTEGER NOT NULL,
    "recommendationType" TEXT NOT NULL,
    "score" REAL NOT NULL,
    "reason" TEXT NOT NULL,
    "warning" TEXT,
    CONSTRAINT "RecommendationResult_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "RecommendationSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RecommendationResult_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "Ingredient" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Ingredient_normalizedName_key" ON "Ingredient"("normalizedName");

-- CreateIndex
CREATE UNIQUE INDEX "SkinType_name_key" ON "SkinType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "SkinCondition_name_key" ON "SkinCondition"("name");

-- CreateIndex
CREATE UNIQUE INDEX "FuzzyRule_ruleCode_key" ON "FuzzyRule"("ruleCode");
