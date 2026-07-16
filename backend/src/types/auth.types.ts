export interface AccessTokenPayload {
  sub: string; // user id
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AccessTokenPayload;
    }
  }
}

export {};