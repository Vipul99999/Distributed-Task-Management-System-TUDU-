import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ----------------------
// Helper: get start of day (UTC)
// ----------------------
const startOfDay = (date: Date) => {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

// ----------------------
// Helper: update streaks after an improvement
// ----------------------
const updateStreaks = async (userId: string, improvementDate: Date) => {
 
  const today = startOfDay(improvementDate);
  
  // Get latest streak for the user
  console.log("🔍 Checking for existing streaks...");
  let streak = await prisma.streak.findFirst({
    where: { userId },
    orderBy: { startDate: 'desc' },
  });
  if (!streak) {
    console.log("🆕 No streak found — creating first streak for user.");
    const newStreak = await prisma.streak.create({
      data: {
        userId,
        startDate: today,
        endDate: null,
        length: 1,
        isActive: true,
      },
    });
  
    return newStreak;
  }

  const streakEndDate = streak.endDate ? startOfDay(streak.endDate) : null;
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  
  if (streak.isActive) {
    console.log("🔥 Streak is active, checking continuation...");

    // Continue streak if yesterday matches
    if (streakEndDate && startOfDay(streakEndDate).getTime() === yesterday.getTime()) {
      console.log("✅ Continuing streak...");
      const updated = await prisma.streak.update({
        where: { id: streak.id },
        data: {
          endDate: today,
          length: streak.length + 1,
        },
      });
      return updated;
    } 
    // Otherwise start a new streak
    else if (!streakEndDate || startOfDay(streak.startDate).getTime() < today.getTime()) {
      console.log("💔 Streak broken — closing old and starting new.");
      await prisma.streak.update({
        where: { id: streak.id },
        data: { isActive: false },
      });

      const newStreak = await prisma.streak.create({
        data: {
          userId,
          startDate: today,
          endDate: null,
          length: 1,
          isActive: true,
        },
      });
      console.log("✅ New streak started:");
      return newStreak;
    }
  }

  console.log("ℹ️ No update needed for streak.");
  return streak;
};

// ----------------------
// Create a new improvement
// ----------------------
export const createImprovement = async (
  userId: string,
  data: {
    text: string;
    futureNote?: string;
    categoryId?: string; // can be existing ID or new name
  }
) => {
  const today = startOfDay(new Date());
 
  const existing = await prisma.improvement.findFirst({
    where: { userId, date: today },
  });

  if (existing) {
    console.warn("⚠️ Improvement for today already exists:", existing);
    throw new Error("Improvement for today already exists.");
  }

  // Resolve categoryId
  let categoryId: string | null = null;
  if (data.categoryId) {
    let category = await prisma.category.findFirst({
      where: {
        userId,
        OR: [{ id: data.categoryId }, { name: data.categoryId }],
      },
    });

    if (!category) {
      console.log("🛠 Category not found, creating new category for user...");
      category = await prisma.category.create({
        data: {
          userId,
          name: data.categoryId, // store string as category name
        },
      });
      console.log("✅ New category created:");
    } else {
      console.log("📂 Existing category found:");
    }

    categoryId = category.id;
  }

  console.log("🛠 Creating new improvement...");
  const improvement = await prisma.improvement.create({
    data: {
      userId,
      text: data.text,
      futureNote: data.futureNote || null,
      categoryId,
      date: today,
      isCompleted: true,
    },
  });
  console.log("✅ Improvement created");

  console.log("🔄 Updating streaks after improvement...");
  await updateStreaks(userId, today);

  return improvement;
};



// ----------------------
// Get all improvements for a user
// ----------------------
export const getImprovements = async (userId: string) => {
  console.log("👉 [getImprovements] Fetching all improvements for user:");

  const improvements = await prisma.improvement.findMany({
    where: { userId },
    include: { category: true },
    orderBy: { date: 'desc' },
  });

  return improvements;
};

// ----------------------
// Update an improvement
// ----------------------
export const updateImprovement = async (
  userId: string,
  improvementId: string,
  data: {
    text?: string;
    futureNote?: string;
    categoryId?: string;
    isCompleted?: boolean;
  }
) => {
  console.log("👉 [updateImprovement] Called with:");

  const improvement = await prisma.improvement.findUnique({ where: { id: improvementId } });
  console.log("🔍 Found improvement");

  if (!improvement || improvement.userId !== userId) {
    console.warn("❌ Improvement not found or unauthorized.");
    throw new Error('Improvement not found or unauthorized.');
  }

  console.log("✏️ Updating improvement...");
  const updated = await prisma.improvement.update({
    where: { id: improvementId },
    data: {
      text: data.text ?? improvement.text,
      futureNote: data.futureNote ?? improvement.futureNote,
      categoryId: data.categoryId ?? improvement.categoryId,
      isCompleted: data.isCompleted ?? improvement.isCompleted,
    },
  });
  console.log("✅ Improvement updated");

  // Update streaks if improvement is completed today
  if (updated.isCompleted) {
    console.log("🔥 Improvement completed — updating streaks...");
    await updateStreaks(userId, updated.date);
  } else {
    console.log("ℹ️ Improvement not marked complete — streak unchanged.");
  }

  return updated;
};

// ----------------------
// Get streaks for a user
// ----------------------
export const getStreaks = async (userId: string) => {
  console.log("👉 [getStreaks] Fetching streaks for user");

  const streaks = await prisma.streak.findMany({
    where: { userId },
    orderBy: { startDate: 'desc' },
  });

  return streaks;
};

// ----------------------
// Get categories
// ----------------------
export const getCategories = async () => {
  console.log("👉 [getCategories] Fetching all categories...");
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
  });
  return categories;
};

// ----------------------
// Create categories
// ----------------------
export const createCategory = async (
  userId: string,
  categories: { name: string; icon?: string; color?: string }[]
) => {
 
  const createdCategories = await Promise.all(
    categories.map(async (cat) => {
     
      const created = await prisma.category.create({
        data: {
          userId,
          name: cat.name,
          icon: cat.icon || null,
          color: cat.color || null,
        },
      });
     
      return created;
    })
  );

  return createdCategories;
};
