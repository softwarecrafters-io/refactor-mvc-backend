import { Order } from "./order";
import { Id } from "./valueObjects";

export interface OrderRepository {
    findAll(): Promise<Order[]>;
    findById(id: Id): Promise<Order | undefined>;
    save(order: Order): Promise<void>;
    delete(order: Order): Promise<void>;
}