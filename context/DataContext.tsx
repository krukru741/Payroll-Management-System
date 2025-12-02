import React, { createContext, useContext, useState, useEffect } from 'react';
import { Employee } from '../types';

interface DataContextType {
  employees: Employee[];
  addEmployee: (employee: Employee) => void;
  updateEmployee: (employee: Employee) => void;
  deleteEmployee: (id: string) => void;
  getEmployeeById: (id: string) => Employee | undefined;
  loading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load employees from local storage
    const storedEmployees = localStorage.getItem('payroll_employees');

    if (storedEmployees) {
      setEmployees(JSON.parse(storedEmployees));
    } else {
      // Initialize empty database
      setEmployees([]);
      localStorage.setItem('payroll_employees', JSON.stringify([]));
    }
    setLoading(false);
  }, []);

  // Persist to local storage whenever employees change
  const saveToStorage = (updatedEmployees: Employee[]) => {
    setEmployees(updatedEmployees);
    localStorage.setItem('payroll_employees', JSON.stringify(updatedEmployees));
  };

  const addEmployee = (employee: Employee) => {
    const updated = [employee, ...employees];
    saveToStorage(updated);
  };

  const updateEmployee = (updatedEmployee: Employee) => {
    const updated = employees.map(emp => 
      emp.id === updatedEmployee.id ? updatedEmployee : emp
    );
    saveToStorage(updated);
  };

  const deleteEmployee = (id: string) => {
    const updated = employees.filter(emp => emp.id !== id);
    saveToStorage(updated);
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
      loading 
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