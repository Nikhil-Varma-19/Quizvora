import { createClient } from "redis";

export const redis = createClient({
	url: process.env.REDIS_URL,
});

redis.on("error", (err) => {
	console.error("Redis Error:", err);
});

export const createRedisPubSub = async () => {
	const pubClient = redis.duplicate();
	const subClient = pubClient.duplicate();

	pubClient.on("error", (err) => console.error("Redis pub client error:", err));
	subClient.on("error", (err) => console.error("Redis sub client error:", err));

	await Promise.all([pubClient.connect(), subClient.connect()]);

	return { pubClient, subClient };
};

export const redisConnection = async () => {
	const maxRetries = 5;

	for (let attempt = 1; attempt <= maxRetries; attempt++) {
		try {
			await redis.connect();
			console.log("Redis connected");
			return redis;
		} catch (error) {
			console.error(
				`Redis connection failed (Attempt ${attempt}/${maxRetries})`,
				error
			);

			if (attempt === maxRetries) {
				throw new Error("Unable to connect to Redis after 5 attempts");
			}

			await new Promise((resolve) => setTimeout(resolve, 2000));
		}
	}
};