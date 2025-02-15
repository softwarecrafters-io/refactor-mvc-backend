import dotenv from 'dotenv';
import { OrderMongoRepository } from './orderMongoRepository';
import { OrderRepository } from '../domain/repositories';
dotenv.config({
    path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env'
});

const dbUrl = process.env.MONGODB_URI as string;

export async function createOrderRepository(): Promise<OrderRepository> {
    const repository = await OrderMongoRepository.create(dbUrl);
    return repository;
}
