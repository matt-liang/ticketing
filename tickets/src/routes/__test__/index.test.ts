import request from 'supertest';
import { app } from '../../app';
import { cookie } from '../../test/utils/test-cookie';

const createTicket = () => {
  return request(app)
    .post('/api/tickets')
    .set('Cookie', cookie())
    .send({
      title: 'title',
      price: 10
    })
    .expect(201);
}

it('can fetch a list of tickets', async () => {
  await createTicket();
  await createTicket();
  await createTicket();

  const response = await request(app)
    .get('/api/tickets')
    .send();

  expect(response.body.length).toEqual(3);
});