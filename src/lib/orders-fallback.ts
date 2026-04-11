import type { Order } from "@/lib/types";
import { mockOrders } from "../../hexa-platform-api/src/lib/mock-data";

/** Same dataset as `hexa-platform-api` when the standalone API is not running. */
export const ordersFallback: Order[] = mockOrders as Order[];
