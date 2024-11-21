import { Request } from "express";
import jwksClient from "jwks-rsa";
import { Config } from "./../config/index";
import { expressjwt, GetVerificationKey } from "express-jwt";
import { AuthCookie } from "../types";

export default expressjwt({
  secret: jwksClient.expressJwtSecret({
    jwksUri: Config.JWKS_URI!,
    cache: true,
    rateLimit: true,
  }) as GetVerificationKey,
  algorithms: ["RS256"],
  getToken(request: Request) {
    const authHeader = request.headers.authorization;
    if (authHeader?.split(" ")[1] !== undefined) {
      const token = authHeader.split(" ")[1];
      return token;
    }

    const { access_token } = request.cookies as AuthCookie;
    return access_token;
  },
});
