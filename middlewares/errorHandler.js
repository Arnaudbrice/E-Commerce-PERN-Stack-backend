import {
  ValidationError,
  UniqueConstraintError,
  DatabaseError,
} from "sequelize";
const errorHandler = (error, req, res, next) => {
  // check if the response header has already been sent, if yes, delegate to the next error-handling middleware
  if (res.headersSent) {
    return next(error);
  }

  // Handle duplicate database entries (e.g., unique email/username violations)
  if (error instanceof UniqueConstraintError) {
    return res.status(409).json({ message: "Duplicate entry" });
  }

  // Handle Sequelize schema validation failures (e.g., missing fields, wrong formats)
  if (error instanceof ValidationError) {
    return res
      .status(400)
      .json({ message: error.errors.map((e) => e.message).join(", ") });
  }

  const statusCode = error.cause || 500; // Use the 'cause' for status code, default to 500
  const message = error.message || "Something went wrong!";

  // For JWT errors, ensure a consistent message
  if (
    error.name === "TokenExpiredError" ||
    error.name === "JsonWebTokenError"
  ) {
    return res.status(401).json({ message: "Not Authenticated" });
  }

  res.status(statusCode).json({ message });
};

export default errorHandler;
