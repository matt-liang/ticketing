import { Ticket } from "../ticket";

it('implements optimistic concurrency control', async () => {
  // create an instance of the ticket
  const ticket = Ticket.build({
    title: 'title',
    price: 1,
    userId: '123'
  });

  // save the ticket to the database
  await ticket.save();

  // fetch the ticket twice
  const firstInstance = await Ticket.findById(ticket.id);
  const secondInstance = await Ticket.findById(ticket.id);

  // make two separate changes to the ticket we fetch
  firstInstance!.set({ price: 2 });
  secondInstance!.set({ price: 3 });

  // save the first fetched ticket
  await firstInstance!.save();

  // save the second fetched ticket and expect an error
  try {
    await secondInstance!.save();
  } catch (err) {
    return;
  }

  // assert that saving the second instance should throw an error
  throw new Error('Should not reach this point');
});

it('increments the version number on multiple saves', async () => {
  const ticket = Ticket.build({
    title: 'title',
    price: 1,
    userId: '123'
  });

  await ticket.save();
  expect(ticket.version).toEqual(0);
  await ticket.save();
  expect(ticket.version).toEqual(1);
  await ticket.save();
  expect(ticket.version).toEqual(2);
});