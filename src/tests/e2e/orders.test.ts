import request from 'supertest';
import { createServer } from '../../infrastructure/app';
import { Server } from 'http';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
dotenv.config({
    path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env'
});

describe('POST /orders', () => {
    let server: Server;
    
    beforeAll(async () => {
        const dbUrl = process.env.MONGODB_URI as string;
        server = await createServer(3002, dbUrl);
    });

    afterEach(async () => {
        await mongoose.connection.dropDatabase();
    });

    afterAll(async () => {
        await mongoose.connection.close();
        await server.close();
    });

    it('creates a new order successfully', async () => {
        const response = await createValidOrderRequest(server);

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

describe('GET /orders', () => {
    let server: Server;
    
    beforeAll(async () => {
        const dbUrl = process.env.MONGODB_URI as string;
        server = await createServer(3002, dbUrl);
    });

    afterEach(async () => {
        await mongoose.connection.dropDatabase();
    });

    afterAll(async () => {
        await mongoose.connection.close();
        await server.close();
    });

    it('lists no orders when store is empty', async () => {
        const response = await request(server)
            .get('/orders');

        expect(response.status).toBe(200);
        expect(response.body).toEqual([]);
    });

    it('lists one order after creating it', async () => {
        await createValidOrderRequest(server);

        const response = await request(server)
            .get('/orders');

        expect(response.status).toBe(200);
        expect(response.body.length).toBe(1);
        expect(response.body[0]).toHaveProperty('items');
        expect(response.body[0].shippingAddress).toBe("Calle Test 0");
    });
});

describe('DELETE /orders', () => {
    let server: Server;
    
    beforeAll(async () => {
        const dbUrl = process.env.MONGODB_URI as string;
        server = await createServer(3002, dbUrl);
    });

    afterEach(async () => {
        await mongoose.connection.dropDatabase();
    });

    afterAll(async () => {
        await mongoose.connection.close();
        await server.close();
    });

    it('deletes an order successfully', async () => {
        //Arrange
        const orderId = await createOrder(server);
        //Act
        const deleteResponse = await request(server)
            .delete(`/orders/${orderId}`);
        //Assert
        expect(deleteResponse.status).toBe(200);
        expect(deleteResponse.text).toBe('Order deleted');
        const getResponse = await request(server)
            .get('/orders');
        expect(getResponse.status).toBe(200);
        expect(getResponse.body.length).toBe(0);
    });

    it('fails to delete an order that does not exist', async () => {
        const deleteResponse = await request(server)
            .delete('/orders/123');
        expect(deleteResponse.status).toBe(404);
        expect(deleteResponse.body).toBe('Order not found to delete');
    });
});

describe('POST /orders/:id/complete', () => {
    let server: Server;
    
    beforeAll(async () => {
        const dbUrl = process.env.MONGODB_URI as string;
        server = await createServer(3002, dbUrl);
    });

    afterEach(async () => {
        await mongoose.connection.dropDatabase();
    });

    afterAll(async () => {
        await mongoose.connection.close();
        await server.close();
    });

    it('completes a given valid order', async () => {
        //Arrange
        const orderId = await createOrder(server);
        //Act
        const completeResponse = await request(server)
            .post(`/orders/${orderId}/complete`);
        //Assert
        expect(completeResponse.status).toBe(200);
        expect(completeResponse.text).toBe(`Order with id ${orderId} completed`);
        const getResponse = await request(server)
            .get('/orders');
        expect(getResponse.status).toBe(200);
        expect(getResponse.body[0].status).toBe('COMPLETED');
    });

    it('fails to complete an order that does not exist', async () => {
        const completeResponse = await request(server)
            .post('/orders/123/complete');
        expect(completeResponse.status).toBe(404);
        expect(completeResponse.text).toBe('Order not found to complete');
    });
});

describe('PUT /orders/:id', () => {
    let server: Server;
    
    beforeAll(async () => {
        const dbUrl = process.env.MONGODB_URI as string;
        server = await createServer(3002, dbUrl);
    });

    afterEach(async () => {
        await mongoose.connection.dropDatabase();
    });

    afterAll(async () => {
        await mongoose.connection.close();
        await server.close();
    });

    it('updates address a given valid order', async () => {
        const orderId = await createOrder(server);
        const updateResponse = await request(server)
            .put(`/orders/${orderId}`)
            .send({
                shippingAddress: "Updated address"
            })
        expect(updateResponse.status).toBe(200);
        const getResponse = await request(server)
            .get('/orders');
        expect(getResponse.status).toBe(200);
        expect(getResponse.body[0].shippingAddress).toBe("Updated address");
    });

    it('fails to update an order that does not exist', async () => {
        const updateResponse = await request(server)
            .put('/orders/123')
            .send({
                shippingAddress: "Updated address"
            })
        expect(updateResponse.status).toBe(404);
        expect(updateResponse.text).toBe('Order not found');
    });
});


async function createValidOrderRequest(server: Server) {
    const order = {
        items: [
            {
                productId: "1",
                quantity: 1,
                price: 100
            }
        ],
        shippingAddress: "Calle Test 0"
    };
    return await request(server)
        .post('/orders')
        .send(order);
}

async function createOrder(server: Server): Promise<string> {
    await createValidOrderRequest(server);
    const response = await request(server)
        .get('/orders');
    return response.body[0]._id;
}