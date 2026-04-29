import request from 'supertest';

const agent = request('http://localhost:3000');

describe('API Endpoints (Supertest)', () => {

    test('POST /users — регистрация нового пользователя', async () => {
        const randomId = Math.floor(Math.random() * 1000000);
        const res = await agent
            .post('/users')
            .send({ userId: randomId, password: 'testpassword' });

        expect(res.status).toBe(202);
        expect(res.body.message).toContain('успешно зарегистрирован');
    });

    test('POST /sha - неправильный уровень сложности', async () => {
        const res = await agent
            .post('/sha')
            .send({ userId: 1, text: 'test', difficulty: 99 });

        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/уровень сложности/i);
    });

    test('triggered - неправильный уровень сложности', async () => {
        const res = await agent
            .post('/triggered')
            .send({ userId: 1, difficulty: 99 });

        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/уровень сложности/i);
    });

    test('sha - неправильный id пользователя', async () => {
        const res = await agent
            .post('/sha')
            .send({ userId: 999999, text: 'test', difficulty: 1 });

        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/не существует/i);
    });

    test('triggered - неправильный id пользователя', async () => {
        const res = await agent
            .post('/triggered')
            .send({ userId: 999999, difficulty: 1 });

        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/не существует/i);
    });

    test('sha - все правильно', async () => {
        const res = await agent
            .post('/sha')
            .send({ userId: 3, text: 'test', difficulty: 1 });

        expect(res.status).toBe(202);
    });

    test('triggered - все правильно', async () => {
        const res = await agent
            .post('/triggered')
            .send({ userId: 1, difficulty: 1 });

        expect(res.status).toBe(202);

    });


    test('users - ошибка при повторной регистрации', async () => {
        const duplicateId = Math.floor(Math.random() * 1000);
        await agent.post('/users').send({ userId: duplicateId, password: '123' });
        const res = await agent.post('/users').send({ userId: duplicateId, password: '123' });

        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/уже существует/i);
    });
});
