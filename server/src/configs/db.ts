import mongoose from "mongoose"
import "dotenv/config"

let setup = async () => {
    try {
        console.log("Connecting to DB at:", process.env.MONGO_URL ? "URL provided" : "URL MISSING");
        await mongoose.connect(`${process.env.MONGO_URL}`)
        console.log("DB Connected !!");
    }
    catch(err: any) {
        console.log(err.message);
    }
}

export default setup;