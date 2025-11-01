// PostgreSQL-based authentication service (browser-backed stub) for MegaJobNepal
import { dbService, User } from './db-service';

// Simple email service simulation for OTP
class MockEmailService {
  async sendOTP(email: string, otp: string): Promise<void> {
    // OTP generated and would be sent via email service in production
    // In production, integrate with real email service like SendGrid, AWS SES, etc.
  }

  async sendPasswordResetToken(email: string, resetToken: string): Promise<void> {
    console.log(`[MOCK EMAIL] Password reset token for ${email}: ${resetToken}`);
    console.log(`Reset link: ${window.location.origin}/auth/reset-password?token=${resetToken}`);
    // In production, send actual email with reset link
  }
}

const emailService = new MockEmailService();

// Token payload interface
interface TokenPayload {
  userId: string;
  email: string;
  userType: 'job_seeker' | 'employer' | 'admin';
  iat: number;
  exp: number;
}

// Password hashing using Web Crypto API
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}

// Simple JWT implementation using browser storage
function generateToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): string {
  const now = Math.floor(Date.now() / 1000);
  const tokenPayload: TokenPayload = {
    ...payload,
    iat: now,
    exp: now + (7 * 24 * 60 * 60), // 7 days
  };
  
  // In production, use proper JWT signing
  return btoa(JSON.stringify(tokenPayload));
}

function verifyToken(token: string): TokenPayload | null {
  try {
    const payload = JSON.parse(atob(token)) as TokenPayload;
    const now = Math.floor(Date.now() / 1000);
    
    if (payload.exp < now) {
      return null; // Token expired
    }
    
    return payload;
  } catch {
    return null;
  }
}

// Generate OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Generate reset token  
function generateResetToken(): string {
  return Math.random().toString(36).substr(2, 15) + Date.now().toString(36);
}

// PostgreSQL Authentication Service
class PostgreSQLAuthService {
  // Sign up new user
  async signUp(userData: {
    email: string;
    password: string;
    full_name: string;
    user_type: 'job_seeker' | 'employer';
    phone_number?: string;
  }): Promise<{ user: User } | { error: string }> {
    try {
      // Check if user already exists
      const existingUser = await dbService.getUserByEmail(userData.email);
      if (existingUser) {
        return { error: 'User with this email already exists' };
      }

      // Hash password
      const password_hash = await hashPassword(userData.password);

      // Generate OTP
      const otp_code = generateOTP();
      const otp_expires_at = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Create user
      const newUser = await dbService.createUser({
        ...userData,
        password_hash,
        is_verified: false,
        otp_code,
        otp_expires_at,
      });

      // Send OTP email
      await emailService.sendOTP(userData.email, otp_code);

      // Remove sensitive data from response
      const { password_hash: _, otp_code: __, ...userResponse } = newUser;
      return { user: userResponse as User };
    } catch (error) {
      console.error('Sign up error:', error);
      return { error: 'Failed to create account' };
    }
  }

  // Sign in user
  async signIn(email: string, password: string): Promise<{ token: string; user: User } | { error: string }> {
    try {
      // Find user by email
      const user = await dbService.getUserByEmail(email);
      if (!user) {
        return { error: 'Invalid email or password' };
      }

      // Verify password
      const isValidPassword = await verifyPassword(password, user.password_hash);
      if (!isValidPassword) {
        return { error: 'Invalid email or password' };
      }

      // Check if user is verified
      if (!user.is_verified) {
        return { error: 'Please verify your email address first' };
      }

      // Generate token
      const token = generateToken({
        userId: user.id!,
        email: user.email,
        userType: user.user_type,
      });

      // Remove sensitive data from response
      const { password_hash, otp_code, ...userResponse } = user;
      console.log(`✅ Login successful for ${email} (${user.user_type})`);
      return { token, user: userResponse as User };
    } catch (error) {
      console.error('Sign in error:', error);
      return { error: 'Failed to sign in' };
    }
  }

  // Verify OTP
  async verifyOTP(userId: string, otp: string): Promise<{ success: boolean; error?: string }> {
    try {
      const user = await dbService.getUserById(userId);
      if (!user) {
        return { success: false, error: 'User not found' };
      }

      if (user.is_verified) {
        return { success: false, error: 'User is already verified' };
      }

      if (!user.otp_code || user.otp_code !== otp) {
        return { success: false, error: 'Invalid OTP' };
      }

      if (!user.otp_expires_at || new Date() > user.otp_expires_at) {
        return { success: false, error: 'OTP has expired' };
      }

      // Update user as verified
      await dbService.updateUser(userId, {
        is_verified: true,
        otp_code: undefined,
        otp_expires_at: undefined,
      });

      return { success: true };
    } catch (error) {
      console.error('OTP verification error:', error);
      return { success: false, error: 'Failed to verify OTP' };
    }
  }

  // Resend OTP
  async resendOTP(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const user = await dbService.getUserById(userId);
      if (!user) {
        return { success: false, error: 'User not found' };
      }

      if (user.is_verified) {
        return { success: false, error: 'User is already verified' };
      }

      // Generate new OTP
      const otp_code = generateOTP();
      const otp_expires_at = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Update user with new OTP
      await dbService.updateUser(userId, {
        otp_code,
        otp_expires_at,
      });

      // Send OTP email
      await emailService.sendOTP(user.email, otp_code);

      return { success: true };
    } catch (error) {
      console.error('Resend OTP error:', error);
      return { success: false, error: 'Failed to resend OTP' };
    }
  }

  // Forgot password
  async forgotPassword(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      const user = await dbService.getUserByEmail(email);
      if (!user) {
        // Don't reveal if email exists
        return { success: true };
      }

      // Generate reset token
      const resetToken = generateResetToken();
      const tokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      // Store reset token (in production, use a separate collection)
      localStorage.setItem(`reset_token_${resetToken}`, JSON.stringify({
        userId: user.id,
        email: user.email,
        expires: tokenExpiry.getTime(),
      }));

      // Send reset email
      await emailService.sendPasswordResetToken(email, resetToken);

      return { success: true };
    } catch (error) {
      console.error('Forgot password error:', error);
      return { success: false, error: 'Failed to send reset email' };
    }
  }

  // Reset password
  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Retrieve reset token data
      const tokenData = localStorage.getItem(`reset_token_${token}`);
      if (!tokenData) {
        return { success: false, error: 'Invalid or expired reset token' };
      }

      const { userId, expires } = JSON.parse(tokenData);
      
      if (Date.now() > expires) {
        localStorage.removeItem(`reset_token_${token}`);
        return { success: false, error: 'Reset token has expired' };
      }

      // Hash new password
      const password_hash = await hashPassword(newPassword);

      // Update user password
      await dbService.updateUser(userId, { password_hash });

      // Remove used token
      localStorage.removeItem(`reset_token_${token}`);

      return { success: true };
    } catch (error) {
      console.error('Reset password error:', error);
      return { success: false, error: 'Failed to reset password' };
    }
  }

  // Get current user by token
  async getCurrentUser(token: string): Promise<User | null> {
    try {
      const payload = verifyToken(token);
      if (!payload) {
        return null;
      }

      const user = await dbService.getUserById(payload.userId);
      if (!user) {
        return null;
      }

      // Remove sensitive data
      const { password_hash, otp_code, ...userResponse } = user;
      return userResponse as User;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  // Update user profile
  async updateProfile(userId: string, updates: Partial<User>): Promise<User | null> {
    try {
      // Remove sensitive fields that shouldn't be updated directly
      const { password_hash, otp_code, otp_expires_at, ...safeUpdates } = updates;

      const updatedUser = await dbService.updateUser(userId, safeUpdates);
      if (!updatedUser) {
        return null;
      }

      // Remove sensitive data
      const { password_hash: _, otp_code: __, ...userResponse } = updatedUser;
      return userResponse as User;
    } catch (error) {
      console.error('Update profile error:', error);
      return null;
    }
  }

  // Change password
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
      const user = await dbService.getUserById(userId);
      if (!user) {
        return { success: false, error: 'User not found' };
      }

      // Verify current password
      const isValidPassword = await verifyPassword(currentPassword, user.password_hash);
      if (!isValidPassword) {
        return { success: false, error: 'Current password is incorrect' };
      }

      // Hash new password
      const password_hash = await hashPassword(newPassword);

      // Update password
      await dbService.updateUser(userId, { password_hash });

      return { success: true };
    } catch (error) {
      console.error('Change password error:', error);
      return { success: false, error: 'Failed to change password' };
    }
  }

  // Generate token for authenticated users
  generateToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): string {
    return generateToken(payload);
  }
}

// Global auth service instance
export const postgresqlAuthService = new PostgreSQLAuthService();
