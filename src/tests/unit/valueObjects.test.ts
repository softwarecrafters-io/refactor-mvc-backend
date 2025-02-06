import { Address, PositiveNumber } from "../../domain/valueObjects";

describe("A positive number", () => {
    it("allows a given positive value", () => {
        const positiveNumber = PositiveNumber.create(1);
        expect(positiveNumber.value).toBe(1);
    });

    it("does not allow negative values", () => {
        expect(() => PositiveNumber.create(-1)).toThrow("Value must be positive");
    });
});

describe("An address", () => {
    it("allows a given valid address", () => {
        const address = Address.create("123 Main St");
        expect(address.value).toBe("123 Main St");
    });

    it("does not allow an empty address", () => {
        expect(() => Address.create("")).toThrow("Empty address is not allowed");
        expect(() => Address.create("     ")).toThrow("Empty address is not allowed");
    });
});
