import express from "express";
import { Request, Response, NextFunction } from "express";
const app = express();
import dotenv from "dotenv";
dotenv.config();
import connectWithRetry from "./config/db";
import routes from "./routes/index";
import createHttpError from "http-errors";

app.use(express.json());

connectWithRetry();


app.use("/api", routes);

app.use(function(req, res, next) {
  next(createHttpError(404));
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
	console.error(err);

	res.status(err.statusCode || 500).json({
		message: err.message,
		error: err.name,
	});
});
		

// app.listen(port, () => {
// 	console.log(`Server is running on port ${port}`);
// });

export default app
