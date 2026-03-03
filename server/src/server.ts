console.log("Starting server process...");
import setup from "./configs/db.js";
import { userRouter } from "./routes/userRoute.js";
import cors from "cors"
import express from "express"
import "dotenv/config"
import { contentRouter } from "./routes/contentRoute.js";
import tagRouter from "./routes/tagRoute.js";
import shareRouter from "./routes/shareRoute.js";
import chatRouter from "./routes/chatRoute.js";
let app = express()

app.use(cors({
    origin: "http://localhost:5173", // Allow frontend origin
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"]
}))
app.use(express.json())

app.use("/api/v1/user", userRouter)
app.use("/api/v1/content", contentRouter)
app.use("/api/v1/tag", tagRouter)
app.use("/api/v1/share/", shareRouter)
app.use("/api/v1/chat", chatRouter)
app.get("/", (req, res) => {
    res.status(200).json({
        "success": true,
        "msg": "root is running"
    })
})

let port: number = Number(process.env.PORT) || 3000;
await setup()
app.listen(port, () => console.log(`Server running on port ${port}`))