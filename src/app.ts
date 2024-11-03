import express from "express";

const app = express();

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// app.use((err: HttpError, req: Request, res: Response) => {
//   logger.error(err.message);
//   const statusCode = err.statusCode;

//   res.status(statusCode).json({
//     errors: [
//       {
//         message: err.message,
//         type: err.name,
//         location: "",
//       },
//     ],
//   });
// });

export default app;
