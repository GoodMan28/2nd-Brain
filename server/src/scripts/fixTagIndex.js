import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix path for dotenv
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

console.log("Script started...");

const fixIndexes = async () => {
    try {
        if (!process.env.MONGO_URL) {
            console.error('MONGO_URL not found in environment variables');
            process.exit(1);
        }

        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URL);
        console.log('Connected!');

        const db = mongoose.connection.db;
        if (!db) {
            throw new Error("Database connection failed");
        }

        // Access the raw collection
        const collection = db.collection('tags');
        const indexes = await collection.indexes();

        console.log('Current Indexes:', indexes);

        const problematicIndex = indexes.find(idx => idx.key.title === 1 && Object.keys(idx.key).length === 1);

        if (problematicIndex) {
            console.log(`Found problematic index: ${problematicIndex.name}. Dropping...`);
            await collection.dropIndex(problematicIndex.name);
            console.log('Successfully dropped incorrect unique index on "title".');
        } else {
            console.log('No incorrect index found on "title" field alone.');
        }

    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log("Done.");
        process.exit(0);
    }
};

fixIndexes();
