const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authenticateToken, authorize } = require('../middleware/auth');

const router = express.Router();

// Register (Users only, or by Admin/SuperAdmin)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, address, role, subscriptionStatus, class: classField } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Get token from header if exists
    const token = req.headers.authorization?.split(' ')[1];
    
    if (token) {
      // If token exists, verify it and check user role
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const currentUser = await User.findById(decoded.userId);
        
        if (currentUser && (currentUser.role === 'Admin' || currentUser.role === 'SuperAdmin')) {
          // Admin/SuperAdmin can create any role
          const userData = {
            name,
            email,
            password,
            phone,
            address,
            role: role || 'User',
            subscriptionStatus: subscriptionStatus || 'unpaid',
          };

          // نضيف الكلاس فقط للمستخدمين العاديين والطلاب
          if (role === 'User' || role === 'Teacher') {
            userData.class = classField;
          }

          const user = new User(userData);
          await user.save();

          return res.status(201).json({
            message: 'User created successfully',
            user: {
              id: user._id,
              name: user.name,
              email: user.email,
              role: user.role,
              subscriptionStatus: user.subscriptionStatus,
              class: user.class
            }
          });
        }
      } catch (error) {
        // Token invalid, continue as normal registration
      }
    }

    // Normal registration - only User role allowed
    if (role && role !== 'User') {
      return res.status(403).json({ error: 'Only regular users can register directly' });
    }

    const userData = {
      name,
      email,
      password,
      phone,
      address,
      role: 'User', // Force User role for public registration
      subscriptionStatus: 'unpaid',
      class: classField // المستخدمين العاديين لازم يكون عندهم كلاس
    };

    const user = new User(userData);
    await user.save();

    const newToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token: newToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        class: user.class 
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login مع ديبق مفصل
router.post('/login', async (req, res) => {
  try {
    console.log('🔐 === LOGIN ATTEMPT START ===');
    console.log('📧 Email:', req.body.email);
    console.log('🔑 Password length:', req.body.password?.length);
    
    const { email, password } = req.body;

    if (!email || !password) {
      console.log('❌ Missing email or password');
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user by email
    console.log('🔍 Searching for user...');
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log('❌ USER NOT FOUND in database');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('✅ User found:', {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });

    // Check password
    console.log('🔑 Comparing passwords...');
    const isMatch = await user.comparePassword(password);
    console.log('Password match result:', isMatch);
    
    if (!isMatch) {
      console.log('❌ PASSWORD MISMATCH');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('✅ Password correct, generating token...');
    
    // تأكد من وجود JWT_SECRET
    if (!process.env.JWT_SECRET) {
      console.log('❌ JWT_SECRET is missing!');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('✅ Token generated successfully');
    console.log('👤 Login successful for:', user.email, 'Role:', user.role);
    console.log('🔐 === LOGIN ATTEMPT END ===');

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        class: user.class || null
      }
    });
  } catch (error) {
    console.error('💥 LOGIN ERROR:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;