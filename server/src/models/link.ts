import mongoose from "mongoose";

const linkSchema = new mongoose.Schema({
  hash: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
}, {timestamps: true});

let Link = mongoose.model("Link", linkSchema);
export default Link;