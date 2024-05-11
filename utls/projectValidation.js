const { z } = require("zod");

const MAX_FILE_SIZE = 5000000;
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const projectValidationSchema = z.object({
  name: z.string().required,
  image: z
    .any()
    .refine(
      (files) => files?.[0]?.size <= MAX_FILE_SIZE,
      `Max image size is 5MB.`
    )
    .refine(
      (files) => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
      "Only .jpg, .jpeg, .png and .webp formats are supported."
    ),
  technologies: z.string().array(),
  description: z.string().required,
  liveLink: z.string(),
  serverLink: z.string(),
  clientLink: z.string(),
});

module.exports = projectValidationSchema;
