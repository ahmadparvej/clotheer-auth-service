import { NextFunction, Response } from "express";
import { validationResult } from "express-validator";
import { JwtPayload } from "jsonwebtoken";
import { Logger } from "winston";
import { Roles } from "./../constants/index";
import { TokenService } from "./../services/TokenService";
import { UserService } from "./../services/UserService";
import { RegisterUserRequest, AuthRequest } from "./../types/index";
import createHttpError from "http-errors";
export class AuthController {
  constructor(
    private userService: UserService,
    private logger: Logger,
    private tokenService: TokenService,
  ) {}

  async register(req: RegisterUserRequest, res: Response, next: NextFunction) {
    // validation
    const result = validationResult(req);
    if (!result.isEmpty()) {
      res.status(400).json({ errors: result.array() });
      return;
    }

    const { firstName, lastName, email, password } = req.body;

    this.logger.debug("registering user", {
      email,
      firstName,
      lastName,
      password: "*****",
    });

    try {
      const user = await this.userService.create({
        firstName,
        lastName,
        email,
        password,
        role: Roles.CUSTOMER,
      });
      this.logger.info("user created successfully", { id: user.id });

      const payload: JwtPayload = {
        sub: String(user.id),
        role: user.role,
      };

      const accessToken = this.tokenService.generateAccessToken(payload);

      // Persist the refresh token in database
      const newRefreshToken = await this.tokenService.persistRefreshToken(user);

      const refreshToken = this.tokenService.generateRefreshToken({
        ...payload,
        id: newRefreshToken.id,
      });

      res.cookie("access_token", accessToken, {
        domain: "localhost",
        sameSite: "strict",
        maxAge: 1000 * 60 * 60,
        httpOnly: true,
      });
      res.cookie("refresh_token", refreshToken, {
        domain: "localhost",
        sameSite: "strict",
        maxAge: 1000 * 60 * 60 * 24 * 365,
        httpOnly: true,
      });

      res.status(200).json({ id: user.id });
    } catch (error) {
      next(error);
      return;
    }
  }

  async login(req: RegisterUserRequest, res: Response, next: NextFunction) {
    // validation
    const result = validationResult(req);
    if (!result.isEmpty()) {
      res.status(400).json({ errors: result.array() });
      return;
    }

    const { email, password } = req.body;

    this.logger.debug("logging in user", {
      email,
      password: "*****",
    });

    /** Check if username (email) exists in database
     * compare password
     * generate access token
     * add access token to cookie
     * return the response id
     */
    try {
      const user = await this.userService.login({ email, password });

      this.logger.info("user logged in successfully", { id: user.id });

      const payload: JwtPayload = {
        sub: String(user.id),
        role: user.role,
      };

      const accessToken = this.tokenService.generateAccessToken(payload);

      // Persist the refresh token in database
      const newRefreshToken = await this.tokenService.persistRefreshToken(user);

      const refreshToken = this.tokenService.generateRefreshToken({
        ...payload,
        id: newRefreshToken.id,
      });

      res.cookie("access_token", accessToken, {
        domain: "localhost",
        sameSite: "strict",
        maxAge: 1000 * 60 * 60,
        httpOnly: true,
      });
      res.cookie("refresh_token", refreshToken, {
        domain: "localhost",
        sameSite: "strict",
        maxAge: 1000 * 60 * 60 * 24 * 365,
        httpOnly: true,
      });

      res.status(200).send({ userId: user.id });
      return;
    } catch (error) {
      next(error);
      return;
    }
  }

  async self(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await this.userService.findById(Number(req.auth.sub));
      res.json({ ...user, password: undefined });
    } catch (error) {
      next(error);
      return;
    }
  }

  async refresh(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const payload: JwtPayload = {
        sub: String(req.auth.sub),
        role: req.auth.role,
      };

      const user = await this.userService.findById(Number(payload.sub));

      if (!user) {
        const err = createHttpError(401, "User not found");
        next(err);
        return;
      }

      const accessToken = this.tokenService.generateAccessToken(payload);

      // Persist the refresh token in database
      const newRefreshToken = await this.tokenService.persistRefreshToken(user);

      // Delete the old refresh token
      await this.tokenService.deleteRefreshToken(Number(req.auth.id));

      const refreshToken = this.tokenService.generateRefreshToken({
        ...payload,
        id: newRefreshToken.id,
      });

      res.cookie("access_token", accessToken, {
        domain: "localhost",
        sameSite: "strict",
        maxAge: 1000 * 60 * 60,
        httpOnly: true,
      });
      res.cookie("refresh_token", refreshToken, {
        domain: "localhost",
        sameSite: "strict",
        maxAge: 1000 * 60 * 60 * 24 * 365,
        httpOnly: true,
      });

      res.status(200).json({ id: user.id });
    } catch (error) {
      next(error);
      return;
    }
  }
}
