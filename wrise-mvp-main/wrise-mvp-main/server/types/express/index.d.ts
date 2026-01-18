// server/types/express/index.d.ts
import "express";

declare global {
  namespace Express {
    interface User {
      id: string;
      googleId: string;
      email: string;
      displayName: string;
      username: string;
      role: string;
      accessToken: string;
      refreshToken?: string;
      imageUrl?: string;
    }
  }
}
