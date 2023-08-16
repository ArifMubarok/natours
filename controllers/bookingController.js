const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Booking = require('../models/bookingModel');
const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('../controllers/handlerFactory');

exports.getCheckoutSession = catchAsync(async (request, response, next) => {
  // 1) Get the currently booked tour
  const tour = await Tour.findById(request.params.tourId);

  // 2) Create checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${request.protocol}://${request.get('host')}/?tour=${
      request.params.tourId
    }&user=${request.user.id}&price=${tour.price}`,
    cancel_url: `${request.protocol}://${request.get('host')}/tour/${
      tour.slug
    }`,
    customer_email: request.user.email,
    client_reference_id: request.params.tourId,
    line_items: [
      {
        name: `${tour.name} Tour`,
        description: tour.summary,
        images: [`https://www.natours.dev/img/tours/tour-1-cover.jpg`],
        price: tour.price * 100,
        currency: 'usd',
        quantity: 1,
      },
    ],
  });

  // 3) Create session as response
  response.status(200).json({
    status: 'success',
    session,
  });
});

exports.createBookingCheckout = catchAsync(async (request, response, next) => {
  const { tour, user, price } = request.query;

  if (!tour && !user && !price) return next();
  await Booking.create({ tour, user, price });

  response.redirect('/');
});

exports.getAllBookings = factory.getAll(Booking);
exports.getBooking = factory.getOne(Booking);
exports.createBooking = factory.createOne(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
