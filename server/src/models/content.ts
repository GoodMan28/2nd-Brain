import mongoose, { model, Schema } from "mongoose";
const contentTypes = ['image', 'video', 'article', 'audio', 'tweet', 'document', 'other'];

const contentSchema = new Schema({
    link: { type: String }, // Optional, legacy support or primary link
    links: [{ type: String }], // New array support
    type: { type: String, enum: contentTypes, required: true },
    title: { type: String, required: true },
    description: { type: String },
    metadata: { type: Object, default: {} },
    tags: [{ type: Schema.Types.ObjectId, ref: 'Tag' }],
    userId: { type: String, required: true, index: true },
    forkCount: { type: Number, default: 0 },
    isFork: { type: Boolean, default: false },
    sourceContentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Content' },
    originalAuthorId: { type: String } // String (Clerk ID)
}, { timestamps: true });

// Indexing for faster search/filtering based on the tags
contentSchema.index({ tags: 1 });

export const Content = model("Content", contentSchema);