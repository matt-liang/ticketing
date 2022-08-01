import { OrderCreatedEvent } from "@mlticketing/common";
import mongoose from "mongoose";
import { natsWrapper } from "../../../nats-wrapper"
import { OrderCreatedListener } from "../order-created-listener"
import { Order, OrderStatus } from "../../../models/order";
import { Message } from "node-nats-streaming";

const setup = async () => {
  // create an instance of listener
  const listener = new OrderCreatedListener(natsWrapper.client);

  // create a fake order created event
  const data: OrderCreatedEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    userId: new mongoose.Types.ObjectId().toHexString(),
    expiresAt: 'expires',
    ticket: {
      id: new mongoose.Types.ObjectId().toHexString(),
      price: 10
    },
  };

  // create a fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  // return 
  return { listener, data, msg };
};

it('replicates the order', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const order = await Order.findById(data.id);

  // assert the order price is equal to event's ticket price
  expect(order!.price).toEqual(data.ticket.price);
});

it('acks the message', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});