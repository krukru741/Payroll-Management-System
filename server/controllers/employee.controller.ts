import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getEmployees = async (req: Request, res: Response) => {
  try {
    const employees = await prisma.employee.findMany({
      orderBy: { lastName: 'asc' },
      include: {
        user: {
          select: {
            email: true,
            username: true,
            role: true
          }
        }
      }
    });
    res.json(employees);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
};

export const getEmployee = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const employee = await prisma.employee.findUnique({
      where: { id },
      include: {
        user: true,
        documents: true,
        loans: true
      }
    });

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json(employee);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch employee' });
  }
};

export const createEmployee = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    
    // Check if email already exists
    const existing = await prisma.employee.findUnique({
      where: { email: data.email }
    });

    if (existing) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const employee = await prisma.employee.create({
      data: {
        ...data,
        birthDate: new Date(data.birthDate),
        dateHired: new Date(data.dateHired),
        basicSalary: parseFloat(data.basicSalary),
        // Handle other potential date/number conversions
      }
    });

    res.status(201).json(employee);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create employee' });
  }
};

export const updateEmployee = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;

    // Remove fields that shouldn't be updated directly or handle conversions
    if (data.birthDate) data.birthDate = new Date(data.birthDate);
    if (data.dateHired) data.dateHired = new Date(data.dateHired);
    if (data.dateResigned) data.dateResigned = new Date(data.dateResigned);
    if (data.basicSalary) data.basicSalary = parseFloat(data.basicSalary);

    const employee = await prisma.employee.update({
      where: { id },
      data
    });

    res.json(employee);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update employee' });
  }
};

export const deleteEmployee = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Soft delete or hard delete? Design says DELETE route, but status exists.
    // Let's do soft delete by setting status to TERMINATED or INACTIVE if preferred, 
    // but standard DELETE usually implies removal. 
    // Given the constraints and relations, hard delete might fail if there are payrolls.
    // Let's try hard delete, if it fails, user should know.
    
    await prisma.employee.delete({
      where: { id }
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete employee. They may have associated records.' });
  }
};
