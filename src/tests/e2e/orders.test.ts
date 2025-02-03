import request from 'supertest';
import { createServer } from '../../app';
import { Server } from 'http';
import dotenv from 'dotenv';
dotenv.config({
    path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env'
});

describe('POST /orders', () => {
    let server: Server;
    
    beforeAll(async () => {
        const dbUrl = process.env.MONGODB_URI as string;
        server = await createServer(3002, dbUrl);
    });

    afterAll(async () => {
        await server.close();
    });

    it('creates a new order successfully', async () => {
        const orderData = {
            items: [
                {
                    productId: "1",
                    quantity: 1,
                    price: 100
                }
            ],
            shippingAddress: "Calle Test 0"
        };
        const response = await request(server)
            .post('/orders')
            .send(orderData);

        expect(response.status).toBe(200);
        expect(response.text).toBe('Order created with total: 100');
    });

    it('fails to create an order with empty items array', async () => {
        const invalidOrderData = {
            items: [],
            shippingAddress: "Calle Test 0"
        };

        const response = await request(server)
            .post('/orders')
            .send(invalidOrderData);

        expect(response.status).toBe(400); 
        expect(response.text).toBe('The order must have at least one item');
    });
});
