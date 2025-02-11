import { Order, OrderStatus } from "../../domain/order";
import { Address, Id, OrderItem, PositiveNumber } from "../../domain/valueObjects";

describe("The Order", () => {
    it("creates an order with the given fields are valid", () => {
        const items = [
            new OrderItem(Id.create(), PositiveNumber.create(10), PositiveNumber.create(1)),
            new OrderItem(Id.create(), PositiveNumber.create(20), PositiveNumber.create(2)),
        ];
        const order = Order.create(items, Address.create("123 Main St"), "DISCOUNT20");
        expect(order).toBeDefined();
    });

    it("does not allow to create an order when no items are provided", () => {
        expect(() => Order.create(undefined as unknown as OrderItem[], Address.create("123 Main St"), "DISCOUNT20")).toThrow("The order must have at least one item");
        expect(() => Order.create({} as unknown as OrderItem[], Address.create("123 Main St"), "DISCOUNT20")).toThrow("The order must have at least one item");
        expect(() => Order.create([], Address.create("123 Main St"), "DISCOUNT20")).toThrow("The order must have at least one item");
    });

    it("calculates the total price for a given order with a single item", ()=>{
        const order = Order.create([
            new OrderItem(Id.create(), PositiveNumber.create(1), PositiveNumber.create(10)),
        ], Address.create("123 Main St"));
        expect(order.calculateTotal()).toEqual(PositiveNumber.create(10));
    });

    it("calculates the total price for a given order with multiple items", ()=>{
        const order = Order.create([
            new OrderItem(Id.create(), PositiveNumber.create(2), PositiveNumber.create(10)), 
            new OrderItem(Id.create(), PositiveNumber.create(2), PositiveNumber.create(10)), 
        ], Address.create("123 Main St"));
        expect(order.calculateTotal()).toEqual(PositiveNumber.create(40));
    });
    
    it("calculates the total price for a given order with multiple items and a discount code", ()=>{
        const order = Order.create([
            new OrderItem(Id.create(), PositiveNumber.create(2), PositiveNumber.create(10)), 
            new OrderItem(Id.create(), PositiveNumber.create(2), PositiveNumber.create(10)), 
        ], Address.create("123 Main St"), "DISCOUNT20");
        expect(order.calculateTotal()).toEqual(PositiveNumber.create(32));
    });

    it("completes an given order with created status", ()=>{
        const order = Order.create([
            new OrderItem(Id.create(), PositiveNumber.create(2), PositiveNumber.create(10)), 
            new OrderItem(Id.create(), PositiveNumber.create(2), PositiveNumber.create(10)), 
        ], Address.create("123 Main St"), "DISCOUNT20");

        order.complete();

        expect(order.isCompleted()).toBe(true);
    });

    it("does not allow to complete an order with no created status", ()=>{
        const order = Order.create([
            new OrderItem(Id.create(), PositiveNumber.create(2), PositiveNumber.create(10)), 
            new OrderItem(Id.create(), PositiveNumber.create(2), PositiveNumber.create(10)), 
        ], Address.create("123 Main St"), "DISCOUNT20");

        order.complete();

        expect(() => order.complete()).toThrow(`Cannot complete an order with status: ${OrderStatus.Completed}`);
    });

    it("transforms the order to a DTO", ()=>{
        const order = Order.create([
            new OrderItem(Id.create(), PositiveNumber.create(2), PositiveNumber.create(10)), 
        ], Address.create("123 Main St"), "DISCOUNT20");
       
        const dto = order.toDto();

        expect(dto.id).toBeDefined();
        expect(dto.items.length).toBe(1);
        expect(dto.shippingAddress).toBe("123 Main St");
        expect(dto.status).toBe(OrderStatus.Created);
        expect(dto.discountCode).toBe("DISCOUNT20");
    });

    it("creates an order from a DTO", ()=>{
        const dto = {
            id: Id.create().value,
            items: [new OrderItem(Id.create(), PositiveNumber.create(2), PositiveNumber.create(10)).toDto()],
            shippingAddress: "123 Main St",
            status: OrderStatus.Created,
        };
        
        const order = Order.createFrom(dto);
        
        const orderDto = order.toDto();
        expect(orderDto).toBeDefined();
        expect(orderDto.items.length).toBe(1);
        expect(orderDto.shippingAddress).toBe("123 Main St");
    });
});
