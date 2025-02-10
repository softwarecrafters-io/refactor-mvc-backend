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
        private readonly id: Id,
        private readonly items: OrderItem[],
        private readonly shippingAddress: Address,
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
        const total = this.items.reduce(
            (total, item) => total.add(item.calculateSubtotal()), 
            PositiveNumber.create(0)
        );
        return this.applyDiscount(total);
    }

    private applyDiscount(total: PositiveNumber): PositiveNumber {
        if (this.discountCode === "DISCOUNT20") {
            return total.multiply(PositiveNumber.create(0.8));
        }
        return total;
    }

    complete() {
        this.ensureThatOrderCanBeCompleted();
        this.status = OrderStatus.Completed;
    }

    private ensureThatOrderCanBeCompleted() {
        if (this.status !== OrderStatus.Created) {
            throw new DomainError(`Cannot complete an order with status: ${this.status}`);
        }
    }

    isCompleted(): boolean {
        return this.status === OrderStatus.Completed;
    }
}
