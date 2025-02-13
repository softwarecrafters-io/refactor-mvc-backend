import {DiscountCode, Order, OrderStatus} from "../domain/order";
import { OrderRepository } from "../domain/repositories";
import { Id } from "../domain/valueObjects";
import {Document, Model, Mongoose, Schema} from "mongoose";
import mongoose from "mongoose";

interface IOrder extends Document {
    items: {
        productId: string;
        quantity: number;
        price: number;
    }[];
    status: OrderStatus;
    discountCode?: DiscountCode;
    shippingAddress: string;
    total?: number;
}

const OrderSchema: Schema = new Schema({
    items: [
        {
            productId: { type: String },
            quantity: { type: Number },
            price: { type: Number },
        },
    ],
    status: { type: String, default: OrderStatus.Created },
    discountCode: { type: String, required: false },
    shippingAddress: { type: String },
    total: { type: Number, default: 0 },
    id: { type: String },
});

export const OrderModel: Model<IOrder> = mongoose.model<IOrder>('Order', OrderSchema);

export class OrderMongoRepository implements OrderRepository {

    private constructor(private readonly client: Mongoose) {}

    static async create(dbUrl: string): Promise<OrderMongoRepository> {
        const client = await mongoose.connect(dbUrl);
        return new OrderMongoRepository(client);
    }

    findAll(): Promise<Order[]> {
        throw new Error('Method not implemented.');
    }
    findById(id: Id): Promise<Order | undefined> {
        throw new Error('Method not implemented.');
    }
    async save(order: Order): Promise<void> {
        const orderDto = order.toDto();
        const mongooseModel = this.mongooseModel();
        const mongoOrder = new mongooseModel({
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

    private mongooseModel(): Model<IOrder> {
        return this.client.model<IOrder>('Order');
    }
}
