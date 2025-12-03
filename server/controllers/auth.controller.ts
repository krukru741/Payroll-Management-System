import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../db';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({ token, user: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const { username, password, email, name, role } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        email,
        name,
        role: role || 'EMPLOYEE',
      },
    });

    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const me = async (req: Request, res: Response) => {
  try {
    // @ts-ignore - userId added by middleware
    const userId = req.user?.userId;
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { employee: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
