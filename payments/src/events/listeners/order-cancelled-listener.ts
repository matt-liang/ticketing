import { Listener, OrderCancelledEvent, Subjects } from "@mlticketing/common";
import { Message } from "node-nats-streaming";
import { Order, OrderStatus } from "../../models/order";
import { queueGroupName } from "./queue-group-name";

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
    // find the order
    const order = await Order.findByEvent(data);

    // throw an error if order is not found
    if (!order) {
      throw new Error('Order not found');
    }

    // update the order's status
    order.set({ status: OrderStatus.Cancelled })
    await order.save();

    // ack the message
    msg.ack();
  };
};