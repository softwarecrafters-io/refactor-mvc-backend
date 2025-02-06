import { DomainError } from "./domainError";

export class PositiveNumber {
    private constructor(readonly value: number) {}

    static create(value: number): PositiveNumber {
        if (value <= 0) {
            throw new DomainError("Value must be positive");
        }
        return new PositiveNumber(value);
    }
}

export class Address {
    private constructor(readonly value: string) {}

    static create(value: string): Address {
        if (!value || value.trim() === "") {
            throw new DomainError("Empty address is not allowed");
        }
        return new Address(value);
    }
}