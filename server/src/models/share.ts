import mongoose from "mongoose";
const shareSchema = new mongoose.Schema({
    shareToken: { type: String, required: true, unique: true },
    contentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Content', required: true },
    canFork: { type: Boolean, default: true } // As per your suggestion
});

const Share = mongoose.model('Share', shareSchema);
export default Share;