import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

interface DecodedToken {
  userId: string;
}

const tokenVerify = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1] || req.cookies?.token;
  if (!token) return res.status(401).json({ error: "Please log in to perform this action" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
    (req as any).userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ error: "Please log in to perform this action" });
  }
};
export default tokenVerify;
