import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Order, OrderStatus } from '../../models/order';
import { Ticket } from '../../models/ticket';
import { cookie } from '../../test/utils/test-cookie';
import { natsWrapper } from '../../nats-wrapper';

it('marks an order as cancelled', async () => {
  // create a ticket
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'title',
    price: 10
  });
  await ticket.save();

  const testCookie = cookie();
  // create an order with the ticket
  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', testCookie)
    .send({ ticketId: ticket.id })
    .expect(201);

  // find the order and ensure the status is created
  const createdOrder = await Order.findById(order.id);
  expect(createdOrder!.status).toEqual(OrderStatus.Created);

  // cancel the order
  await request(app)
    .patch(`/api/orders/${order.id}`)
    .set('Cookie', testCookie)
    .expect(200);

  // find the order and ensure the status is cancelled
  const updatedOrder = await Order.findById(order.id);
  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('emits a order cancelled event', async () => {
  // create a ticket
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'title',
    price: 10
  });
  await ticket.save();

  const testCookie = cookie();
  // create an order with the ticket
  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', testCookie)
    .send({ ticketId: ticket.id })
    .expect(201);

  // find the order and ensure the status is created
  const createdOrder = await Order.findById(order.id);
  expect(createdOrder!.status).toEqual(OrderStatus.Created);

  // cancel the order
  await request(app)
    .patch(`/api/orders/${order.id}`)
    .set('Cookie', testCookie)
    .expect(200);

  expect(natsWrapper.client.publish).toHaveBeenCalledTimes(2);
});