const Event = require('../../models/event');
const { transfromEvent } = require('./merge');

module.exports = {
  events: async () => {
    try {
      const events = await Event.find();
      return events.map(event => {
        return transfromEvent(event);
      });
    } catch (err) {
      throw err;
    }
  },
  createEvent: async (
    { eventInput: { title, description, price, date } },
    args,
    req
  ) => {
    if (!req.isAuth) {
      throw new Error('Unauthenticated');
    }
    const event = new Event({
      title: title,
      description: description,
      price: +price,
      date: new Date(date),
      creator: req.userId
    });
    let createdEvent;
    try {
      const result = await event.save();
      createdEvent = transfromEvent(result);
      const creator = await User.findById(req.userId);

      if (!creator) {
        throw new Error('User not found.');
      }
      creator.createdEvents.push(event);
      await creator.save();

      return createdEvent;
    } catch (err) {
      throw err;
    }
  }
};
