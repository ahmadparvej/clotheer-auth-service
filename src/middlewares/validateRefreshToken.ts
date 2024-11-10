import { Request } from "express";
import { expressjwt } from "express-jwt";
import { Config } from "../config";
import { AppDataSource } from "../config/data-source";
import logger from "../config/logger";
import { RefreshToken } from "../entity/RefreshToken";
import { AuthCookie } from "../types";
import { IRefreshToken } from "./../types/index";

export default expressjwt({
  secret: Config.REFRESH_TOKEN_SECRET!,
  algorithms: ["HS256"],
  getToken(request: Request) {
    const { refresh_token } = request.cookies as AuthCookie;

    return refresh_token;
  },
  async isRevoked(request: Request, token) {
    try {
      const refreshTokenRepo = AppDataSource.getRepository(RefreshToken);

      const refreshToken = await refreshTokenRepo.findOne({
        where: {
          id: (token?.payload as IRefreshToken).id,
          user: { id: Number(token?.payload.sub) },
        },
      });

      return refreshToken === null;
    } catch {
      logger.error("error validating refresh token", {
        id: (token?.payload as IRefreshToken).id,
      });
    }
    return true;
  },
});
