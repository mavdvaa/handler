import { randomUUID } from 'crypto'
import { createClient } from 'redis'
import { publicKey, sign } from './crypto/cryptoPackage.mjs'
import { initDB } from './db/db.mjs'
import { periodicTaskDb, userVerification } from './db/dbTask.mjs'

//подключение к редис
const client = createClient()
if (!client.isOpen) {
    await client.connect().catch(err => console.log("Redis Connect Error:", err));
}

initDB()

//функция
export const handler = async () => {

    const userId = Math.floor(Math.random() * (5 - 1 + 1)) + 1
    const check = Math.floor(Math.random() * (410 - 0 + 1)) + 0
    const timeStartPeriod = Date.now()

    const data = {
        userId,
        check,
        timeStartPeriod
    }

    const checkUserPeriod = await userVerification(userId)

    if (!checkUserPeriod) {
        console.log(`Periodic task: пользователь с id ${userId} не может выполнить задание, он не зарегистрирован.`)
        return null
    }

    const jobId = randomUUID()

    await periodicTaskDb(userId, check, jobId, Date.now())

    const signature = sign(data)

    const signedData = {
        ...data,
        signature,
        publicKey: publicKey.export({ type: 'spki', format: 'pem' }).toString(),
        jobId
    }

    await client.lPush('periodic-task', JSON.stringify(signedData))

    return {
        statusCode: 202
    }

}



