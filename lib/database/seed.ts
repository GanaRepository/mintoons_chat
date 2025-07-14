import { STORY_ELEMENTS } from '@utils/constants';
import { connectDB } from './connection';
import Story from '@models/Story';
import User from '@models/User';
import mongoose from 'mongoose';

// Sample achievements for seeding
const ACHIEVEMENTS: AchievementDocument[] = [
  {
    name: 'First Story',
    description: 'Write and publish your first story!',
    icon: '📝',
    points: 10,
    type: 'story_milestone',
    rarity: 'common',
    color: 'blue',
    unlockedMessage: `Congratulations! You've unlocked the First Story achievement!`,
    isActive: true,
    sortOrder: 0,
  },
  {
    name: 'Weekly Writer',
    description: 'Write stories for 7 consecutive days.',
    icon: '📅',
    points: 50,
    type: 'story_milestone',
    rarity: 'common',
    color: 'blue',
    unlockedMessage: `Congratulations! You've unlocked the Weekly Writer achievement!`,
    isActive: true,
    sortOrder: 1,
  },
  {
    name: 'Creative Genius',
    description: 'Score high in creativity on a story.',
    icon: '🎨',
    points: 25,
    type: 'story_milestone',
    rarity: 'common',
    color: 'blue',
    unlockedMessage: `Congratulations! You've unlocked the Creative Genius achievement!`,
    isActive: true,
    sortOrder: 2,
  },
  // Add more achievements as needed
];


// Define Achievement interface
interface AchievementDocument {
  name: string;
  description: string;
  icon: string;
  points: number;
  type: 'story_milestone';
  rarity: 'common';
  color: string;
  unlockedMessage: string;
  isActive: boolean;
  sortOrder: number;
}

// Sample stories for new users
const SAMPLE_STORIES = [
  {
    title: 'The Magical Forest Adventure',
    content:
      "Once upon a time, there was a brave little girl named Luna who discovered a magical forest behind her grandmother's house. The trees whispered secrets, and friendly woodland creatures showed her hidden pathways filled with sparkling flowers. Luna learned that kindness and courage could unlock the forest's greatest treasures - new friendships and wonderful memories that would last forever.",
    elements: {
      genre: 'fantasy',
      setting: 'forest',
      character: 'brave_child',
      mood: 'magical',
      conflict: 'lost_treasure',
      theme: 'friendship',
    },
    authorName: 'Sample Author',
    authorAge: 8,
    status: 'published',
    isPublic: true,
  },
  {
    title: "Robot Friend's Space Mission",
    content:
      'Beep-boop! Zara the robot and her human friend Alex were chosen for an exciting space mission to Mars. When their spaceship encountered a problem, Zara used her special abilities to fix the navigation system while Alex used creativity to solve the fuel shortage. Together, they discovered that teamwork and different skills make the best combination for any adventure, whether on Earth or in space!',
    elements: {
      genre: 'space',
      setting: 'space_station',
      character: 'robot_friend',
      mood: 'exciting',
      conflict: 'rescue_mission',
      theme: 'teamwork',
    },
    authorName: 'Sample Author',
    authorAge: 10,
    status: 'published',
    isPublic: true,
  },
  {
    title: "The Kind Pirate's Treasure",
    content:
      "Captain Maya was not like other pirates - she used her ship to help people and protect sea creatures. When she found an old map leading to treasure, she discovered that the real treasure wasn't gold or jewels, but the friends she made along the way. The grateful mermaids and dolphins she had helped gave her something much more valuable: a heart full of joy and a crew of loyal friends who would sail with her forever.",
    elements: {
      genre: 'adventure',
      setting: 'ocean',
      character: 'pirate',
      mood: 'heartwarming',
      conflict: 'lost_treasure',
      theme: 'kindness',
    },
    authorName: 'Sample Author',
    authorAge: 12,
    status: 'published',
    isPublic: true,
  },
  {
    title: "The Little Inventor's Big Idea",
    content:
      'Emma loved building things in her garage workshop. When her town faced a problem with littering in the park, she invented a fun robot that turned cleaning into a game. Children would race to help the robot collect trash, and it would reward them with stickers and play music. Emma learned that even small inventors can make big differences in their communities when they use their creativity to help others.',
    elements: {
      genre: 'friendship',
      setting: 'city',
      character: 'inventor',
      mood: 'curious',
      conflict: 'help_community',
      theme: 'creativity',
    },
    authorName: 'Sample Author',
    authorAge: 9,
    status: 'published',
    isPublic: true,
  },
];

export async function seedSampleStories(): Promise<void> {
  try {
    await connectDB();

    // Check if sample stories already exist
    const existingStories = await (Story as any).countDocuments({
      authorName: 'Sample Author',
    });

    if (existingStories > 0) {
      console.log('Sample stories already exist, skipping seeding');
      return;
    }

    // Create sample stories using type assertion
    const storyDocs = SAMPLE_STORIES.map(story => ({
      ...story,
      authorId: new mongoose.Types.ObjectId(), // Dummy ID
      wordCount: story.content.split(' ').length,
      readingTime: Math.ceil(story.content.split(' ').length / 200),
      publishedAt: new Date(),
      completedAt: new Date(),
      views: Math.floor(Math.random() * 100) + 50,
      likes: Math.floor(Math.random() * 20) + 5,
    }));

    const stories = await (Story as any).create(storyDocs);

    console.log(`Created ${stories.length} sample stories`);
  } catch (error) {
    console.error('Error seeding sample stories:', error);
    throw error;
  }
}

export async function seedAchievements(): Promise<void> {
  try {
    await connectDB();

    // Get or create Achievement model
    const Achievement = getAchievementModel();

    // Check if achievements already exist
    const existingAchievements = await (Achievement as any).countDocuments();

    if (existingAchievements > 0) {
      console.log('Achievements already exist, skipping seeding');
      return;
    }

    // Convert constants to achievement documents
    const achievementDocs = Object.values(ACHIEVEMENTS).map(
      (achievement: any, index: number): AchievementDocument => ({
        ...achievement,
        type: 'story_milestone' as const,
        rarity: 'common' as const,
        color: 'blue',
        unlockedMessage: `Congratulations! You've unlocked the ${achievement.name} achievement!`,
        isActive: true,
        sortOrder: index,
      })
    );

    const createdAchievements = await (Achievement as any).create(
      achievementDocs
    );

    console.log(`Created ${createdAchievements.length} achievements`);
  } catch (error) {
    console.error('Error seeding achievements:', error);
    throw error;
  }
}

/**
 * Get or create Achievement model
 */
function getAchievementModel() {
  if (mongoose.models.Achievement) {
    return mongoose.models.Achievement;
  }

  const achievementSchema = new mongoose.Schema(
    {
      id: { type: String, required: true, unique: true },
      name: { type: String, required: true },
      description: { type: String, required: true },
      icon: { type: String, required: true },
      points: { type: Number, required: true, min: 0 },
      type: {
        type: String,
        enum: ['story_milestone', 'creativity', 'grammar', 'streak', 'social'],
        default: 'story_milestone',
      },
      rarity: {
        type: String,
        enum: ['common', 'rare', 'epic', 'legendary'],
        default: 'common',
      },
      color: { type: String, default: 'blue' },
      unlockedMessage: { type: String, required: true },
      isActive: { type: Boolean, default: true },
      sortOrder: { type: Number, default: 0 },
    },
    {
      timestamps: true,
    }
  );

  // Add indexes
  achievementSchema.index({ type: 1, isActive: 1 });
  achievementSchema.index({ rarity: 1 });
  achievementSchema.index({ sortOrder: 1 });

  return mongoose.model<AchievementDocument>('Achievement', achievementSchema);
}

export async function seedAll(): Promise<void> {
  console.log('Starting database seeding...');

  try {
    await seedSampleStories();
    await seedAchievements();

    console.log('Database seeding completed successfully');
  } catch (error) {
    console.error('Database seeding failed:', error);
    throw error;
  }
}

// Create admin user if it doesn't exist
export async function createAdminUser(): Promise<void> {
  try {
    await connectDB();

    const existingAdmin = await (User as any).findOne({ role: 'admin' });

    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }

    const adminUserData = {
      firstName: 'Admin',
      lastName: 'User',
      email: process.env.ADMIN_EMAIL || 'admin@mintoons.com',
      password: process.env.ADMIN_PASSWORD || 'admin123456',
      age: 25,
      role: 'admin',
      subscriptionTier: 'PRO',
      emailVerified: true,
      isActive: true,
    };

    const adminUser = await (User as any).create(adminUserData);

    console.log('Admin user created:', adminUser.email);
  } catch (error) {
    console.error('Error creating admin user:', error);
    throw error;
  }
}

// Helper function to clean up old sample data
export async function cleanupSampleData(): Promise<void> {
  try {
    await connectDB();

    // Remove sample stories
    const deletedStories = await (Story as any).deleteMany({
      authorName: 'Sample Author',
    });

    console.log(
      `Cleaned up ${deletedStories.deletedCount || 0} sample stories`
    );

    // Remove achievements if needed
    const Achievement = getAchievementModel();
    const deletedAchievements = await (Achievement as any).deleteMany({
      type: 'story_milestone',
    });

    console.log(
      `Cleaned up ${deletedAchievements.deletedCount || 0} achievements`
    );

    console.log('Sample data cleanup completed');
  } catch (error) {
    console.error('Error cleaning up sample data:', error);
    throw error;
  }
}

// Utility function to reset database for development
export async function resetDatabase(): Promise<void> {
  try {
    await connectDB();

    console.log('⚠️  Resetting database...');

    // Drop all collections
    const collections = await mongoose.connection.db?.collections();
    if (collections) {
      for (const collection of collections) {
        await collection.drop();
        console.log(`Dropped collection: ${collection.collectionName}`);
      }
    }

    console.log('Database reset completed');

    // Re-seed with fresh data
    await seedAll();
    await createAdminUser();

    console.log('Database re-seeded with fresh data');
  } catch (error) {
    console.error('Error resetting database:', error);
    throw error;
  }
}

// Export individual functions for selective seeding
export { SAMPLE_STORIES, getAchievementModel };
