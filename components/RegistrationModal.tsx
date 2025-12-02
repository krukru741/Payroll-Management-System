import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import Button from './Button';
import { Gender, CivilStatus, UserRole, Department, AppUser, EmployeeStatus, Employee } from '../types';
import { User, Shield, Heart, Lock, FileText, AlertCircle, Briefcase } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RegistrationModal: React.FC<RegistrationModalProps> = ({ isOpen, onClose }) => {
  const { register } = useAuth();
  const { addEmployee } = useData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    // Personal Info
    firstName: '',
    lastName: '',
    middleName: '',
    birthDate: '',
    age: '',
    gender: Gender.MALE,
    civilStatus: CivilStatus.SINGLE,
    address: '',
    contactNo: '',
    email: '',

    // Employment
    department: Department.ENGINEERING,
    position: '',
    
    // Gov IDs
    sssNo: '',
    philhealthNo: '',
    pagibigNo: '',
    tinNo: '',
    
    // Emergency Contact
    ecFullName: '',
    ecContactNumber: '',
    ecRelationship: '',
    
    // User Account
    username: '',
    password: '',
    confirmPassword: ''
  });

  const [passwordError, setPasswordError] = useState('');

  // Auto-calculate age
  useEffect(() => {
    if (formData.birthDate) {
      const birth = new Date(formData.birthDate);
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      setFormData(prev => ({ ...prev, age: age.toString() }));
    }
  }, [formData.birthDate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'password' || name === 'confirmPassword') {
      setPasswordError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
    
    setIsSubmitting(true);

    try {
      const newUserId = `USR-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
      const newEmployeeId = `EMP-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

      // Create Employee Record for HR System
      const newEmployee: Employee = {
        id: newEmployeeId,
        firstName: formData.firstName,
        lastName: formData.lastName,
        middleName: formData.middleName,
        email: formData.email,
        position: formData.position,
        department: formData.department,
        status: EmployeeStatus.ACTIVE,
        dateHired: new Date().toISOString().split('T')[0],
        basicSalary: 25000, // Default starting salary for registration demo
        avatarUrl: `https://ui-avatars.com/api/?name=${formData.firstName}+${formData.lastName}&background=random`,
        birthDate: formData.birthDate,
        age: parseInt(formData.age || '0'),
        gender: formData.gender,
        civilStatus: formData.civilStatus,
        address: formData.address,
        contactNo: formData.contactNo,
        governmentIds: {
          sss: formData.sssNo,
          philHealth: formData.philhealthNo,
          pagIbig: formData.pagibigNo,
          tin: formData.tinNo
        },
        emergencyContact: {
          fullName: formData.ecFullName,
          contactNumber: formData.ecContactNumber,
          relationship: formData.ecRelationship
        }
      };

      // Add to HR Database
      addEmployee(newEmployee);

      // Create User Account for Login
      const newUser: AppUser = {
        id: newUserId,
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        username: formData.username,
        password: formData.password,
        role: UserRole.EMPLOYEE, // Default role
        department: formData.department,
        position: formData.position,
        employeeId: newEmployeeId, // Link to employee record
        avatarUrl: newEmployee.avatarUrl
      };

      await register(newUser);
      
      alert("Registration Successful! You can now log in.");
      onClose();
    } catch (error) {
      console.error("Registration failed", error);
      alert("Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const SectionHeader = ({ icon: Icon, title }: { icon: any, title: string }) => (
    <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100 mt-6 first:mt-0">
      <Icon size={18} className="text-primary-500" />
      <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">{title}</h4>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Employee Registration">
      <form onSubmit={handleSubmit} className="space-y-2">
        
        {/* 1. Personal Information */}
        <SectionHeader icon={User} title="Personal Information" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label-text">First Name *</label>
            <input type="text" name="firstName" required className="input-field" value={formData.firstName} onChange={handleChange} />
          </div>
          <div>
            <label className="label-text">Middle Name</label>
            <input type="text" name="middleName" className="input-field" value={formData.middleName} onChange={handleChange} />
          </div>
          <div>
            <label className="label-text">Last Name *</label>
            <input type="text" name="lastName" required className="input-field" value={formData.lastName} onChange={handleChange} />
          </div>
          
          <div className="md:col-span-2">
            <label className="label-text">Email Address *</label>
            <input type="email" name="email" required className="input-field" value={formData.email} onChange={handleChange} />
          </div>
          <div>
             <label className="label-text">Contact No. *</label>
             <input type="tel" name="contactNo" required className="input-field" placeholder="09xxxxxxxxx" value={formData.contactNo} onChange={handleChange} />
          </div>

          <div>
            <label className="label-text">Birthdate *</label>
            <input type="date" name="birthDate" required className="input-field" value={formData.birthDate} onChange={handleChange} />
          </div>
          <div>
            <label className="label-text">Age</label>
            <input type="number" name="age" readOnly className="input-field bg-gray-50" value={formData.age} />
          </div>
          <div>
            <label className="label-text">Gender *</label>
            <select name="gender" className="input-field" value={formData.gender} onChange={handleChange}>
              {Object.values(Gender).map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          
          <div>
            <label className="label-text">Civil Status *</label>
             <select name="civilStatus" className="input-field" value={formData.civilStatus} onChange={handleChange}>
              {Object.values(CivilStatus).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="label-text">Address *</label>
            <input type="text" name="address" required className="input-field" placeholder="House No, Street, City, Province" value={formData.address} onChange={handleChange} />
          </div>
        </div>

        {/* 2. Employment Details */}
        <SectionHeader icon={Briefcase} title="Employment Details" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <div>
             <label className="label-text">Position/Job Title *</label>
             <input type="text" name="position" required className="input-field" value={formData.position} onChange={handleChange} />
           </div>
           <div>
              <label className="label-text">Department *</label>
              <select name="department" className="input-field" value={formData.department} onChange={handleChange}>
                {Object.values(Department).map(d => <option key={d} value={d}>{d}</option>)}
              </select>
           </div>
        </div>

        {/* 3. Government IDs */}
        <SectionHeader icon={FileText} title="Government IDs" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <div>
            <label className="label-text">SSS No.</label>
            <input type="text" name="sssNo" className="input-field" placeholder="XX-XXXXXXX-X" value={formData.sssNo} onChange={handleChange} />
          </div>
          <div>
            <label className="label-text">PhilHealth No.</label>
            <input type="text" name="philhealthNo" className="input-field" placeholder="XX-XXXXXXXXX-X" value={formData.philhealthNo} onChange={handleChange} />
          </div>
          <div>
            <label className="label-text">Pag-IBIG No.</label>
            <input type="text" name="pagibigNo" className="input-field" placeholder="XXXX-XXXX-XXXX" value={formData.pagibigNo} onChange={handleChange} />
          </div>
          <div>
            <label className="label-text">TIN</label>
            <input type="text" name="tinNo" className="input-field" placeholder="XXX-XXX-XXX-XXX" value={formData.tinNo} onChange={handleChange} />
          </div>
        </div>

        {/* 4. Emergency Contact */}
        <SectionHeader icon={Heart} title="Emergency Contact" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
             <label className="label-text">Full Name *</label>
             <input type="text" name="ecFullName" required className="input-field" value={formData.ecFullName} onChange={handleChange} />
          </div>
          <div className="md:col-span-1">
             <label className="label-text">Contact No. *</label>
             <input type="tel" name="ecContactNumber" required className="input-field" value={formData.ecContactNumber} onChange={handleChange} />
          </div>
          <div className="md:col-span-1">
             <label className="label-text">Relationship *</label>
             <input type="text" name="ecRelationship" required className="input-field" placeholder="e.g. Spouse, Parent" value={formData.ecRelationship} onChange={handleChange} />
          </div>
        </div>

        {/* 5. User Account */}
        <SectionHeader icon={Shield} title="User Account" />
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="label-text">Username *</label>
            <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" name="username" required className="input-field pl-10" value={formData.username} onChange={handleChange} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
                <label className="label-text">Password *</label>
                <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="password" name="password" required className="input-field pl-10" value={formData.password} onChange={handleChange} />
                </div>
             </div>
             <div>
                <label className="label-text">Confirm Password *</label>
                <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="password" name="confirmPassword" required className="input-field pl-10" value={formData.confirmPassword} onChange={handleChange} />
                </div>
             </div>
          </div>
          {passwordError && (
              <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                  <AlertCircle size={16} /> {passwordError}
              </div>
          )}
        </div>

        <div className="pt-6 flex justify-end gap-3 border-t border-gray-100 mt-6">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button type="submit" disabled={isSubmitting}>
             {isSubmitting ? 'Registering...' : 'Submit Registration'}
          </Button>
        </div>
      </form>
      
      <style>{`
        .label-text {
          display: block;
          font-size: 0.75rem;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.375rem;
        }
        .input-field {
          width: 100%;
          padding: 0.625rem 0.75rem;
          background-color: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          transition: all 0.2s;
        }
        .input-field:focus {
          background-color: #ffffff;
          outline: none;
          border-color: #076653;
          box-shadow: 0 0 0 3px rgba(7, 102, 83, 0.1);
        }
      `}</style>
    </Modal>
  );
};

export default RegistrationModal;
