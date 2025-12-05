import { Request, Response } from 'express';
import prisma from '../db';

// Get all settings
export const getSettings = async (req: Request, res: Response) => {
  try {
    const settings = await prisma.systemSettings.findMany();
    
    // Transform to object format
    const settingsObj: Record<string, any> = {};
    settings.forEach(setting => {
      settingsObj[setting.category] = setting.settings;
    });

    res.json(settingsObj);
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
};

// Get settings by category
export const getSettingsByCategory = async (req: Request, res: Response) => {
  try {
    const { category } = req.params;

    const setting = await prisma.systemSettings.findUnique({
      where: { category }
    });

    if (!setting) {
      return res.status(404).json({ error: 'Settings category not found' });
    }

    res.json(setting.settings);
  } catch (error) {
    console.error('Get settings by category error:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
};

// Update settings by category
export const updateSettings = async (req: Request, res: Response) => {
  try {
    const { category } = req.params;
    const { settings } = req.body;
    const currentUser = (req as any).user;

    if (!settings) {
      return res.status(400).json({ error: 'Settings data is required' });
    }

    // Upsert settings
    const updatedSetting = await prisma.systemSettings.upsert({
      where: { category },
      update: {
        settings,
        updatedBy: currentUser?.id
      },
      create: {
        category,
        settings,
        updatedBy: currentUser?.id
      }
    });

    res.json(updatedSetting);
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
};
