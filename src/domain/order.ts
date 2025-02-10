import { DomainError } from "./domainError";
import { Address, PositiveNumber } from "./valueObjects";

import { Id, OrderItem } from "./valueObjects";

export enum OrderStatus {
    Created = "CREATED",
    Completed = "COMPLETED"
}

export type DiscountCode = "DISCOUNT20";

export class Order {
    private constructor(
        readonly id: Id,
        readonly items: OrderItem[],
        readonly shippingAddress: Address,
        private status: OrderStatus,
        private readonly discountCode?: DiscountCode
    ) {}

    static create(items: OrderItem[], shippingAddress: Address, discountCode?: DiscountCode): Order {
        Order.ensureThatItemsAreProvided(items);
        
        return new Order(
            Id.create(), 
            items, 
            shippingAddress, 
            OrderStatus.Created, 
            discountCode
        );
    }

    private static ensureThatItemsAreProvided(items: OrderItem[]) {
        if (!items || !Array.isArray(items) || items.length === 0) {
            throw new DomainError("The order must have at least one item");
        }
    }

    calculateTotal(): PositiveNumber {
        return this.items.reduce(
            (total, item) => total.add(item.calculateSubtotal()), 
            PositiveNumber.create(0)
        );
    }

}
