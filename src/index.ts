import express from "express";
import router from "./routes/subjects";
import cors from "cors";
const app = express();

const PORT = 8000;

app.use(express.json());
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);
app.use("/api/subjects", router);
app.get("/", (req, res) => {
  res.send("Welcome to the classroom backend API");
});

app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
