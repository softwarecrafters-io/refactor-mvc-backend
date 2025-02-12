import request from 'supertest';
import { createServer } from '../../infrastructure/app';
import { Server } from 'http';
import dotenv from 'dotenv';
dotenv.config({
    path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env'
});

describe('Status endpoints', () => {
    let server: Server;

    beforeAll(async () => {
        const dbUrl = process.env.MONGODB_URI as string;
        console.log(dbUrl);
        server = await createServer(3001, dbUrl);
    });

    afterAll(async () => {
        await server.close();
    });

    it('checks API health', async () => {
        const response = await request(server).get('/');
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ status: 'ok' });
    });
});