import express from "express";
import fileUpload from "express-fileupload";
import cors from "cors";
import session from "cookie-session";
import passport from "passport";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

import fileRoutes from "./routes/fileRoute";
import authRoutes from "./routes/auth";     
import storeAccessToken from "./routes/storeAcessToken";            
import "./passport";                                      
import instagramRoute from './routes/instagramRoute';
import askRoute from './routes/askRoute';
import RoutesYoutube from "./routes/routesYoutube";
import chatRoute from './routes/chatRoute';
import stripeRoutes from "./routes/stripeRoutes";
import subscriptionRoute from "./routes/subsciptionRoutes";

dotenv.config();

const app = express();

// --- Middleware ---
app.use(cors({
  origin: "https://clonark.com", // frontend domain
  credentials: true,
  exposedHeaders: ['Content-Disposition'],
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization", "x-user-id"]
}));

// Parse JSON except for webhook
app.use((req, res, next) => {
  if (req.originalUrl === "/api/webhook" || req.originalUrl === "/api/webhook/") {
    next();
  } else {
    express.json()(req, res, next);
  }
});

app.use(fileUpload());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET || "supersecret",
  secure: process.env.NODE_ENV === "production", 
  httpOnly: true,
  sameSite: "none",
  maxAge: 24 * 60 * 60 * 1000,
}));

app.use(passport.initialize());
app.use(passport.session());

// --- API Routes ---

app.use("/api", storeAccessToken);
app.use("/api/files", fileRoutes);
app.use("/api", RoutesYoutube);
app.use("/auth", authRoutes);                             
app.use("/api", stripeRoutes);
app.use('/api/instagram', instagramRoute);
app.use("/api", askRoute);
app.use("/api", subscriptionRoute);
app.use("/api", chatRoute);

// --- Root Route ---
app.get('/', (req, res) => {
  res.send('API is running!');
});

// --- Serve Frontend (React) ---
const clientBuildPath = path.join(__dirname, '../client/build');
if (fs.existsSync(clientBuildPath)) {
  app.use(express.static(clientBuildPath));

  // Only serve index.html for routes NOT starting with /api or /auth
  app.get(/^\/(?!api|auth).*/, (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

// --- Start server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
