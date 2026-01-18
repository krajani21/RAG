import express from 'express';
import passport from 'passport';
import { google } from 'googleapis';
import session from 'express-session';
import prisma from '../lib/prisma';
const router = express.Router();

//redirect to Google for consent
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email', 'https://www.googleapis.com/auth/youtube.readonly']
}));

// Google OAuth callback
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect("http://localhost:8080"); 
  }
);



export default router;
