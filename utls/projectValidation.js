const { z } = require("zod");

const MAX_FILE_SIZE = 5000000;
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const projectValidationSchema = z.object({
  name: z.string(),
  // image: z
  //   .any()
  //   .refine(
  //     (files) => files?.[0]?.size <= MAX_FILE_SIZE,
  //     `Max image size is 5MB.`
  //   )
  //   .refine(
  //     (files) => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
  //     "Only .jpg, .jpeg, .png and .webp formats are supported."
  //   ),
  // image: z.string(),
  technologies: z.array(z.string()),
  description: z.string(),
  liveLink: z.string(),
  serverLink: z.string(),
  clientLink: z.string(),
});

const projectValidationMiddleware = (req, res, next) => {
  try {
    // Validate request body against the schema
    projectValidationSchema.parse(req.body);
    next();
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Validation error",
      errors: error.errors,
    });
  }
};

module.exports = projectValidationMiddleware;
