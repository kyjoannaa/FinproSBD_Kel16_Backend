const { createClient } = require('redis')

const redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://127.0.0.1:6379'
})

redisClient.on('error', (err) => {
    console.error('Redis Error:', err)
})

async function connectRedis() {
    try {
        await redisClient.connect()
        console.log('Redis connected')
    } catch (err) {
        console.error('Redis gagal connect, lanjut tanpa Redis:', err.message)
    }
}

module.exports = {
    redisClient,
    connectRedis
}
