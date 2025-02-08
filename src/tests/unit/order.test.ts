import { Order } from "../../domain/order";
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

});
