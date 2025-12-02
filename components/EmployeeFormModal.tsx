import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import Button from './Button';
import { Department, EmployeeStatus, Employee } from '../types';
import { Camera, User, Briefcase, DollarSign } from 'lucide-react';

interface EmployeeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Employee, 'id' | 'avatarUrl'>) => void;
  initialData: Employee | null;
}

const initialFormState = {
  firstName: '',
  lastName: '',
  email: '',
  position: '',
  department: Department.ENGINEERING,
  status: EmployeeStatus.ACTIVE,
  dateHired: new Date().toISOString().split('T')[0],
  basicSalary: 0,
};

const EmployeeFormModal: React.FC<EmployeeFormModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    if (initialData) {
      setFormData({
        firstName: initialData.firstName,
        lastName: initialData.lastName,
        email: initialData.email,
        position: initialData.position,
        department: initialData.department,
        status: initialData.status,
        dateHired: initialData.dateHired,
        basicSalary: initialData.basicSalary,
      });
    } else {
      setFormData(initialFormState);
    }
  }, [initialData, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'basicSalary' ? (value === '' ? 0 : parseFloat(value)) : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  const currentAvatar = initialData 
    ? initialData.avatarUrl 
    : `https://ui-avatars.com/api/?name=${formData.firstName}+${formData.lastName}&background=0D8ABC&color=fff`;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={initialData ? "Edit Employee Details" : "New Employee Registration"}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Photo Section */}
        <div className="flex items-center gap-5 p-4 bg-gray-50 rounded-lg border border-gray-100">
          <div className="relative">
             <img 
               src={currentAvatar} 
               alt="Profile" 
               className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md"
             />
             <button type="button" className="absolute bottom-0 right-0 bg-white rounded-full p-1.5 shadow-sm border border-gray-200 text-gray-500 hover:text-primary-600 transition-colors">
               <Camera size={14} />
             </button>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">Profile Photo</h4>
            <p className="text-xs text-gray-500 mt-1">Upload a professional photo (JPG, PNG).<br/>Max size 2MB.</p>
          </div>
        </div>

        {/* Personal Info Group */}
        <div>
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
            <User size={16} className="text-primary-500" />
            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Personal Information</h4>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">First Name</label>
              <input
                type="text"
                name="firstName"
                required
                placeholder="e.g. John"
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm"
                value={formData.firstName}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Last Name</label>
              <input
                type="text"
                name="lastName"
                required
                placeholder="e.g. Doe"
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm"
                value={formData.lastName}
                onChange={handleInputChange}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Email Address</label>
              <input
                type="email"
                name="email"
                required
                placeholder="john.doe@company.com"
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>

        {/* Employment Details Group */}
        <div>
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100 mt-2">
            <Briefcase size={16} className="text-primary-500" />
            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Employment Details</h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Position</label>
              <input
                type="text"
                name="position"
                required
                placeholder="e.g. Software Engineer"
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm"
                value={formData.position}
                onChange={handleInputChange}
              />
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Department</label>
              <div className="relative">
                <select
                  name="department"
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm appearance-none"
                  value={formData.department}
                  onChange={handleInputChange}
                >
                  {Object.values(Department).map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Date Hired</label>
              <input
                type="date"
                name="dateHired"
                required
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm"
                value={formData.dateHired}
                onChange={handleInputChange}
              />
            </div>

             <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Status</label>
              <div className="relative">
                <select
                  name="status"
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm appearance-none"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  {Object.values(EmployeeStatus).map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Compensation Group */}
        <div>
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100 mt-2">
            <DollarSign size={16} className="text-primary-500" />
            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Compensation</h4>
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Basic Monthly Salary</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">₱</span>
              <input
                type="number"
                name="basicSalary"
                min="0"
                step="0.01"
                required
                placeholder="0.00"
                className="w-full pl-8 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm font-mono"
                value={formData.basicSalary || ''}
                onChange={handleInputChange}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">This amount is used for tax and contribution calculations.</p>
          </div>
        </div>

        <div className="pt-6 flex justify-end gap-3 border-t border-gray-100">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit">{initialData ? 'Save Changes' : 'Register Employee'}</Button>
        </div>
      </form>
    </Modal>
  );
};

export default EmployeeFormModal;