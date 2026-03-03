import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMessage {
    role: "user" | "assistant";
    content: string;
    searchIntent?: string;
    citedNotes?: mongoose.Types.ObjectId[];
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IConversation extends Document {
    userId: string;
    messages: IMessage[];
    createdAt: Date;
    updatedAt: Date;
}

const messageSchema = new Schema<IMessage>({
    role: {
        type: String,
        enum: ["user", "assistant"],
        required: true
    },
    content: {
        type: String,
        required: true
    },
    searchIntent: {
        type: String
    },
    citedNotes: [{ 
        type: Schema.Types.ObjectId, 
        ref: 'Content' 
    }]
}, { timestamps: true });

const conversationSchema = new Schema<IConversation>({
    userId: { 
        type: String, 
        required: true, 
        index: true 
    },
    messages: [messageSchema]
}, { timestamps: true });

export const Conversation: Model<IConversation> = mongoose.model<IConversation>("Conversation", conversationSchema);
