import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppUser } from '../types';
import api from '../lib/axios';

interface AuthContextType {
  user: AppUser | null;
  login: (username: string, password: string) => Promise<boolean>;
  register: (user: AppUser) => Promise<void>;
  }
  return context;
};