import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/apiResponse";
import { AppError } from "../utils/AppError";
import { authService } from "../services/auth.service";
import { env } from "../config/env";

const REFRESH_COOKIE = "rt";

function setRefreshCookie(res: Response, token: string) {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: env.JWT_REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000,
    path: "/api/auth",
  });
}

export const authController = {
  register: asyncHandler(async (req: Request, res: Response) => {
    const { accessToken, refreshToken, user } = await authService.register(req.body);
    setRefreshCookie(res, refreshToken);
    return sendSuccess(res, { accessToken, user }, "Account created", 201);
  }),

  login: asyncHandler(async (req: Request, res: Response) => {
    const { accessToken, refreshToken, user } = await authService.login(req.body, {
      userAgent: req.headers["user-agent"],
      ipAddress: req.ip,
    });
    setRefreshCookie(res, refreshToken);
    return sendSuccess(res, { accessToken, user }, "Logged in");
  }),

  refresh: asyncHandler(async (req: Request, res: Response) => {
    const token = req.cookies?.[REFRESH_COOKIE];
    if (!token) {
      throw new AppError("Missing refresh token", 401);
    }

    const { accessToken, refreshToken, user } = await authService.refresh(token);
    setRefreshCookie(res, refreshToken);
    return sendSuccess(res, { accessToken, user }, "Token refreshed");
  }),

  logout: asyncHandler(async (req: Request, res: Response) => {
    const token = req.cookies?.[REFRESH_COOKIE];
    if (token) {
      await authService.logout(token);
    }
    res.clearCookie(REFRESH_COOKIE, { path: "/api/auth" });
    return sendSuccess(res, null, "Logged out");
  }),

  me: asyncHandler(async (req: Request, res: Response) => {
    const user = await authService.me(req.user!.sub);
    return sendSuccess(res, user);
  }),
};