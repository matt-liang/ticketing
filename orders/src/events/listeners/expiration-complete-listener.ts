import { ExpirationCompleteEvent, Listener, Subjects } from "@mlticketing/common";
import { Message } from "node-nats-streaming";
import { Order, OrderStatus } from "../../models/order";
import { OrderCancelledPublisher } from "../publishers/order-cancelled-publisher";
import { queueGroupName } from "./queue-group-name";

export class ExpirationCompleteListener extends Listener<ExpirationCompleteEvent> {
  subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
  queueGroupName = queueGroupName;

  async onMessage(data: ExpirationCompleteEvent['data'], msg: Message) {
    // find the order
    const order = await Order.findById(data.orderId).populate('ticket');

    // if order does not exist throw an error
    if (!order) {
      throw new Error('Order does not exist');
    }

    // if order has been payed for, ack early
    if (order.status === OrderStatus.Complete) {
      return msg.ack();
    }

    // set the order status to cancelled
    order.set({ status: OrderStatus.Cancelled });

    // save the order
    await order.save();

    // publish an event saying order cancelled
    await new OrderCancelledPublisher(this.client).publish({
      id: order.id,
      version: order.version,
      ticket: {
        id: order.ticket.id,
      },
    });

    // ack the message
    msg.ack();
  };
};