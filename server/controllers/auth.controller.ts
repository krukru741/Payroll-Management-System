import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../db';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    
    console.log('Attempting login for:', username);
    const user = await prisma.user.findUnique({
      where: { username },
    });
    console.log('User found:', user ? 'yes' : 'no');

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
    console.error('Login error details:', error);
    res.status(500).json({ error: 'Internal server error', details: String(error) });
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const { username, password, email, name, role, employeeData } = req.body;

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

    if (employeeData) {
        // Check if employee email exists
        const existingEmployee = await prisma.employee.findUnique({
            where: { email: employeeData.email }
        });
        if (existingEmployee) {
            return res.status(400).json({ error: 'Employee email already exists' });
        }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await prisma.$transaction(async (prisma) => {
        let newEmployee = null;

        if (employeeData) {
            // Extract nested objects
            const { governmentIds, emergencyContact, ...restEmployeeData } = employeeData;

            newEmployee = await prisma.employee.create({
                data: {
                    ...restEmployeeData,
                    birthDate: new Date(restEmployeeData.birthDate),
                    dateHired: new Date(restEmployeeData.dateHired),
                    basicSalary: parseFloat(restEmployeeData.basicSalary),
                    
                    // Map Government IDs
                    sssNo: governmentIds?.sss,
                    philHealthNo: governmentIds?.philHealth,
                    pagIbigNo: governmentIds?.pagIbig,
                    tinNo: governmentIds?.tin,

                    // Map Emergency Contact
                    ecFullName: emergencyContact?.fullName,
                    ecContactNo: emergencyContact?.contactNumber,
                    ecRelation: emergencyContact?.relationship,
                }
            });
        }

        const user = await prisma.user.create({
            data: {
                id: req.body.id, // Allow client-generated ID if provided
                username,
                password: hashedPassword,
                email,
                name,
                role: role || 'EMPLOYEE',
                employeeId: newEmployee?.id,
                avatarUrl: newEmployee?.avatarUrl
            },
        });

        return user;
    });

    const { password: _, ...userWithoutPassword } = result;
    res.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error', details: String(error) });
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
