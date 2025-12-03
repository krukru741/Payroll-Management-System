import React, { createContext, useContext, useState, useEffect } from 'react';
import { Employee } from '../types';
import api from '../lib/axios';
import { useAuth } from './AuthContext';

interface DataContextType {
  employees: Employee[];
  addEmployee: (employee: Employee) => Promise<void>;
  updateEmployee: (employee: Employee) => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;
  getEmployeeById: (id: string) => Employee | undefined;
  loading: boolean;
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  // Transform flat database fields to nested Employee structure
  const transformEmployee = (dbEmployee: any): Employee => {
    return {
      ...dbEmployee,
      governmentIds: {
        sss: dbEmployee.sssNo || '',
        philHealth: dbEmployee.philHealthNo || '',
        pagIbig: dbEmployee.pagIbigNo || '',
        tin: dbEmployee.tinNo || ''
      },
      emergencyContact: {
        fullName: dbEmployee.ecFullName || '',
        contactNumber: dbEmployee.ecContactNo || '',
        relationship: dbEmployee.ecRelation || ''
      }
    };
  };

  const fetchEmployees = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    
    try {
      const response = await api.get('/employees');
      const transformedEmployees = response.data.map(transformEmployee);
      setEmployees(transformedEmployees);
    } catch (error) {
      console.error('Failed to fetch employees', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [isAuthenticated]);

  const addEmployee = async (employee: Employee) => {
    try {
      const response = await api.post('/employees', employee);
      const transformedEmployee = transformEmployee(response.data);
      setEmployees(prev => [...prev, transformedEmployee]);
    } catch (error) {
      console.error('Failed to add employee', error);
      throw error;
    }
  };

  const updateEmployee = async (updatedEmployee: Employee) => {
    try {
      // Remove nested objects and send only flat fields to backend
      const { governmentIds, emergencyContact, ...flatEmployee } = updatedEmployee;
      
      const response = await api.put(`/employees/${updatedEmployee.id}`, flatEmployee);
      const transformedEmployee = transformEmployee(response.data);
      setEmployees(prev => prev.map(emp => 
        emp.id === updatedEmployee.id ? transformedEmployee : emp
      ));
    } catch (error) {
      console.error('Failed to update employee', error);
      throw error;
    }
  };

  const deleteEmployee = async (id: string) => {
    try {
      await api.delete(`/employees/${id}`);
      setEmployees(prev => prev.filter(emp => emp.id !== id));
    } catch (error) {
      console.error('Failed to delete employee', error);
      throw error;
    }
  };

  const getEmployeeById = (id: string) => {
    return employees.find(emp => emp.id === id);
  };

  return (
    <DataContext.Provider value={{ 
      employees, 
      addEmployee, 
      updateEmployee, 
      deleteEmployee, 
      getEmployeeById,
      loading,
      refreshData: fetchEmployees
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};