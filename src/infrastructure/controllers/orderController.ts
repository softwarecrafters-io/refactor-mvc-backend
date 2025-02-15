import { Request, Response } from 'express';
import { OrderStatus, Order } from '../../domain/order';
import { Address, OrderItem } from '../../domain/valueObjects';
import { PositiveNumber } from '../../domain/valueObjects';
import { DomainError } from '../../domain/domainError';
import {OrderModel} from "../orderMongoRepository";
import { createOrderRepository } from '../factory';
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
        const orderRepository = await createOrderRepository();
        await orderRepository.save(order);
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
            return res.status(404).send('Order not found');
        }

        if (shippingAddress) {
            order.shippingAddress = shippingAddress;
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
            return res.status(404).send('Order not found to complete');
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
        res.status(500).send('Error completing order');
    }
};

// Delete order
export const deleteOrder = async (req: Request, res: Response) => {
    try {
        const order = await OrderModel.findById(req.params.id);
        if (!order) {
            return res.status(404).json('Order not found to delete');
        }
        await OrderModel.findByIdAndDelete(req.params.id);
        res.send('Order deleted');
    } catch (error) {
        res.status(500).json('Error deleting order');
    }
};
