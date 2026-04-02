import Workspace from '../models/Workspace.js';
import User from '../models/User.js';
import logger from '../utils/logger.js';

export const getWorkspaces = async (req, res, next) => {
  try {
    const workspaces = await Workspace.find({
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id },
      ],
    }).populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');

    res.json({ workspaces });
  } catch (error) {
    next(error);
  }
};

export const createWorkspace = async (req, res, next) => {
  try {
    const { name, type, icon } = req.body;
    const workspace = await Workspace.create({
      name,
      type: type || 'personal',
      owner: req.user._id,
      members: [{ user: req.user._id, role: 'admin' }],
      icon: icon || '🏠',
    });

    await User.findByIdAndUpdate(req.user._id, {
      $push: { workspaces: workspace._id },
    });

    logger.info(`Workspace created: ${workspace.name} by ${req.user._id}`);
    res.status(201).json({ workspace });
  } catch (error) {
    next(error);
  }
};

export const getWorkspace = async (req, res, next) => {
  try {
    const workspace = await Workspace.findById(req.params.id)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');

    if (!workspace) return res.status(404).json({ message: 'Workspace not found.' });
    res.json({ workspace });
  } catch (error) {
    next(error);
  }
};

export const updateWorkspace = async (req, res, next) => {
  try {
    const { name, icon } = req.body;
    const workspace = await Workspace.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      { name, icon },
      { new: true }
    );

    if (!workspace) return res.status(404).json({ message: 'Workspace not found.' });
    res.json({ workspace });
  } catch (error) {
    next(error);
  }
};

export const addMember = async (req, res, next) => {
  try {
    const { email, role } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const workspace = await Workspace.findById(req.params.id);
    if (!workspace) return res.status(404).json({ message: 'Workspace not found.' });

    const alreadyMember = workspace.members.some(m => m.user.toString() === user._id.toString());
    if (alreadyMember) return res.status(400).json({ message: 'User is already a member.' });

    workspace.members.push({ user: user._id, role: role || 'editor' });
    await workspace.save();

    user.workspaces.push(workspace._id);
    await user.save();

    res.json({ workspace });
  } catch (error) {
    next(error);
  }
};
