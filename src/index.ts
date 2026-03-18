import express from "express";
const app = express();

const PORT = 8000;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcom to the calss room backend systen");
});

app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
