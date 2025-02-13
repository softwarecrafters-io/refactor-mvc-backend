import dotenv from 'dotenv';
import mongoose, { Model } from 'mongoose';
import { Address, Id, OrderItem, PositiveNumber } from '../../domain/valueObjects';
import { Order, OrderStatus } from '../../domain/order';
import {OrderModel, OrderMongoRepository} from '../../infrastructure/orderMongoRepository';


describe('OrderMongoRepository', () => {
    let repository: OrderMongoRepository;
    beforeAll(async () => {
        const dbUrl = "mongodb://127.0.0.1:27017/db_orders_mongo_repository";
        repository = await OrderMongoRepository.create(dbUrl);
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
        // Act
        await repository.save(order);
        // Assert
        const savedOrder = await OrderModel.findOne({});
        expect(savedOrder).not.toBeNull();
        expect(savedOrder?.shippingAddress).toBe("Test address");
        expect(savedOrder?.status).toBe(OrderStatus.Created);
    });
});
