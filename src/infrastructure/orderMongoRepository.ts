import { Order } from "../domain/order";
import { OrderRepository } from "../domain/repositories";
import { OrderModel } from "./models/orderModel";
import { Id } from "../domain/valueObjects";

export class OrderMongoRepository implements OrderRepository {
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