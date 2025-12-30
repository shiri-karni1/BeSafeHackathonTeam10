class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // Marks error as a known operational error (not a bug)
  }
}

export default AppError;
