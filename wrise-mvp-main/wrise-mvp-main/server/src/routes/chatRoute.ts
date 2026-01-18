// server/src/routes/chatRoute.ts
import express from "express";
import chatHandler from "../controllers/chatController"; 
import requireFanAccess from "../middleware/requireFanAccess";

const router = express.Router();

router.get("/chat/:creatorId", chatHandler);

router.post("/chat", requireFanAccess, chatHandler);
export default router;




// Public route
// router.get("/chat/:id", (req, res) => {
//     const userId = req.params.id;
//     res.redirect(`https://clonark.onrender.com/api/chat/${userId}`);
// });
