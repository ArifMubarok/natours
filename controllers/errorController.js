const AppError = require('./../utils/appError');

const handleDuplicateErrorDB = (error) => {
  const { name } = error.keyValue;
  const message = `Duplicate name value: ${name}. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (error) => {
  const errors = Object.values(error.errors).map((element) => element.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleCastErrorDB = (error) => {
  const message = `Invalid ${error.path}: ${error.value}`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError('Invalid token. Please log in again', 401);
const handleJWTExpiredError = () =>
  new AppError('Your token has expired. Please log in again!', 401);

const sendErrorDev = (error, request, response) => {
  if (request.originalUrl.startsWith('/api')) {
    return response.status(error.statusCode).json({
      status: error.status,
      error: error,
      message: error.message,
      stack: error.stack,
    });
  }
  return response.status(error.statusCode).render('error', {
    title: 'Error',
    message: error.message,
  });
};

const sendErrorProd = (error, request, response) => {
  // A) API error
  if (request.originalUrl.startsWith('/api')) {
    // Operational trusted error: send message to clien
    if (error.isOperational) {
      return response.status(error.statusCode).json({
        status: error.status,
        message: error.message,
      });
    }
    // 1) Log Error
    console.error('ERROR 💥');

    // 2) Send generic message
    return response.status(500).json({
      status: 'error',
      message: 'Something went wrong',
    });
  }

  // RENDERED WEBSITE
  if (error.isOperational) {
    return response.status(error.statusCode).render('error', {
      title: 'Error',
      message: error.message,
    });
  }
  // 1) Log Error
  console.error('ERROR 💥');
  // 2) Send generic message
  return response.status(500).render('error', {
    title: 'Error',
    message: 'Something went wrong! Please try again later',
  });
};

module.exports = (error, request, response, next) => {
  // console.log(error.stack);
  error.statusCode = error.statusCode || 500;
  error.status = error.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(error, request, response);
  } else if (process.env.NODE_ENV === 'production') {
    let newError = { ...error };

    if (error.name === 'CastError') newError = handleCastErrorDB(newError);
    if (error.code === 11000) newError = handleDuplicateErrorDB(newError);
    if (error.name === 'ValidationError')
      newError = handleValidationErrorDB(newError);
    if (error.name === 'JsonWebTokenError') newError = handleJWTError();
    if (error.name === 'TokenExpiredError') newError = handleJWTExpiredError();

    sendErrorProd(newError, request, response);
  }
};
