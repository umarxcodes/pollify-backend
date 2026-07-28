import express from "express";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Polling App Api are  Working Fine !");
});

export default app;
