// lib/database/seed.ts - Database seeding for sample stories
import { connectDB } from './connection';
import Story from '@models/Story';
import User from '@models/User';
import Achievement from '@models/Achievement';
import { STORY_ELEMENTS, ACHIEVEMENTS } from '@utils/constants';

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
    const existingStories = await Story.countDocuments({
      authorName: 'Sample Author',
    });

    if (existingStories > 0) {
      console.log('Sample stories already exist, skipping seeding');
      return;
    }

    // Create sample stories
    const stories = await Story.create(
      SAMPLE_STORIES.map(story => ({
        ...story,
        authorId: new (require('mongoose').Types.ObjectId)(), // Dummy ID
        wordCount: story.content.split(' ').length,
        readingTime: Math.ceil(story.content.split(' ').length / 200),
        publishedAt: new Date(),
        completedAt: new Date(),
        views: Math.floor(Math.random() * 100) + 50,
        likes: Math.floor(Math.random() * 20) + 5,
      }))
    );

    console.log(`Created ${stories.length} sample stories`);
  } catch (error) {
    console.error('Error seeding sample stories:', error);
    throw error;
  }
}

export async function seedAchievements(): Promise<void> {
  try {
    await connectDB();

    // Check if achievements already exist
    const existingAchievements = await Achievement.countDocuments();

    if (existingAchievements > 0) {
      console.log('Achievements already exist, skipping seeding');
      return;
    }

    // Convert constants to achievement documents
    const achievementDocs = Object.values(ACHIEVEMENTS).map(
      (achievement, index) => ({
        ...achievement,
        type: 'story_milestone' as const,
        rarity: 'common' as const,
        color: 'blue',
        unlockedMessage: `Congratulations! You've unlocked the ${achievement.name} achievement!`,
        isActive: true,
        sortOrder: index,
      })
    );

    const createdAchievements = await Achievement.create(achievementDocs);

    console.log(`Created ${createdAchievements.length} achievements`);
  } catch (error) {
    console.error('Error seeding achievements:', error);
    throw error;
  }
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

    const existingAdmin = await User.findOne({ role: 'admin' });

    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }

    const adminUser = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: process.env.ADMIN_EMAIL || 'admin@mintoons.com',
      password: process.env.ADMIN_PASSWORD || 'admin123456',
      age: 25,
      role: 'admin',
      subscriptionTier: 'PRO',
      emailVerified: true,
      isActive: true,
    });

    console.log('Admin user created:', adminUser.email);
  } catch (error) {
    console.error('Error creating admin user:', error);
    throw error;
  }
}
