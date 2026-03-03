import mongoose from "mongoose";

const tagSchema = new mongoose.Schema({
    title: { type: String, required: true, lowercase: true, trim: true },
    userId: { type: String, required: true }
});

// Prevent duplicate tags for the same user
tagSchema.index({ title: 1, userId: 1 }, { unique: true });

const Tag = mongoose.model('Tag', tagSchema);
export default Tag;