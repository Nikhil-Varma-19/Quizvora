import express from "express";
import fs from "fs";
import path from "path";

const router = express.Router();

// read compiled JS in production OR TS in dev
const files = fs.readdirSync(__dirname);

files
  .filter((file) => file !== "index.ts" && file !== "index.js")
  .forEach((file) => {
    const routePath = `./${file}`;
    const route = require(routePath);

    const name = file.split(".")[0];
    router.use(`/${name}`, route.default || route);
  });

export default router;