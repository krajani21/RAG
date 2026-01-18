import "express";

declare global {
  namespace Express {
    interface User {
      id: string;
      accessToken: string;
    }
    interface Request {
      user?: User;
    }
  }
}

export {};