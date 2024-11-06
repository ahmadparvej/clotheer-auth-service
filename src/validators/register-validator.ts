import { checkSchema } from "express-validator";

export default checkSchema({
  email: {
    errorMessage: "email is required",
    notEmpty: true,
    trim: true,
    isEmail: true,
  },
  firstName: {
    errorMessage: "first name is required",
    notEmpty: true,
  },
  lastName: {
    errorMessage: "last name is required",
    notEmpty: true,
    optional: true,
  },
  password: {
    errorMessage: "password is required",
    notEmpty: true,
    isLength: {
      errorMessage: "password must be at least 8 characters",
      options: { min: 8 },
    },
  },
});
