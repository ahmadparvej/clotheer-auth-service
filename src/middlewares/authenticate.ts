import { Request } from "express";
import jwksClient from "jwks-rsa";
import { Config } from "./../config/index";
import { expressjwt, GetVerificationKey } from "express-jwt";
import express from "express";

export default expressjwt({
  secret: jwksClient.expressJwtSecret({
    jwksUri: Config.JWKS_URI!,
    cache: true,
    rateLimit: true,
  }) as GetVerificationKey,
  algorithms: ["RS256"],
  getToken(request: Request) {
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.split(" ")[1] !== undefined) {
      const token = authHeader.split(" ")[1];
      return token;
    }

    type AuthCookie = { accessToken: string };
    const { accessToken } = request.cookies as AuthCookie;
    return accessToken;
  },
}) as express.RequestHandler;
