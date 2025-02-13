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

    it("finds all previously saved orders", async () => {
        // Arrange
        const item = new OrderItem(
            Id.create(),
            PositiveNumber.create(1),
            PositiveNumber.create(100)
        );
        const order = Order.create(
            [item],
            Address.create("Test address"),
            "DISCOUNT20"
        );
        await repository.save(order);
        // Act
        const orders = await repository.findAll();
        // Assert
        expect(orders.length).toBe(1);
        expect(orders[0].toDto().shippingAddress).toBe("Test address");
        expect(orders[0].toDto().status).toBe(OrderStatus.Created);
        expect(orders[0].toDto().discountCode).toBe("DISCOUNT20");
        expect(orders[0].toDto().items.length).toBe(1);
        expect(orders[0].toDto().items[0].productId).toBe(item.productId.value);
        expect(orders[0].toDto().items[0].quantity).toBe(item.quantity.value);
        expect(orders[0].toDto().items[0].price).toBe(item.price.value);
    });
});
