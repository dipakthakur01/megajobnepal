import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import { dbService, User } from './mongodb';
import { env } from './env';

// JWT Token management
// JWTPayload structure: { userId, email, userType, iat?, exp? }

export class AuthService {
  constructor() {
    this.emailTransporter = null;
    this.initEmailTransporter();
  }

  initEmailTransporter() {
    if (env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS) {
      this.emailTransporter = nodemailer.createTransporter({
        host: env.SMTP_HOST,
        port: parseInt(env.SMTP_PORT || '587'),
        secure: false,
        auth: {
          user: env.SMTP_USER,
          pass: env.SMTP_PASS,
        },
      });
    }
  }

  // Password hashing
  async hashPassword(password) {
    return bcrypt.hash(password, 12);
  }

  async verifyPassword(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
  }

  // JWT token operations
  generateToken(payload) {
    const secret = env.JWT_SECRET || 'fallback-secret-key';
    const tokenPayload = {
      userId: payload.userId,
      email: payload.email,
      userType: payload.userType,
    };
    const options = {
      expiresIn: '7d',
    };
    return jwt.sign(tokenPayload, secret, options);
  }

  verifyToken(token) {
    try {
      const secret = env.JWT_SECRET || 'fallback-secret-key';
      return jwt.verify(token, secret);
    } catch (error) {
      console.error('Token verification failed:', error);
      return null;
    }
  }

  // OTP validation
  isOTPValid(otpExpiresAt) {
    return new Date() < new Date(otpExpiresAt);
  }

  // Email sending
  async sendOTPEmail(email, otp, userName) {
    if (!this.emailTransporter) {
      // OTP generated but email service not configured - would be sent in production
      return true; // For development, consider OTP sent
    }

    try {
      await this.emailTransporter.sendMail({
        from: env.SMTP_USER,
        to: email,
        subject: 'Your MegaJobNepal Verification Code',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #FF6600;">MegaJobNepal - Email Verification</h2>
            <p>Hello ${userName},</p>
            <p>Your verification code is:</p>
            <div style="background-color: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0;">
              <h1 style="color: #FF6600; font-size: 32px; margin: 0;">${otp}</h1>
            </div>
            <p>This code will expire in 10 minutes.</p>
            <p>If you didn't request this code, please ignore this email.</p>
            <hr style="margin: 20px 0;">
            <p style="color: #666; font-size: 12px;">
              This is an automated email from MegaJobNepal. Please do not reply to this email.
            </p>
          </div>
        `,
      });
      return true;
    } catch (error) {
      console.error('Failed to send OTP email:', error);
      return false;
    }
  }

  async sendPasswordResetEmail(email, resetToken, userName) {
    if (!this.emailTransporter) {
      console.log(`Password reset token for ${email}: ${resetToken} (Email not configured)`);
      return true; // For development
    }

    try {
      const resetLink = `${env.FRONTEND_URL}/reset-password?token=${resetToken}`;
      
      await this.emailTransporter.sendMail({
        from: env.SMTP_USER,
        to: email,
        subject: 'Reset Your MegaJobNepal Password',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #FF6600;">MegaJobNepal - Password Reset</h2>
            <p>Hello ${userName},</p>
            <p>You requested to reset your password. Click the button below to reset it:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" style="background-color: #FF6600; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Reset Password
              </a>
            </div>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request this reset, please ignore this email.</p>
            <hr style="margin: 20px 0;">
            <p style="color: #666; font-size: 12px;">
              This is an automated email from MegaJobNepal. Please do not reply to this email.
            </p>
          </div>
        `,
      });
      return true;
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      return false;
    }
  }

  // User registration
  async signUp(userData) {
    try {
      const db = await dbService.getDatabase();
      const usersCollection = db.collection('users');

      // Check if user already exists
      const existingUser = await usersCollection.findOne({ email: userData.email });
      if (existingUser) {
        return { error: 'User already exists with this email' };
      }

      // Hash password
      const hashedPassword = await this.hashPassword(userData.password);

      // Generate OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Create user
      const newUser = {
        email: userData.email,
        password_hash: hashedPassword,
        full_name: userData.full_name,
        user_type: userData.user_type,
        phone_number: userData.phone_number || null,
        is_verified: false,
        otp_code: otp,
        otp_expires_at: otpExpiresAt,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const result = await usersCollection.insertOne(newUser);
      const user = await usersCollection.findOne({ _id: result.insertedId });

      // Send OTP email
      await this.sendOTPEmail(userData.email, otp, userData.full_name);

      // Generate token
      const token = this.generateToken({
        userId: user._id.toString(),
        email: user.email,
        userType: user.user_type,
      });

      return { user, token };
    } catch (error) {
      console.error('Sign up error:', error);
      return { error: 'Failed to create user account' };
    }
  }

  // User login
  async signIn(email, password) {
    try {
      const db = await dbService.getDatabase();
      const usersCollection = db.collection('users');

      // Find user
      const user = await usersCollection.findOne({ email });
      if (!user) {
        return { error: 'Invalid email or password' };
      }

      // Verify password
      const isValidPassword = await this.verifyPassword(password, user.password_hash);
      if (!isValidPassword) {
        return { error: 'Invalid email or password' };
      }

      // Generate token
      const token = this.generateToken({
        userId: user._id.toString(),
        email: user.email,
        userType: user.user_type,
      });

      return { user, token };
    } catch (error) {
      console.error('Sign in error:', error);
      return { error: 'Failed to sign in' };
    }
  }

  // OTP verification
  async verifyOTP(userId, otp) {
    try {
      const db = await dbService.getDatabase();
      const usersCollection = db.collection('users');

      const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
      if (!user) {
        return { success: false, error: 'User not found' };
      }

      if (!user.otp_code) {
        return { success: false, error: 'No OTP found for this user' };
      }

      if (user.otp_code !== otp) {
        return { success: false, error: 'Invalid OTP' };
      }

      if (!this.isOTPValid(user.otp_expires_at)) {
        return { success: false, error: 'OTP has expired' };
      }

      // Update user as verified
      await usersCollection.updateOne(
        { _id: new ObjectId(userId) },
        {
          $set: {
            is_verified: true,
            updated_at: new Date(),
          },
          $unset: {
            otp_code: '',
            otp_expires_at: '',
          },
        }
      );

      return { success: true };
    } catch (error) {
      console.error('OTP verification error:', error);
      return { success: false, error: 'Failed to verify OTP' };
    }
  }

  // Resend OTP
  async resendOTP(userId) {
    try {
      const db = await dbService.getDatabase();
      const usersCollection = db.collection('users');

      const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
      if (!user) {
        return { success: false, error: 'User not found' };
      }

      if (user.is_verified) {
        return { success: false, error: 'User is already verified' };
      }

      // Generate new OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

      await usersCollection.updateOne(
        { _id: new ObjectId(userId) },
        {
          $set: {
            otp_code: otp,
            otp_expires_at: otpExpiresAt,
            updated_at: new Date(),
          },
        }
      );

      // Send OTP email
      await this.sendOTPEmail(user.email, otp, user.full_name);

      return { success: true };
    } catch (error) {
      console.error('Resend OTP error:', error);
      return { success: false, error: 'Failed to resend OTP' };
    }
  }

  // Forgot password
  async forgotPassword(email) {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
      
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to process password reset request' };
      }

      return { success: true, resetToken: data.resetToken }; // resetToken is for development only
    } catch (error) {
      console.error('Forgot password error:', error);
      return { success: false, error: 'Failed to process password reset request' };
    }
  }

  // Reset password
  async resetPassword(token, newPassword) {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
      
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to reset password' };
      }

      return { success: true };
    } catch (error) {
      console.error('Reset password error:', error);
      return { success: false, error: 'Failed to reset password' };
    }
  }

  // Get current user
  async getCurrentUser(token) {
    try {
      const decoded = this.verifyToken(token);
      if (!decoded) {
        return null;
      }

      const db = await dbService.getDatabase();
      const usersCollection = db.collection('users');

      const user = await usersCollection.findOne({ _id: new ObjectId(decoded.userId) });
      return user;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  // Update user profile
  async updateProfile(userId, updates) {
    try {
      const db = await dbService.getDatabase();
      const usersCollection = db.collection('users');

      await usersCollection.updateOne(
        { _id: new ObjectId(userId) },
        {
          $set: {
            ...updates,
            updated_at: new Date(),
          },
        }
      );

      const updatedUser = await usersCollection.findOne({ _id: new ObjectId(userId) });
      return updatedUser;
    } catch (error) {
      console.error('Update profile error:', error);
      return null;
    }
  }
}

export const authService = new AuthService();
