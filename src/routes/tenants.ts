import express from "express";

const tenantsRouter = express.Router();

tenantsRouter.post("/", (req, res) => {
  res.status(201).send("tenants");
});

export default tenantsRouter;
