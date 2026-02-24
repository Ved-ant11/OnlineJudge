import { Router, Request, Response } from "express";
import prisma from "../db/client";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';

const router = Router();

router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;
    if(!username || !email || !password) return res.status(400).json({ error: 'Missing required fields' });
    if(password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    if(username.length < 3) return res.status(400).json({ error: 'Username must be at least 3 characters long' });
    if(username.length > 20) return res.status(400).json({ error: 'Username must be at most 20 characters long' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const Email = await prisma.user.findUnique(
      { where: {email} }
    );
    if (!Email) {
      const user = await prisma.user.create({
        data: {
          username,
          email,
          password: hashedPassword,
        },
      });
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {expiresIn: "7d"});
      res.status(201).json({ token, username: user.username });
    } else {
      res.status(409).json({ error: "User with this email exists" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {expiresIn: "7d"});
    res.status(200).json({ token, username: user.username });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;