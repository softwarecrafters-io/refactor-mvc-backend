import { DomainError } from "./domainError";
import { v4 as uuid } from "uuid";

export class PositiveNumber {
    private constructor(private readonly value: number) {}

    static create(value: number): PositiveNumber {
        if (value < 0) {
            throw new DomainError("Value must be positive");
        }
        return new PositiveNumber(value);
    }

    multiply(other: PositiveNumber): PositiveNumber {
        return new PositiveNumber(this.value * other.value);
    }

    add(other: PositiveNumber): PositiveNumber {
        return new PositiveNumber(this.value + other.value);
    }

    equals(other: PositiveNumber): boolean {
        return this.value === other.value;
    }
}

export class Address {
    private constructor(private readonly value: string) {}

    static create(value: string): Address {
        if (!value || value.trim() === "") {
            throw new DomainError("Empty address is not allowed");
        }
        return new Address(value);
    }

    equals(other: Address): boolean {
        return this.value === other.value;
    }
}

export class Id {
    private constructor(private readonly value: string) {}

    static create(): Id {
        return new Id(uuid());
    }

    equals(other: Id): boolean {
        return this.value === other.value;
    }

    isValid(): boolean {
        return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(this.value);
    }
}

export class OrderItem {
    constructor(
        readonly productId: Id, 
        readonly quantity: PositiveNumber, 
        readonly price: PositiveNumber
    ) {}

    equals(other: OrderItem): boolean {
        return (
            this.productId.equals(other.productId) &&
            this.quantity.equals(other.quantity) &&
            this.price.equals(other.price)
        );
    }

    calculateSubtotal(): PositiveNumber {
        return this.price.multiply(this.quantity);
    }
}