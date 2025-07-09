// lib/realtime/websockets.ts - Socket.io server-side implementation
import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { getToken } from 'next-auth/jwt';
import { connectDB } from '@lib/database/connection';
import User from '@models/User';
import Story from '@models/Story';
import Comment from '@models/Comment';

interface SocketUser {
  id: string;
  name: string;
  role: string;
  age: number;
}

interface AuthenticatedSocket extends Socket {
  user?: SocketUser;
}

export class WebSocketManager {
  private io: SocketIOServer | null = null;
  private activeUsers = new Map<string, SocketUser>();
  private userSockets = new Map<string, string[]>(); // userId -> socketIds
  private storyRooms = new Map<string, Set<string>>(); // storyId -> userIds

  initialize(httpServer: HTTPServer): void {
    this.io = new SocketIOServer(httpServer, {
      path: '/api/socket',
      cors: {
        origin: process.env.APP_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
      },
    });

    this.setupEventHandlers();
    console.log('WebSocket server initialized');
  }

  private setupEventHandlers(): void {
    if (!this.io) return;

    this.io.use(async (socket: any, next) => {
      try {
        // Authenticate socket connection
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error('Authentication error'));
        }

        const decoded = await getToken({
          token,
          secret: process.env.NEXTAUTH_SECRET!,
        });

        if (!decoded) {
          return next(new Error('Invalid token'));
        }

        socket.user = {
          id: decoded.id,
          name: decoded.name,
          role: decoded.role,
          age: decoded.age,
        };

        next();
      } catch (error) {
        next(new Error('Authentication failed'));
      }
    });

    this.io.on('connection', (socket: AuthenticatedSocket) => {
      this.handleConnection(socket);
    });
  }

  private handleConnection(socket: AuthenticatedSocket): void {
    if (!socket.user) return;

    const userId = socket.user.id;

    // Track active user
    this.activeUsers.set(userId, socket.user);

    // Track user sockets
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, []);
    }
    this.userSockets.get(userId)!.push(socket.id);

    console.log(`User ${socket.user.name} connected (${socket.id})`);

    // Handle story collaboration
    socket.on('joinStory', async (data: { storyId: string }) => {
      await this.handleJoinStory(socket, data.storyId);
    });

    socket.on('leaveStory', async (data: { storyId: string }) => {
      await this.handleLeaveStory(socket, data.storyId);
    });

    // Handle real-time commenting
    socket.on(
      'newComment',
      async (data: {
        storyId: string;
        content: string;
        type: string;
        highlightedText?: string;
        highlightPosition?: { start: number; end: number };
      }) => {
        await this.handleNewComment(socket, data);
      }
    );

    socket.on(
      'commentUpdate',
      async (data: { commentId: string; content: string }) => {
        await this.handleCommentUpdate(socket, data);
      }
    );

    // Handle typing indicators
    socket.on(
      'typingStart',
      (data: { storyId: string; type: 'story' | 'comment' }) => {
        this.handleTypingStart(socket, data);
      }
    );

    socket.on(
      'typingStop',
      (data: { storyId: string; type: 'story' | 'comment' }) => {
        this.handleTypingStop(socket, data);
      }
    );

    // Handle story updates
    socket.on(
      'storyUpdate',
      async (data: { storyId: string; content: string; wordCount: number }) => {
        await this.handleStoryUpdate(socket, data);
      }
    );

    // Handle disconnection
    socket.on('disconnect', () => {
      this.handleDisconnection(socket);
    });
  }

  private async handleJoinStory(
    socket: AuthenticatedSocket,
    storyId: string
  ): Promise<void> {
    try {
      await connectDB();

      // Verify user can access this story
      const story = await Story.findById(storyId);
      if (!story) {
        socket.emit('error', { message: 'Story not found' });
        return;
      }

      // Check permissions
      const canAccess = this.canAccessStory(socket.user!, story);
      if (!canAccess) {
        socket.emit('error', { message: 'Access denied' });
        return;
      }

      // Join story room
      socket.join(`story:${storyId}`);

      // Track story room participation
      if (!this.storyRooms.has(storyId)) {
        this.storyRooms.set(storyId, new Set());
      }
      this.storyRooms.get(storyId)!.add(socket.user!.id);

      // Notify others in the room
      socket.to(`story:${storyId}`).emit('userJoined', {
        userId: socket.user!.id,
        userName: socket.user!.name,
        userRole: socket.user!.role,
      });

      // Send current story state
      const comments = await Comment.find({ storyId })
        .populate('authorId', 'firstName lastName')
        .sort({ createdAt: 1 });

      socket.emit('storyJoined', {
        storyId,
        story: {
          title: story.title,
          content: story.content,
          status: story.status,
          wordCount: story.wordCount,
        },
        comments,
        activeUsers: Array.from(this.storyRooms.get(storyId)!)
          .map(userId => this.activeUsers.get(userId))
          .filter(Boolean),
      });
    } catch (error) {
      console.error('Error joining story:', error);
      socket.emit('error', { message: 'Failed to join story' });
    }
  }

  private async handleLeaveStory(
    socket: AuthenticatedSocket,
    storyId: string
  ): Promise<void> {
    socket.leave(`story:${storyId}`);

    // Remove from story room tracking
    if (this.storyRooms.has(storyId)) {
      this.storyRooms.get(storyId)!.delete(socket.user!.id);

      // Clean up empty rooms
      if (this.storyRooms.get(storyId)!.size === 0) {
        this.storyRooms.delete(storyId);
      }
    }

    // Notify others
    socket.to(`story:${storyId}`).emit('userLeft', {
      userId: socket.user!.id,
      userName: socket.user!.name,
    });
  }

  private async handleNewComment(
    socket: AuthenticatedSocket,
    data: any
  ): Promise<void> {
    try {
      await connectDB();

      // Verify user can comment (mentor or admin only)
      if (!['mentor', 'admin'].includes(socket.user!.role)) {
        socket.emit('error', { message: 'Only mentors can add comments' });
        return;
      }

      // Create comment
      const comment = await Comment.create({
        storyId: data.storyId,
        authorId: socket.user!.id,
        authorName: socket.user!.name,
        authorRole: socket.user!.role,
        content: data.content,
        type: data.type,
        highlightedText: data.highlightedText,
        highlightPosition: data.highlightPosition,
      });

      const populatedComment = await Comment.findById(comment._id).populate(
        'authorId',
        'firstName lastName avatar'
      );

      // Broadcast to story room
      this.io?.to(`story:${data.storyId}`).emit('newComment', {
        comment: populatedComment,
        storyId: data.storyId,
      });

      // Notify story author if not in room
      const story = await Story.findById(data.storyId);
      if (story) {
        this.sendNotificationToUser(story.authorId.toString(), {
          type: 'mentor_comment',
          title: 'New Comment on Your Story',
          message: `${socket.user!.name} commented on "${story.title}"`,
          data: {
            storyId: data.storyId,
            commentId: comment._id,
            commentPreview: data.content.slice(0, 100),
          },
        });
      }
    } catch (error) {
      console.error('Error creating comment:', error);
      socket.emit('error', { message: 'Failed to create comment' });
    }
  }

  private async handleCommentUpdate(
    socket: AuthenticatedSocket,
    data: any
  ): Promise<void> {
    try {
      await connectDB();

      const comment = await Comment.findById(data.commentId);
      if (!comment) {
        socket.emit('error', { message: 'Comment not found' });
        return;
      }

      // Verify ownership or admin
      if (
        comment.authorId.toString() !== socket.user!.id &&
        socket.user!.role !== 'admin'
      ) {
        socket.emit('error', { message: 'Permission denied' });
        return;
      }

      // Update comment
      comment.content = data.content;
      await comment.save();

      // Broadcast update
      this.io?.to(`story:${comment.storyId}`).emit('commentUpdated', {
        commentId: data.commentId,
        content: data.content,
        updatedAt: comment.updatedAt,
      });
    } catch (error) {
      console.error('Error updating comment:', error);
      socket.emit('error', { message: 'Failed to update comment' });
    }
  }

  private handleTypingStart(socket: AuthenticatedSocket, data: any): void {
    socket.to(`story:${data.storyId}`).emit('userTyping', {
      userId: socket.user!.id,
      userName: socket.user!.name,
      type: data.type,
    });
  }

  private handleTypingStop(socket: AuthenticatedSocket, data: any): void {
    socket.to(`story:${data.storyId}`).emit('userStoppedTyping', {
      userId: socket.user!.id,
      type: data.type,
    });
  }

  private async handleStoryUpdate(
    socket: AuthenticatedSocket,
    data: any
  ): Promise<void> {
    try {
      await connectDB();

      const story = await Story.findById(data.storyId);
      if (!story) {
        socket.emit('error', { message: 'Story not found' });
        return;
      }

      // Verify ownership
      if (story.authorId.toString() !== socket.user!.id) {
        socket.emit('error', { message: 'Permission denied' });
        return;
      }

      // Update story
      story.content = data.content;
      story.wordCount = data.wordCount;
      await story.save();

      // Broadcast update to mentors in the room
      socket.to(`story:${data.storyId}`).emit('storyUpdated', {
        storyId: data.storyId,
        content: data.content,
        wordCount: data.wordCount,
        updatedAt: story.updatedAt,
      });
    } catch (error) {
      console.error('Error updating story:', error);
      socket.emit('error', { message: 'Failed to update story' });
    }
  }

  private handleDisconnection(socket: AuthenticatedSocket): void {
    if (!socket.user) return;

    const userId = socket.user.id;

    // Remove socket from user tracking
    const userSocketIds = this.userSockets.get(userId);
    if (userSocketIds) {
      const index = userSocketIds.indexOf(socket.id);
      if (index > -1) {
        userSocketIds.splice(index, 1);
      }

      // If no more sockets for this user, remove from active users
      if (userSocketIds.length === 0) {
        this.activeUsers.delete(userId);
        this.userSockets.delete(userId);
      }
    }

    // Remove from all story rooms
    for (const [storyId, userIds] of this.storyRooms.entries()) {
      if (userIds.has(userId)) {
        userIds.delete(userId);

        // Notify others in the room
        socket.to(`story:${storyId}`).emit('userLeft', {
          userId,
          userName: socket.user.name,
        });

        // Clean up empty rooms
        if (userIds.size === 0) {
          this.storyRooms.delete(storyId);
        }
      }
    }

    console.log(`User ${socket.user.name} disconnected (${socket.id})`);
  }

  private canAccessStory(user: SocketUser, story: any): boolean {
    // Story author can always access
    if (story.authorId.toString() === user.id) {
      return true;
    }

    // Mentors and admins can access assigned stories
    if (['mentor', 'admin'].includes(user.role)) {
      return true;
    }

    // Public stories can be viewed by anyone
    if (story.isPublic) {
      return true;
    }

    return false;
  }

  private sendNotificationToUser(userId: string, notification: any): void {
    const userSocketIds = this.userSockets.get(userId);
    if (userSocketIds && userSocketIds.length > 0) {
      userSocketIds.forEach(socketId => {
        this.io?.to(socketId).emit('notification', notification);
      });
    }
  }

  // Public methods for sending notifications from other parts of the app
  sendToUser(userId: string, event: string, data: any): void {
    const userSocketIds = this.userSockets.get(userId);
    if (userSocketIds && userSocketIds.length > 0) {
      userSocketIds.forEach(socketId => {
        this.io?.to(socketId).emit(event, data);
      });
    }
  }

  sendToStory(storyId: string, event: string, data: any): void {
    this.io?.to(`story:${storyId}`).emit(event, data);
  }

  sendToRole(role: string, event: string, data: any): void {
    for (const [userId, user] of this.activeUsers.entries()) {
      if (user.role === role) {
        this.sendToUser(userId, event, data);
      }
    }
  }

  getActiveUsers(): SocketUser[] {
    return Array.from(this.activeUsers.values());
  }

  getStoryParticipants(storyId: string): SocketUser[] {
    const userIds = this.storyRooms.get(storyId);
    if (!userIds) return [];

    return Array.from(userIds)
      .map(userId => this.activeUsers.get(userId))
      .filter(Boolean) as SocketUser[];
  }

  isUserOnline(userId: string): boolean {
    return this.activeUsers.has(userId);
  }

  // Cleanup method for graceful shutdown
  cleanup(): void {
    if (this.io) {
      this.io.close();
      this.io = null;
    }
    this.activeUsers.clear();
    this.userSockets.clear();
    this.storyRooms.clear();
  }
}

// Export singleton instance
export const webSocketManager = new WebSocketManager();
