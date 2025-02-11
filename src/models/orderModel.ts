import mongoose, { Document, Schema, Model } from 'mongoose';
import { DiscountCode, OrderStatus } from '../domain/order';

export interface IOrder extends Document {
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
