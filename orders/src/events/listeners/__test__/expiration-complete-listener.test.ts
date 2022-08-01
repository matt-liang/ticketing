import { ExpirationCompleteEvent } from "@mlticketing/common";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { Order, OrderStatus } from "../../../models/order";
import { Ticket } from "../../../models/ticket";
import { natsWrapper } from "../../../nats-wrapper";
import { ExpirationCompleteListener } from "../expiration-complete-listener";

const setup = async () => {
  // create an instance of the listener
  const listener = new ExpirationCompleteListener(natsWrapper.client);

  // create and save a ticket
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'title',
    price: 1,
  });
  await ticket.save();

  // create and save an order on the ticket
  const order = Order.build({
    userId: new mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    expiresAt: new Date(),
    ticket,
  });
  await order.save();

  // create a fake expiration completed event
  const data: ExpirationCompleteEvent['data'] = {
    orderId: order.id
  };

  // create a fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  // return 
  return { listener, ticket, order, data, msg };
};

it('updates the order status to be cancelled', async () => {
  const { listener, ticket, order, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const updatedOrder = await Order.findById(order.id);

  // assert that the order status has been cancelled
  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('emits an OrderCancelled event', async () => {
  const { listener, ticket, order, data, msg } = await setup();

  await listener.onMessage(data, msg);

  // assert that the publish function was called
  expect(natsWrapper.client.publish).toHaveBeenCalled();

  const orderCancelledJSON = (natsWrapper.client.publish as jest.Mock).mock.calls[0][1];

  // assert the published event data has the correct order id
  expect(JSON.parse(orderCancelledJSON).id).toEqual(order.id);
});

it("ack the message", async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
