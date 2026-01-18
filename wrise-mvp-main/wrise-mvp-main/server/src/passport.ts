// import passport from "passport";
// import { Strategy as GoogleStrategy } from "passport-google-oauth20";
// import  prisma  from "./lib/prisma";

// const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
// const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;

// // Serialize the user (for session)
// passport.serializeUser((user, done) => {
//   done(null, user);
// });

// // Deserialize the user (from session)
// passport.deserializeUser((obj: any, done) => {
//   done(null, obj);
// });

// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: GOOGLE_CLIENT_ID,
//       clientSecret: GOOGLE_CLIENT_SECRET,
//       callbackURL: "http://localhost:5000/auth/google/callback",
//       scope: [
//         "profile",
//         "email",
//         // YouTube Data v3 scopes
//         "https://www.googleapis.com/auth/youtube.readonly",
//         "https://www.googleapis.com/auth/youtube.force-ssl",
//       ],
//       // To force Google to show the consent screen again, add 'prompt=consent' as a query param in your authentication route.
//     },
//     async (accessToken, refreshToken, profile, done) => {
//       try {
//         const email = profile.emails?.[0].value;
//         const googleId = profile.id;

//         if (!email || !googleId) {
//           return done(new Error("Missing email or Google ID"), false);
//         }

//         const existingUser = await prisma.user.findUnique({
//           where: { googleId },
//         });

//         const username = profile.displayName?.toLowerCase().replace(/\s+/g, "") + Math.floor(Math.random() * 1000);

//         if (existingUser) {
//           const updatedUser = await prisma.user.update({
//             where: { googleId },
//             data: {
//               accessToken,
//               refreshToken,
//               displayName: profile.displayName,
//               email,
//               imageUrl: profile.photos?.[0].value,
//             },
//           });
//           return done(null, updatedUser);
//         } else {
//           const newUser = await prisma.user.create({
//             data: {
//               googleId,
//               accessToken,
//               refreshToken,
//               displayName: profile.displayName,
//               email,
//               imageUrl: profile.photos?.[0].value,
//               username,
//               role: "creator", 
//             },
//           });
//           return done(null, newUser);
//         }
//       } catch (err) {
//         return done(err, false);
//       }
//     }
//   )
// );
