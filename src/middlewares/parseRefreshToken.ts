import { Request } from "express";
import { expressjwt } from "express-jwt";
import { Config } from "../config";
import { AuthCookie } from "../types";

export default expressjwt({
  secret: Config.REFRESH_TOKEN_SECRET!,
  algorithms: ["HS256"],
  getToken(request: Request) {
    const { refresh_token } = request.cookies as AuthCookie;

    return refresh_token;
  },
});
