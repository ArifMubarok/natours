const catchAsync = require('../utils/catchAsync');
const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const Booking = require('../models/bookingModel');

exports.getOverview = catchAsync(async (request, response, next) => {
  const tours = await Tour.find();

  response.status(200).render('overview', {
    title: 'Overview',
    tours,
  });
});

exports.getTour = catchAsync(async (request, response, next) => {
  const { slug } = request.params;
  const tour = await Tour.findOne({ slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });

  if (!tour) return next(new AppError('No tour found', 404));

  response.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour,
  });
});

exports.getLoginForm = (request, response, next) => {
  response.status(200).render('login', {
    title: 'Log into your account',
  });
};

exports.getAccount = (request, response, next) => {
  response.status(200).render('account', {
    title: 'Your account',
  });
};

exports.updateUserData = catchAsync(async (request, response, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    request.user.id,
    {
      name: request.body.name,
      email: request.body.email,
    },
    {
      new: true,
      runValidators: true,
    },
  );

  response.redirect('/me');
});

exports.getMyTours = catchAsync(async (request, response, next) => {
  const bookings = await Booking.find({ user: request.user.id });

  const tourIDs = bookings.map((booking) => booking.tour);
  const tours = await Tour.find({ _id: { $in: tourIDs } });

  response.status(200).render('overview', {
    title: 'My tours',
    tours,
  });
});
