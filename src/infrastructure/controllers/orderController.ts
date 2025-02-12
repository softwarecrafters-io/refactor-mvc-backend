import { Request, Response } from 'express';
import { OrderModel } from '../models/orderModel';
import { OrderStatus, Order } from '../../domain/order';
import { Address, OrderItem } from '../../domain/valueObjects';
import { PositiveNumber } from '../../domain/valueObjects';
import { DomainError } from '../../domain/domainError';

// Create a new order
export const createOrder = async (req: Request, res: Response) => {
    console.log("POST /orders");
    try{
        const { items, discountCode, shippingAddress } = req.body;
        const orderItems = items.map((item: any) => 
            new OrderItem(
                item.productId,
                PositiveNumber.create(item.quantity),
                PositiveNumber.create(item.price)
            )
        ); 
        const order = Order.create(
            orderItems,
            Address.create(shippingAddress),
            discountCode
        );
        const orderDto = order.toDto();
        const newOrder = new OrderModel({
            items: orderDto.items,
            discountCode: orderDto.discountCode,
            shippingAddress: orderDto.shippingAddress,
            total: order.calculateTotal().value,
        });
        await newOrder.save();
        res.send(`Order created with total: ${order.calculateTotal().value}`);
    } 
    catch (error) {
        error instanceof DomainError 
            ? res.status(400).send(error.message) 
            : res.status(500).send('Error creating order');
    }
};

// Get all orders
export const getAllOrders = async (_req: Request, res: Response) => {
    console.log("GET /orders");
    const orders = await OrderModel.find();
    res.json(orders);
};

// Update order
export const updateOrder = async (req: Request, res: Response) => {
    try {
        console.log("PUT /orders/:id");
        const { id } = req.params;
        const { status, shippingAddress, discountCode } = req.body;

        const order = await OrderModel.findById(id);
        if (!order) {
            return;
        }

        if (shippingAddress) {
            order.shippingAddress = shippingAddress;
        }

        if (status) {
            if (status === OrderStatus.Completed && order.items.length === 0) {
                return res.send('Cannot complete an order without items');
            }
            order.status = status;
        }

        if (discountCode) {
            order.discountCode = discountCode;
            if (discountCode === 'DISCOUNT20') {
                let newTotal = 0;
                for (const item of order.items) {
                    newTotal += (item.price || 0) * (item.quantity || 0);
                }
                newTotal *= 0.8;
                order.total = newTotal;
            } else {
                console.log('Invalid or not implemented discount code');
            }
        }

        await order.save();
        res.send(`Order updated. New status: ${order.status}`);
    } catch (error) {
        if (error instanceof Error && error.name === 'CastError') {
            return res.status(404).send('Order not found');
        }
        res.status(500).send('Error updating order');
    }
};

// Complete order
export const completeOrder = async (req: Request, res: Response) => {
    try {
        console.log("POST /orders/:id/complete");
        const { id } = req.params;
        const mongoDoc = await OrderModel.findById(id);
        if (!mongoDoc) {
            return;
        }
        const orderDto = {
            id: (mongoDoc._id as string),
            items: mongoDoc.items,
            shippingAddress: mongoDoc.shippingAddress,
            status: mongoDoc.status,
            discountCode: mongoDoc.discountCode
        };
        const order = Order.createFrom(orderDto);
        order.complete();
        const updatedOrderDto = order.toDto();
        const updatedOrder = new OrderModel({
            _id: id,
            items: updatedOrderDto.items,
            shippingAddress: updatedOrderDto.shippingAddress,
            status: updatedOrderDto.status,
            discountCode: updatedOrderDto.discountCode
        });
        await OrderModel.findOneAndReplace({ _id: id }, updatedOrder, { new: true });
        res.send(`Order with id ${id} completed`);
    } catch (error) {
        if (error instanceof Error && error.name === 'CastError') {
            return res.status(404).send('Order not found to complete');
        }
        console.log(error);
        res.status(500).send('Error completing order');
    }
};

// Delete order
export const deleteOrder = async (req: Request, res: Response) => {
    try {
        await OrderModel.findByIdAndDelete(req.params.id);
        res.send('Order deleted');
    } catch (error) {
        if (error instanceof Error && error.name === 'CastError') {
            return res.status(404).json('Order not found to delete');
        }
        res.status(500).send('Error deleting order');
    }
};
