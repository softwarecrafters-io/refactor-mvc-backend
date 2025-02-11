import dotenv from 'dotenv';
import mongoose, { Model } from 'mongoose';
import { Address, Id, OrderItem, PositiveNumber } from '../../domain/valueObjects';
import { Order, OrderStatus } from '../../domain/order';
import { OrderModel } from '../../models/orderModel';
import { OrderRepository } from '../../domain/repositories';
dotenv.config({
    path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env'
});

class OrderMongoRepository implements OrderRepository {
    findAll(): Promise<Order[]> {
        throw new Error('Method not implemented.');
    }
    findById(id: Id): Promise<Order | undefined> {
        throw new Error('Method not implemented.');
    }
    async save(order: Order): Promise<void> {
        const orderDto = order.toDto();
        const mongoOrder = new OrderModel({
            id: orderDto.id,
            items: orderDto.items,
            shippingAddress: orderDto.shippingAddress,
            status: orderDto.status,
            discountCode: orderDto.discountCode
        });
        await mongoOrder.save();
    }
    delete(order: Order): Promise<void> {
        throw new Error('Method not implemented.');
    }
}

describe('OrderMongoRepository', () => {
    beforeAll(async () => {
        await mongoose.connect(process.env.MONGODB_URI as string);
        await mongoose.connection.dropDatabase();
    });

    afterEach(async () => {
        await mongoose.connection.dropDatabase();
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    it("saves a given new valid order", async () => {
        // Arrange
        const item = new OrderItem(
            Id.create(),
            PositiveNumber.create(1),
            PositiveNumber.create(100)
        );
        const order = Order.create(
            [item],
            Address.create("Test address")
        );
        const repository = new OrderMongoRepository();
        // Act
        await repository.save(order);
        // Assert
        const savedOrder = await OrderModel.findOne({});
        expect(savedOrder).not.toBeNull();
        expect(savedOrder?.shippingAddress).toBe("Test address");
        expect(savedOrder?.status).toBe(OrderStatus.Created);
    });
});
