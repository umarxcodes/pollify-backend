import express from "express";
import mongoose from "mongoose";

export const healthRouter = express.Router();

healthRouter.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Service is healthy",
    timestamp: new Date().toISOString(),
  });
});

healthRouter.get("/db", async (_req, res, next) => {
  try {
    const state = mongoose.connection.readyState;
    const statusMap = {
      0: "disconnected",
      1: "connected",
      2: "connecting",
      3: "disconnecting",
    };
    const dbStatus = statusMap[state] || "unknown";

    if (state === 1) {
      res.status(200).json({
        success: true,
        message: "Database is connected",
        db: dbStatus,
        timestamp: new Date().toISOString(),
      });
    } else {
      res.status(503).json({
        success: false,
        message: "Database is not connected",
        db: dbStatus,
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    next(error);
  }
});
