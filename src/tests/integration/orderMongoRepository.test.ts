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
        const savedOrder = await repository.findAll();
        expect(savedOrder[0]).not.toBeNull();
        expect(savedOrder[0].toDto().shippingAddress).toBe("Test address");
        expect(savedOrder[0].toDto().status).toBe(OrderStatus.Created);
    });

    it("updates a previously saved order", async () => {
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
        order.updateShippingAddress(Address.create("Another address"));
        await repository.save(order);
        // Assert
        const savedOrder = await repository.findAll();
        expect(savedOrder[0].toDto().shippingAddress).toBe("Another address");
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

    it("finds a previously saved orders by id", async () => {
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
        const id = Id.createFrom(order.toDto().id);
        const foundOrder = await repository.findById(id);
        // Assert
        expect(foundOrder).not.toBeNull();
        expect(foundOrder?.toDto().shippingAddress).toBe("Test address");
        expect(foundOrder?.toDto().status).toBe(OrderStatus.Created);
        expect(foundOrder?.toDto().discountCode).toBe("DISCOUNT20");
    });

    it("does not find an order if the id does not match", async () => {
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
        const id = Id.createFrom("invalid-id");
        const result = await repository.findById(id);
        // Assert
        expect(result).toBeUndefined();
    });

    it("deletes a previously saved order", async () => {
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
        await repository.delete(order);
        // Assert
        const result = await repository.findById(Id.createFrom(order.toDto().id));
        expect(result).toBeUndefined();
    });

    it("does not delete an order if the id does not match", async () => {
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
        const anotherOrder = Order.create(
            [item],
            Address.create("Another address"),
        );
        await repository.delete(anotherOrder);
        // Assert
        const result = await repository.findById(Id.createFrom(order.toDto().id));
        expect(result).not.toBeNull();
    });

    
});
