import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Workspace from '../models/Workspace.js';
import logger from '../utils/logger.js';

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const safeUserPayload = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  avatar: user.avatar,
  workspaces: user.workspaces,
  currentStreak: user.currentStreak || 0,
  longestStreak: user.longestStreak || 0,
  lastActiveDate: user.lastActiveDate || null,
});

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered.' });
    }

    const user = await User.create({ name, email, password });

    // Create default personal workspace
    const workspace = await Workspace.create({
      name: `${name}'s Workspace`,
      type: 'personal',
      owner: user._id,
      members: [{ user: user._id, role: 'admin' }],
    });

    user.workspaces.push(workspace._id);
    user.updateStreak();
    await user.save();

    const token = generateToken(user._id);

    logger.info(`User registered: ${email}`);
    res.status(201).json({ token, user: safeUserPayload(user) });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password').populate('workspaces');
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Update streak on every login
    user.updateStreak();
    await user.save();

    const token = generateToken(user._id);

    logger.info(`User logged in: ${email} | Streak: ${user.currentStreak}`);
    res.json({ token, user: safeUserPayload(user) });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('workspaces');
    res.json({ user: safeUserPayload(user) });
  } catch (error) {
    next(error);
  }
};
