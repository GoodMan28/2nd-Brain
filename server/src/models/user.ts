import mongoose from "mongoose";
import { lowercase, trim } from "zod";

let userSchema = new mongoose.Schema({
    username: {type:String, required: true, unique: true, trim: true},
    clerkId: { type: String, required: true, unique: true }
}, {timestamps: true})

let User = mongoose.model("User", userSchema);
export default User;