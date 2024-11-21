import createHttpError from "http-errors";
import { JwtPayload, sign } from "jsonwebtoken";
import { Repository } from "typeorm";
import { Config } from "../config";
import { User } from "../entity/User";
import { RefreshToken } from "./../entity/RefreshToken";
export class TokenService {
  constructor(readonly refreshTokenRepository: Repository<RefreshToken>) {}

  generateAccessToken(payload: JwtPayload) {
    let privateKey: string;
    if (!Config.PRIVATE_KEY) {
      const error = createHttpError(500, "SECRET_KEY not found");
      throw error;
    }
    try {
      privateKey = Config.PRIVATE_KEY;
    } catch {
      const error = createHttpError(500, "failed to read private key");
      throw error;
    }

    const accessToken = sign(payload, privateKey, {
      algorithm: "RS256",
      expiresIn: "1h",
      issuer: "clotheer-auth-service",
    });
    return accessToken;
  }

  generateRefreshToken(payload: JwtPayload) {
    const refreshToken = sign(payload, Config.REFRESH_TOKEN_SECRET!, {
      algorithm: "HS256",
      expiresIn: "1y",
      issuer: "clotheer-auth-service",
      jwtid: String(payload.id),
    });

    return refreshToken;
  }

  async persistRefreshToken(user: User) {
    const MS_IN_YEAR = 1000 * 60 * 60 * 24 * 365;
    const newRefreshToken = await this.refreshTokenRepository.save({
      user: user,
      expiresAt: new Date(Date.now() + MS_IN_YEAR),
    });

    return newRefreshToken;
  }

  async deleteRefreshToken(tokenId: number) {
    await this.refreshTokenRepository.delete({ id: tokenId });
  }
}
