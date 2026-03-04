import { Order } from "./types";
import { mockOrders } from "./mock-data";

const orders: Order[] = [...mockOrders];

export function getAllOrders(): Order[] {
  return orders.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getOrderById(id: string): Order | undefined {
  return orders.find((o) => o.id === id);
}

export function addOrder(order: Order): Order {
  orders.unshift(order);
  return order;
}
