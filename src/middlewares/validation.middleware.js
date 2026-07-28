export const validate = (schema) => {
  return (req, res, next) => {
    const parsed = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (!parsed.success) {
      const errors = parsed.error.errors.map((e) => ({
        path: e.path.join("."),
        message: e.message,
      }));
      throw new (require("../utils/apiError.js").ApiError)(
        400,
        errors.map((e) => e.message).join(", ")
      );
    }

    req.body = parsed.data.body || req.body;
    req.query = parsed.data.query || req.query;
    req.params = parsed.data.params || req.params;
    next();
  };
};
