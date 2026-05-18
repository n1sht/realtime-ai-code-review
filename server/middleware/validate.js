const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const errors = result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`);
    return res.status(400).json({ error: "Validation failed", details: errors });
  }
  req.body = result.data;
  next();
};

export default validate;
