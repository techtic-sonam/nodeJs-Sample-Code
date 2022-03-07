class Util {
  constructor() {
    this.statusCode = null;
    this.type = null;
    this.data = null;
    this.message = null;
    this.meta = null;
  }

  setSuccess(statusCode, message, data, meta) {
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.meta = meta;
    this.type = "success";
  }

  setError(statusCode, message) {
    this.statusCode = statusCode;
    this.message = message;
    this.type = "error";
  }

  send(res) {
    const result = {
      status: this.type,
      message: this.message,
      data: this.data,
      meta: this.meta
    };

    if (this.type === "success") {
      return res.status(this.statusCode).json(result);
    }
    return res.status(this.statusCode).json({
      status: this.type,
      message: this.message
    });
  }
}
module.exports = Util;
