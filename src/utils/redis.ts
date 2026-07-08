import { redis } from "../config/redis"

export const redisSet = async <T>(key: string, value: T, ttl?: number) => {
	const data = JSON.stringify(value);

	if (ttl) {
		await redis.set(key, data, {
			EX: ttl,
		})
	} else await redis.set(key, data)

}

export const redisGet = async (key: string) => {

	const data = await redis.get(key);

	return data ? JSON.parse(data) : null
}

export const redisDeleteKey = async (key: string) =>  await redis.del(key)
