const errorHandler = (err, req, res, next) => {
  if (err.name == "UnauthorizedError") {
    return res.status(500).send({ message: "User not authorized" });
  }
  if (err.name == "ValidationError") {
    return res.status(500).send({ message: "Not Valid Type" });
  }
  return res.status(500).send("Internal Server Error");
};

module.exports = errorHandler;
