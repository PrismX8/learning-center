// Vercel entrypoint - import express directly for detection
import express from "express";

// Re-export the handler from api/index.js
export { default } from "./api/index.js";
