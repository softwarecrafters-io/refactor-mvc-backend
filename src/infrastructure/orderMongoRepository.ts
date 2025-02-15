import {DiscountCode, Order, OrderStatus} from "../domain/order";
import { OrderRepository } from "../domain/repositories";
import { Id } from "../domain/valueObjects";
import {Document, Model, Mongoose, Schema} from "mongoose";
import mongoose from "mongoose";

interface MongooseOrder extends Document {
    _id: string;
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
    _id: { type: String },
});

export const OrderModel: Model<MongooseOrder> = mongoose.model<MongooseOrder>('Order', OrderSchema);

export class OrderMongoRepository implements OrderRepository {

    private constructor(private readonly client: Mongoose) {}

    static async create(dbUrl: string): Promise<OrderMongoRepository> {
        const client = await mongoose.connect(dbUrl);
        return new OrderMongoRepository(client);
    }

    async findAll(): Promise<Order[]> {
        const orders = await this.mongooseModel().find();
        return orders.map(this.toOrderEntity);
    }

    private toOrderEntity(order: MongooseOrder): Order {
        return Order.createFrom({
            id: order._id as string,
            items: order.items,
            shippingAddress: order.shippingAddress,
            status: order.status,
            discountCode: order.discountCode
        });
    }

    async findById(id: Id): Promise<Order | undefined> {
        const mongooseOrder = await this.mongooseModel().findOne({ _id: id.value });
        return mongooseOrder ? this.toOrderEntity(mongooseOrder) : undefined;
    }

    async save(order: Order): Promise<void> {
        const orderDto = order.toDto();
        const mongooseModel = this.mongooseModel();
        
        await mongooseModel.findOneAndUpdate(
            { _id: orderDto.id },
            {
                _id: orderDto.id,
                items: orderDto.items,
                shippingAddress: orderDto.shippingAddress,
                status: orderDto.status,
                discountCode: orderDto.discountCode
            },
            { upsert: true }
        );
    }

    async delete(order: Order): Promise<void> {
        await this.mongooseModel().deleteOne({ _id: order.toDto().id });
    }

    private mongooseModel(): Model<MongooseOrder> {
        return this.client.model<MongooseOrder>('Order');
    }
}
