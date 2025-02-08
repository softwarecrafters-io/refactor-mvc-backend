import { Address, Id, PositiveNumber } from "../../domain/valueObjects";

describe("A positive number", () => {
    it("allows a given positive value", () => {
        const positiveNumber = PositiveNumber.create(1);
        expect(positiveNumber).toEqual(PositiveNumber.create(1));
    });

    it("does not allow negative values", () => {
        expect(() => PositiveNumber.create(-1)).toThrow("Value must be positive");
    });

    it("multiplies two given positive numbers", () => {
        const two = PositiveNumber.create(2);
        const three = PositiveNumber.create(3);
        
        expect(two.multiply(three)).toEqual(PositiveNumber.create(6));
    });
});

describe("An address", () => {
    it("allows a given valid address", () => {
        const address = Address.create("123 Main St");
        expect(address).toEqual(Address.create("123 Main St"));
    });

    it("does not allow an empty address", () => {
        expect(() => Address.create("")).toThrow("Empty address is not allowed");
        expect(() => Address.create("     ")).toThrow("Empty address is not allowed");
    });
});

describe("An id", () => {
    it("generates a valid unique identifier", () => {
        const id = Id.create();
        expect(id.isValid()).toBe(true);
    });
});
