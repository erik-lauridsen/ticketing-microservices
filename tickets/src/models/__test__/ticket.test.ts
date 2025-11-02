import { Ticket } from "../ticket";


it('implements optimistic concurrency control', async () => {
  //create a ticket
  const ticket = Ticket.build({
    title: 'tickettt',
    price: 5,
    userId: '123'
  });
  //save the ticket to the database
  await ticket.save();
  //fetch the ticket twice
  const firstInstance = await Ticket.findById(ticket.id);
  const secondInstance = await Ticket.findById(ticket.id);
  //make two separate changes to the tickets we fetched
  firstInstance!.set({price: 10});
  secondInstance!.set({price: 15});
  //save the first fetched ticket
  await firstInstance!.save();
  //save the second fetched ticker and expect an error
  await expect(secondInstance!.save()).rejects.toThrow();

})

it('increments the version number on multiple saves', async () => {
    const ticket = Ticket.build({
    title: 'tickettt',
    price: 5,
    userId: '123'
  });
  //save the ticket to the database
  await ticket.save();
  expect(ticket.version).toEqual(0);
  await ticket.save();
  expect(ticket.version).toEqual(1);
  await ticket.save();
  expect(ticket.version).toEqual(2);

})