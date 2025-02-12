import express, { Request, Response, RequestHandler } from 'express';
import mongoose from 'mongoose';
import {
    createOrder,
    getAllOrders,
    updateOrder,
    completeOrder,
    deleteOrder
} from './controllers/orderController';
import { Server } from 'http';


export async function createServer(port: number, dbUrl: string): Promise<Server> {
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }
    await mongoose.connect(dbUrl);
    console.log('Connected to MongoDB');

    const app = express();
    app.use(express.json());

    app.post('/orders', ((req: Request, res: Response) => createOrder(req, res)) as RequestHandler);
    app.get('/orders', ((req: Request, res: Response) => getAllOrders(req, res)) as RequestHandler);
    app.put('/orders/:id', ((req: Request, res: Response) => updateOrder(req, res)) as RequestHandler);
    app.post('/orders/:id/complete', ((req: Request, res: Response) => completeOrder(req, res)) as RequestHandler);
    app.delete('/orders/:id', ((req: Request, res: Response) => deleteOrder(req, res)) as RequestHandler);
    app.get('/', ((req: Request, res: Response) => {
        console.log("GET /");
        res.send({ status: 'ok' });
    }) as RequestHandler);

    return app.listen(port);
}


