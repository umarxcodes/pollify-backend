// Centralized success/failure response formatter
class Response {
  static success(statusCode, data, message = "Operation successful") {
    const response = {
      success: true,
      statusCode,
      message,
      data,
    };
    return response;
  }

  static fail(statusCode, errors, message = "Operation failed") {
    const response = {
      success: false,
      statusCode,
      message,
      errors,
    };
    return response;
  }
}

export { Response };
