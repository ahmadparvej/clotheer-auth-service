import { checkSchema } from "express-validator";

export default checkSchema(
  {
    page: {
      customSanitizer: {
        options: (value: string) => {
          const parsedValue = parseInt(value);
          return isNaN(parsedValue) ? 1 : parsedValue;
        },
      },
    },
    limit: {
      customSanitizer: {
        options: (value: string) => {
          const parsedValue = parseInt(value);
          return isNaN(parsedValue) ? 6 : parsedValue;
        },
      },
    },
  },
  ["query"],
);
