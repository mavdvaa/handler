import crypto from 'crypto'
import { createClient } from 'redis'
import { publicKey, sign } from './crypto/cryptoPackage.mjs'
import { countT, count, stepT, step } from './scaling/scaling.mjs'
import { shaTaskDb, triggeredTaskDb, userVerification, userAuthorization } from './db/dbTask.mjs'
import bcrypt from 'bcrypt'


//подключение к редис
const client = createClient()
if (!client.isOpen) {
    await client.connect().catch(err => console.log("Ошибка подключения к Redis:", err));
}

//функция
export const handler = async (event, context) => {
    if (event.httpMethod) {
        if (event.path == '/sha' && event.httpMethod == 'POST') {
            return await handleShaApi(event)
        }

        if (event.path == '/triggered' && event.httpMethod == 'POST') {
            return await triggeredTask(event)
        }

        if (event.path == '/users' && event.httpMethod == 'POST') {
            return await registration(event)
        }

        return { statusCode: 400 }
    }

}


//регистрация
async function registration(event) {
    const { userId, password } = JSON.parse(event.body)

    const data = {
        userId,
        password
    }

    const hashedPassword = await bcrypt.hash(password, 8)

    const checkUser = await userVerification(userId)

    if (!checkUser) {
        await userAuthorization(userId, hashedPassword)
    } else

    return {
        statusCode: 400,
        body: JSON.stringify({message: `Пользователь с id ${userId} уже существует`})
    }

    console.log(`Пользователь с id ${userId} уже существует`)

    return {
        statusCode: 202,
        body: JSON.stringify({message: `Пользователь с id ${userId} успешно зарегистрирован`}),
    }
}

// post для triggeres
async function triggeredTask(event) {

    const { userId, difficulty } = JSON.parse(event.body)

    const jobId = crypto.randomUUID()

    const timeStartTrigg = Date.now()

    const data = {
        userId,
        difficulty,
        timeStartTrigg
    }

    const checkUserTrigg = await userVerification(userId)
    const checkDifficiltyTrigg = (difficulty > 0 && difficulty < 4) ? true : false

    if (!checkDifficiltyTrigg) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: `Уровень сложности не должен быть меньше 1 или больше 3` })
        }
    }

    if (!checkUserTrigg) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: `Пользователя с id ${userId} не существует` })
        }
    }

    await triggeredTaskDb(userId, difficulty, stepT[difficulty - 1], jobId, Date.now())

    const signature = sign(data)
    const signedData = {
        ...data,
        signature,
        publicKey: publicKey.export({ type: 'spki', format: 'pem' }).toString(),
        jobId
    }
    let start = 0
    for (let i = 0; i < countT[(difficulty - 1)]; i++) {
        await client.lPush('triggered-task', JSON.stringify({
            ...signedData,
            "start": start,
            "end": start + stepT[(difficulty - 1)]
        }))
        start = start + stepT[(difficulty - 1)]
    }

    return {
        statusCode: 202,
        body: JSON.stringify({ message: 'Задача успешно создана' })
    }
}


// post для sha
async function handleShaApi(event) {

    const { userId, text, difficulty } = JSON.parse(event.body)

    const jobId = crypto.randomUUID()

    const timeStartSHA = Date.now()

    const data = {
        userId,
        text,
        difficulty,
        timeStartSHA
    }

    const checkUserSHA = await userVerification(userId)
    const checkDifficiltySHA = (difficulty > 0 && difficulty < 5) ? true : false

    if (!checkDifficiltySHA) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: `Уровень сложности не должен быть меньше 1 или больше 4` })
        }
    }

    if (!checkUserSHA) {
        return {
            body: JSON.stringify({ message: `Пользователя с id ${userId} не существует` })
        }
    }

    await shaTaskDb(userId, text, difficulty, jobId, Date.now())

    const signature = sign(data)
    const signedData = {
        ...data,
        signature,
        publicKey: publicKey.export({ type: 'spki', format: 'pem' }).toString(),
        jobId
    }

    // кладем в очередь
    let start = 0
    for (let i = 0; i < count[(difficulty - 1)]; i++) {
        await client.lPush('sha-task', JSON.stringify({
            ...signedData,
            "start": start,
            "end": start + step[difficulty - 1]
        }))
        start = start + step[difficulty - 1]
    }

    return {
        statusCode: 202,
        body: JSON.stringify({ message: 'Задача успешно создана' })
    }
}



