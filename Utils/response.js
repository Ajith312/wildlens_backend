export const sendResponse = (res, statusCode, message, data = null, errorCode = null,success) => {
    return res.status(statusCode).json({
      error_code: errorCode || statusCode,
      message,
      data,
      success
    });
  };
  