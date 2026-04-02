import Note from '../models/Note.js';
import logger from '../utils/logger.js';

export const getNotes = async (req, res, next) => {
  try {
    const { workspaceId, tag, search, sort, favorites, pinned, shared } = req.query;
    const filter = { userId: req.user._id };

    if (workspaceId) filter.workspaceId = workspaceId;
    if (tag) filter.tags = { $in: [tag] };
    if (favorites === 'true') filter.isFavorite = true;
    if (pinned === 'true') filter.isPinned = true;
    if (shared === 'true') filter.isShared = true;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { 'content.content': { $regex: search, $options: 'i' } },
      ];
    }

    let sortObj = { updatedAt: -1 };
    if (sort === 'newest') sortObj = { createdAt: -1 };
    if (sort === 'oldest') sortObj = { createdAt: 1 };
    if (sort === 'title') sortObj = { title: 1 };

    const notes = await Note.find(filter).sort(sortObj).populate('parentId', 'title icon');
    res.json({ notes });
  } catch (error) {
    next(error);
  }
};

export const getNote = async (req, res, next) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.user._id });
    if (!note) return res.status(404).json({ message: 'Note not found.' });
    res.json({ note });
  } catch (error) {
    next(error);
  }
};

export const createNote = async (req, res, next) => {
  try {
    const { title, content, tags, workspaceId, parentId, icon } = req.body;
    const note = await Note.create({
      title: title || 'Untitled',
      content: content || [{ id: '1', type: 'text', content: '' }],
      tags: tags || [],
      workspaceId,
      userId: req.user._id,
      parentId: parentId || null,
      icon: icon || '📄',
    });

    logger.info(`Note created: ${note._id} by user ${req.user._id}`);
    res.status(201).json({ note });
  } catch (error) {
    next(error);
  }
};

export const updateNote = async (req, res, next) => {
  try {
    const { title, content, tags, icon, isPinned, isFavorite, isShared } = req.body;
    const $set = {};
    if (title !== undefined) $set.title = title;
    if (content !== undefined) $set.content = content;
    if (tags !== undefined) $set.tags = tags;
    if (icon !== undefined) $set.icon = icon;
    if (isPinned !== undefined) $set.isPinned = isPinned;
    if (isFavorite !== undefined) $set.isFavorite = isFavorite;
    if (isShared !== undefined) $set.isShared = isShared;

    // Use $set to avoid Mongoose 8 subdocument validator issues on findOneAndUpdate
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set },
      { new: true }   // removed runValidators:true — causes false 500s on array subdocs in Mongoose 8
    );

    if (!note) return res.status(404).json({ message: 'Note not found.' });
    res.json({ note });
  } catch (error) {
    next(error);
  }
};

export const deleteNote = async (req, res, next) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!note) return res.status(404).json({ message: 'Note not found.' });

    // Delete child notes
    await Note.deleteMany({ parentId: req.params.id });

    logger.info(`Note deleted: ${req.params.id}`);
    res.json({ message: 'Note deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

export const togglePin = async (req, res, next) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.user._id });
    if (!note) return res.status(404).json({ message: 'Note not found.' });

    note.isPinned = !note.isPinned;
    await note.save();
    res.json({ note });
  } catch (error) {
    next(error);
  }
};

export const toggleFavorite = async (req, res, next) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.user._id });
    if (!note) return res.status(404).json({ message: 'Note not found.' });

    note.isFavorite = !note.isFavorite;
    await note.save();
    res.json({ note });
  } catch (error) {
    next(error);
  }
};
