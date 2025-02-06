import { Request, Response } from 'express';
import { OrderModel } from '../models/orderModel';
import { OrderStatus } from '../domain/order';

// Create a new order
export const createOrder = async (req: Request, res: Response) => {
    console.log("POST /orders");
    const { items, discountCode, shippingAddress } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).send('The order must have at least one item');
    }

    let total = 0;
    for (const item of items) {
        total += (item.price || 0) * (item.quantity || 0);
    }

    if (discountCode === 'DISCOUNT20') {
        total = total * 0.8;
    }

    const newOrder = new OrderModel({
        items,
        discountCode,
        shippingAddress,
        total,
    });

    await newOrder.save();
    res.send(`Order created with total: ${total}`);
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
        const order = await OrderModel.findById(id);
        if (!order) {
            return;
        }

        if (order.status !== OrderStatus.Created) {
            return res.send(`Cannot complete an order with status: ${order.status}`);
        }

        order.status = OrderStatus.Completed;
        await order.save();
        res.send(`Order with id ${id} completed`);
    } catch (error) {
        if (error instanceof Error && error.name === 'CastError') {
            return res.status(404).send('Order not found to complete');
        }
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
