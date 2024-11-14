import { checkSchema } from "express-validator";

export default checkSchema({
  name: {
    errorMessage: "name is required",
    notEmpty: true,
  },
  address: {
    errorMessage: "address is required",
    notEmpty: true,
  },
});