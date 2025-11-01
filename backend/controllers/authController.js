const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { getDB } = require('../config/db');
const sendOtpMail = require('../services/otpService');
const sendPasswordResetMail = require('../services/passwordResetEmailService');

// Register user
const register = async (req, res) => {
  try {
    const { email, password, user_type, full_name } = req.body;

    if (!email || !password || !user_type || !full_name) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const db = getDB();
    
    // Check if user already exists (safety check)
    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email is already registered. Please sign in instead.' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user object
    const newUser = {
      email,
      password: hashedPassword,
      user_type,
      full_name,
      is_verified: false,
      created_at: new Date(),
      updated_at: new Date()
    };

    // Insert user
    const result = await db.collection('users').insertOne(newUser);
    
    if (result.insertedId) {
      // Remove password from response
      const { password: _, ...userResponse } = newUser;
      userResponse._id = result.insertedId;
      
      res.status(201).json({
        message: 'User registered successfully',
        user: userResponse
      });
    } else {
      res.status(500).json({ error: 'Failed to register user' });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    let db;
    try {
      db = getDB();
    } catch (dbErr) {
      console.error('Database not connected:', dbErr);
      return res.status(500).json({ error: 'Database connection error' });
    }

    // Find user
    const user = await db.collection('users').findOne({ email });
    if (!user) {
      console.warn(`Login failed: user not found for email=${email}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Choose hashed password field (supports legacy records)
    const hashedPassword = typeof user.password === 'string'
      ? user.password
      : (typeof user.password_hash === 'string' ? user.password_hash : null);

    // Defensive guard: ensure stored password is a string
    if (!hashedPassword) {
      console.warn(`Login failed: missing/invalid password hash in DB for email=${email}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    let isValidPassword = false;
    try {
      isValidPassword = await bcrypt.compare(password, hashedPassword);
    } catch (cmpErr) {
      console.error('bcrypt.compare error:', cmpErr);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    if (!isValidPassword) {
      console.warn(`Login failed: invalid password for email=${email}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Prepare safe user response (convert ObjectIds to strings to avoid serialization issues)
    const { password: _, password_hash: __, ...userResponse } = user;
    if (userResponse._id && typeof userResponse._id.toString === 'function') {
      userResponse._id = userResponse._id.toString();
    }
    if (userResponse.company_id && typeof userResponse.company_id.toString === 'function') {
      userResponse.company_id = userResponse.company_id.toString();
    }

    // Resolve userId for JWT
    const userIdStr = userResponse._id
      ? userResponse._id
      : (typeof user._id?.toString === 'function' ? user._id.toString() : (user.id ? String(user.id) : null));

    if (!userIdStr) {
      console.error('JWT sign error: missing user id');
      return res.status(500).json({ error: 'Authentication token generation failed' });
    }

    // Generate JWT token with string userId for consistent middleware handling
    let token;
    try {
      token = jwt.sign(
        {
          userId: userIdStr,
          email: user.email,
          user_type: user.user_type,
        },
        process.env.JWT_SECRET || 'megajobnepal_jwt_secret_key_2024',
        { expiresIn: '24h' }
      );
    } catch (jwtErr) {
      console.error('JWT sign error:', jwtErr);
      return res.status(500).json({ error: 'Authentication token generation failed' });
    }

    console.log('🔍 Login - User type from DB:', user.user_type);
    console.log('🔍 Login - User response user_type:', userResponse.user_type);

    return res.json({
      message: 'Login successful',
      token,
      user: userResponse,
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Get current user
const getMe = async (req, res) => {
  try {
    const db = getDB();
    
    const user = await db.collection('users').findOne(
      { _id: req.user.userId },
      { projection: { password: 0 } }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Send OTP
const sendOtp = async (req, res) => {
  try {
    // Defensive: handle cases where body may be missing or not JSON
    const email = req?.body && typeof req.body === 'object' ? req.body.email : undefined;

    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Valid email is required' });
    }

    let db;
    try {
      db = getDB();
    } catch (dbErr) {
      console.error('Send OTP - Database not connected:', dbErr);
      return res.status(500).json({ error: 'Database connection error' });
    }
    
    // Check if email is already registered
    try {
      const existingUser = await db.collection('users').findOne({ email });
      if (existingUser) {
        return res.status(409).json({ 
          error: 'An account with this email already exists. Please try logging in instead.' 
        });
      }
    } catch (lookupErr) {
      console.error('Send OTP - User lookup error:', lookupErr);
      return res.status(500).json({ error: 'User lookup failed' });
    }
    
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // store as ISO string

    try {
      // Store OTP in database
      await db.collection('otps').deleteMany({ email }); // Remove existing OTPs
      await db.collection('otps').insertOne({
        email,
        otp,
        expiresAt,
        created_at: new Date()
      });
    } catch (storeErr) {
      console.error('Send OTP - OTP store error:', storeErr);
      return res.status(500).json({ error: 'Could not generate OTP at this time' });
    }

    // Send OTP email asynchronously for faster API response; never block or fail the request
    const isDev = (process.env.NODE_ENV && process.env.NODE_ENV.toLowerCase() !== 'production') || !process.env.NODE_ENV;
    Promise.resolve()
      .then(() => sendOtpMail(email, otp))
      .then(result => {
        console.log('📧 OTP email dispatched:', result?.messageId || result);
      })
      .catch(err => {
        console.error('❌ Async OTP send failed:', err);
      });

    const payload = { message: 'OTP sent successfully' };
    if (isDev) {
      payload.otp = otp;
      console.log(`🔧 Dev mode: OTP for ${email} is ${otp}`);
    }
    return res.json(payload);
  } catch (error) {
    console.error('Send OTP error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Signup with OTP verification
const signup = async (req, res) => {
  try {
    const { email, password, user_type, full_name, otp, phone_number, company_data } = req.body;

    if (!email || !password || !user_type || !full_name || !otp) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const db = getDB();
    
    // Verify OTP
    // Fetch OTP record by email and otp; validate expiry in application code
    const otpRecord = await db.collection('otps').findOne({ 
      email, 
      otp: parseInt(otp)
    });

    if (!otpRecord || new Date(otpRecord.expiresAt) <= new Date()) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user object
    const newUser = {
      email,
      password: hashedPassword,
      user_type,
      full_name,
      phone_number: phone_number || null,
      is_verified: true, // User is verified through OTP
      created_at: new Date(),
      updated_at: new Date()
    };

    // Insert user
    const result = await db.collection('users').insertOne(newUser);
    
    if (result.insertedId) {
      // If user is an employer and company data is provided, create company profile
      let companyId = null;
      if (user_type === 'employer' && company_data) {
        const newCompany = {
          name: company_data.company_name,
          description: company_data.company_description || '',
          website: company_data.company_website || '',
          location: company_data.company_location || '',
          industry: company_data.company_industry || '',
          size: company_data.company_size || '',
          founded_year: company_data.company_founded_year || null,
          employer_id: result.insertedId,
          employer_job_title: company_data.employer_job_title || '',
          employer_department: company_data.employer_department || '',
          created_at: new Date(),
          updated_at: new Date()
        };
        
        const companyResult = await db.collection('companies').insertOne(newCompany);
        companyId = companyResult.insertedId;
        
        // Update user with company reference
        await db.collection('users').updateOne(
          { _id: result.insertedId },
          { $set: { company_id: companyId } }
        );
      }
      
      // Remove used OTP
      await db.collection('otps').deleteOne({ _id: otpRecord._id });
      
      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: result.insertedId, 
          email: newUser.email, 
          user_type: newUser.user_type 
        },
        process.env.JWT_SECRET || 'megajobnepal_jwt_secret_key_2024',
        { expiresIn: '24h' }
      );

      // Remove password from response
      const { password: _, ...userResponse } = newUser;
      userResponse._id = result.insertedId;
      
      res.status(201).json({
        message: 'User registered successfully',
        token,
        user: userResponse
      });
    } else {
      res.status(500).json({ error: 'Failed to register user' });
    }
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Verify OTP
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    const db = getDB();
    
    // Find OTP by email and code; check expiry in application code for adapter compatibility
    const otpRecord = await db.collection('otps').findOne({ 
      email, 
      otp: parseInt(otp)
    });

    if (!otpRecord || new Date(otpRecord.expiresAt) <= new Date()) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    // Remove used OTP
    await db.collection('otps').deleteOne({ _id: otpRecord._id });

    res.json({ message: 'OTP verified successfully' });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Forgot password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const db = getDB();
    
    // Check if user exists
    const user = await db.collection('users').findOne({ email });
    if (!user) {
      // Don't reveal if email exists or not for security
      return res.json({ message: 'If an account with that email exists, you will receive a password reset link shortly.' });
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Store reset token in database with expiration
    await db.collection('password_resets').insertOne({
      userId: user._id,
      email: user.email,
      token: resetToken,
      created_at: new Date(),
      expires_at: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
    });

    // Build reset URL for frontend
    const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

    // Send password reset email asynchronously (do not block response)
    Promise.resolve()
      .then(() => sendPasswordResetMail(email, resetUrl))
      .then(result => {
        console.log('📧 Password reset email dispatched:', result?.messageId || result);
      })
      .catch(err => {
        console.error('❌ Async password reset email failed:', err);
      });

    const isDev = (process.env.NODE_ENV && process.env.NODE_ENV.toLowerCase() !== 'production') || !process.env.NODE_ENV;
    const payload = {
      message: 'If an account with that email exists, you will receive a password reset link shortly.'
    };
    // In development, include token for easier local testing
    if (isDev) {
      payload.resetToken = resetToken;
      payload.resetUrl = resetUrl;
    }
    res.json(payload);
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Reset password
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    const db = getDB();

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    // Check if reset token exists in database and is not expired
    const resetRecord = await db.collection('password_resets').findOne({
      token: token,
      expires_at: { $gt: new Date() }
    });

    if (!resetRecord) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    // Hash new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update user password
    await db.collection('users').updateOne(
      { _id: resetRecord.userId },
      { 
        $set: { 
          password: hashedPassword,
          updated_at: new Date()
        }
      }
    );

    // Remove used reset token
    await db.collection('password_resets').deleteOne({ _id: resetRecord._id });

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  register,
  login,
  getMe,
  sendOtp,
  signup,
  verifyOtp,
  forgotPassword,
  resetPassword,
  // Added: general user password reset via OTP
  sendPasswordChangeOtp: async (req, res) => {
    try {
      const { email } = req.body || {};
      if (!email || typeof email !== 'string') {
        return res.status(400).json({ error: 'Valid email is required' });
      }

      const db = getDB();
      const user = await db.collection('users').findOne({ email });
      // For security, respond success even if user not found
      if (!user) {
        return res.json({ message: 'OTP sent successfully' });
      }

      const otp = Math.floor(100000 + Math.random() * 900000);
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

      // Remove any existing password reset OTPs for this email
      await db.collection('otps').deleteMany({ email, purpose: 'password_reset' });

      await db.collection('otps').insertOne({
        email,
        otp,
        expiresAt,
        purpose: 'password_reset',
        created_at: new Date()
      });

      // Send OTP asynchronously
      const isDev = (process.env.NODE_ENV && process.env.NODE_ENV.toLowerCase() !== 'production') || !process.env.NODE_ENV;
      Promise.resolve()
        .then(() => sendOtpMail(email, otp))
        .then(result => {
          console.log('📧 Password reset OTP dispatched:', result?.messageId || result);
        })
        .catch(err => {
          console.error('❌ Async password reset OTP send failed:', err);
        });

      const payload = { message: 'OTP sent successfully' };
      if (isDev) {
        payload.otp = otp;
        console.log(`🔧 Dev mode: Password reset OTP for ${email} is ${otp}`);
      }
      return res.json(payload);
    } catch (error) {
      console.error('Send password change OTP error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  changePasswordWithOtp: async (req, res) => {
    try {
      const { email, otp, newPassword } = req.body || {};
      if (!email || !otp || !newPassword) {
        return res.status(400).json({ error: 'Email, OTP, and new password are required' });
      }
      if (typeof newPassword !== 'string' || newPassword.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long' });
      }

      const db = getDB();

      const user = await db.collection('users').findOne({ email });
      // Do not reveal if user exists
      if (!user) {
        // Still consume OTP if present to avoid probing
        await db.collection('otps').deleteOne({ email, otp: parseInt(otp), purpose: 'password_reset' });
        return res.json({ message: 'Password changed successfully' });
      }

      // Verify OTP for password reset purpose; check expiry in app code for adapter compatibility
      const otpRecord = await db.collection('otps').findOne({
        email,
        otp: parseInt(otp),
        purpose: 'password_reset'
      });

      if (!otpRecord || new Date(otpRecord.expiresAt) <= new Date()) {
        return res.status(400).json({ error: 'Invalid or expired OTP' });
      }

      // Hash new password
      const saltRounds = 10;
      const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

      await db.collection('users').updateOne(
        { _id: user._id },
        { $set: { password: hashedNewPassword, updated_at: new Date() } }
      );

      // Remove used OTP
      await db.collection('otps').deleteOne({ _id: otpRecord._id });

      return res.json({ message: 'Password changed successfully' });
    } catch (error) {
      console.error('Change password with OTP error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
};