import { DomainError } from "./domainError";
import { Address, PositiveNumber } from "./valueObjects";

import { Id, OrderItem } from "./valueObjects";

export enum OrderStatus {
    Created = "CREATED",
    Completed = "COMPLETED"
}

export type DiscountCode = "DISCOUNT20";

export type OrderItemDto = {
    productId: string;
    quantity: number;
    price: number;
}

export type OrderDto = {
    id: string;
    items: OrderItemDto[];
    shippingAddress: string;
    status: OrderStatus;
    discountCode?: DiscountCode;
}

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

    static createFrom(dto: OrderDto): Order {
        return new Order(
            Id.createFrom(dto.id),
            dto.items.map(item => new OrderItem(Id.createFrom(item.productId), PositiveNumber.create(item.quantity), PositiveNumber.create(item.price))),
            Address.create(dto.shippingAddress),
            OrderStatus.Created,
            dto.discountCode
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

    toDto(){
        return {
            id: this.id.value,
            items: this.items.map(item => item.toDto()),
            shippingAddress: this.shippingAddress.value,
            status: this.status,
            discountCode: this.discountCode
        }
    }
}
