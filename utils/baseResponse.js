exports.successResponse = (message, data = null) => {
  return {
    statusCode: 0,
    status: "success",
    message,
    data,
  };
};

exports.failResponse = (message, data = null) => {
  return {
    statusCode: 1,
    status: "fail",
    message,
    data,
  };
};
