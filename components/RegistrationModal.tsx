import React, { useEffect } from 'react';
import Modal from './Modal';
import Button from './Button';
import { Gender, CivilStatus, UserRole, Department, AppUser, EmployeeStatus, Employee } from '../types';
import { User, Shield, Heart, Lock, FileText, AlertCircle, Briefcase } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registrationSchema, RegistrationFormData } from '../lib/schemas';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RegistrationModal: React.FC<RegistrationModalProps> = ({ isOpen, onClose }) => {
  const { register: registerUser } = useAuth();
  const { addEmployee } = useData();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      gender: Gender.MALE,
      civilStatus: CivilStatus.SINGLE,
      department: Department.ENGINEERING,
      basicSalary: 25000,
      status: EmployeeStatus.ACTIVE,
      dateHired: new Date().toISOString().split('T')[0],
      age: 0
    }
  });

  const birthDate = watch('birthDate');

  // Auto-calculate age
  useEffect(() => {
    if (birthDate) {
      const birth = new Date(birthDate);
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      setValue('age', age);
    }
  }, [birthDate, setValue]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  const onFormSubmit = async (data: RegistrationFormData) => {
    try {
      const newUserId = `USR-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
      const newEmployeeId = `EMP-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

      // Create Employee Record for HR System
      const newEmployee: Employee = {
        id: newEmployeeId,
        firstName: data.firstName,
        lastName: data.lastName,
        middleName: data.middleName,
        email: data.email,
        position: data.position,
        department: data.department,
        status: data.status,
        dateHired: data.dateHired,
        basicSalary: data.basicSalary,
        avatarUrl: `https://ui-avatars.com/api/?name=${data.firstName}+${data.lastName}&background=random`,
        birthDate: data.birthDate,
        age: data.age,
        gender: data.gender,
        civilStatus: data.civilStatus,
        address: data.address,
        contactNo: data.contactNo,
        governmentIds: {
          sss: data.sssNo || '',
          philHealth: data.philhealthNo || '',
          pagIbig: data.pagibigNo || '',
          tin: data.tinNo || ''
        },
        emergencyContact: {
          fullName: data.ecFullName,
          contactNumber: data.ecContactNumber,
          relationship: data.ecRelationship
        }
      };

      // Add to HR Database
      addEmployee(newEmployee);

      // Create User Account for Login
      const newUser: AppUser = {
        id: newUserId,
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        username: data.username,
        password: data.password,
        role: UserRole.EMPLOYEE, // Default role
        department: data.department,
        position: data.position,
        employeeId: newEmployeeId, // Link to employee record
        avatarUrl: newEmployee.avatarUrl
      };

      await registerUser(newUser);
      
      alert("Registration Successful! You can now log in.");
      onClose();
    } catch (error) {
      console.error("Registration failed", error);
      alert("Registration failed. Please try again.");
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
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-2">
        
        {/* 1. Personal Information */}
        <SectionHeader icon={User} title="Personal Information" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label-text">First Name *</label>
            <input {...register('firstName')} className={`input-field ${errors.firstName ? 'border-red-500' : ''}`} />
            {errors.firstName && <span className="text-xs text-red-500">{errors.firstName.message}</span>}
          </div>
          <div>
            <label className="label-text">Middle Name</label>
            <input {...register('middleName')} className="input-field" />
          </div>
          <div>
            <label className="label-text">Last Name *</label>
            <input {...register('lastName')} className={`input-field ${errors.lastName ? 'border-red-500' : ''}`} />
            {errors.lastName && <span className="text-xs text-red-500">{errors.lastName.message}</span>}
          </div>
          
          <div className="md:col-span-2">
            <label className="label-text">Email Address *</label>
            <input type="email" {...register('email')} className={`input-field ${errors.email ? 'border-red-500' : ''}`} />
            {errors.email && <span className="text-xs text-red-500">{errors.email.message}</span>}
          </div>
          <div>
             <label className="label-text">Contact No. *</label>
             <input type="tel" {...register('contactNo')} className={`input-field ${errors.contactNo ? 'border-red-500' : ''}`} placeholder="09xxxxxxxxx" />
             {errors.contactNo && <span className="text-xs text-red-500">{errors.contactNo.message}</span>}
          </div>

          <div>
            <label className="label-text">Birthdate *</label>
            <input type="date" {...register('birthDate')} className={`input-field ${errors.birthDate ? 'border-red-500' : ''}`} />
            {errors.birthDate && <span className="text-xs text-red-500">{errors.birthDate.message}</span>}
          </div>
          <div>
            <label className="label-text">Age</label>
            <input type="number" {...register('age')} readOnly className="input-field bg-gray-50" />
          </div>
          <div>
            <label className="label-text">Gender *</label>
            <select {...register('gender')} className="input-field">
              {Object.values(Gender).map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          
          <div>
            <label className="label-text">Civil Status *</label>
             <select {...register('civilStatus')} className="input-field">
              {Object.values(CivilStatus).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="label-text">Address *</label>
            <input {...register('address')} className={`input-field ${errors.address ? 'border-red-500' : ''}`} placeholder="House No, Street, City, Province" />
            {errors.address && <span className="text-xs text-red-500">{errors.address.message}</span>}
          </div>
        </div>

        {/* 2. Employment Details */}
        <SectionHeader icon={Briefcase} title="Employment Details" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <div>
             <label className="label-text">Position/Job Title *</label>
             <input {...register('position')} className={`input-field ${errors.position ? 'border-red-500' : ''}`} />
             {errors.position && <span className="text-xs text-red-500">{errors.position.message}</span>}
           </div>
           <div>
              <label className="label-text">Department *</label>
              <select {...register('department')} className="input-field">
                {Object.values(Department).map(d => <option key={d} value={d}>{d}</option>)}
              </select>
           </div>
        </div>

        {/* 3. Government IDs */}
        <SectionHeader icon={FileText} title="Government IDs" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <div>
            <label className="label-text">SSS No.</label>
            <input {...register('sssNo')} className="input-field" placeholder="XX-XXXXXXX-X" />
          </div>
          <div>
            <label className="label-text">PhilHealth No.</label>
            <input {...register('philhealthNo')} className="input-field" placeholder="XX-XXXXXXXXX-X" />
          </div>
          <div>
            <label className="label-text">Pag-IBIG No.</label>
            <input {...register('pagibigNo')} className="input-field" placeholder="XXXX-XXXX-XXXX" />
          </div>
          <div>
            <label className="label-text">TIN</label>
            <input {...register('tinNo')} className="input-field" placeholder="XXX-XXX-XXX-XXX" />
          </div>
        </div>

        {/* 4. Emergency Contact */}
        <SectionHeader icon={Heart} title="Emergency Contact" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
             <label className="label-text">Full Name *</label>
             <input {...register('ecFullName')} className={`input-field ${errors.ecFullName ? 'border-red-500' : ''}`} />
             {errors.ecFullName && <span className="text-xs text-red-500">{errors.ecFullName.message}</span>}
          </div>
          <div className="md:col-span-1">
             <label className="label-text">Contact No. *</label>
             <input {...register('ecContactNumber')} className={`input-field ${errors.ecContactNumber ? 'border-red-500' : ''}`} />
             {errors.ecContactNumber && <span className="text-xs text-red-500">{errors.ecContactNumber.message}</span>}
          </div>
          <div className="md:col-span-1">
             <label className="label-text">Relationship *</label>
             <input {...register('ecRelationship')} className={`input-field ${errors.ecRelationship ? 'border-red-500' : ''}`} placeholder="e.g. Spouse, Parent" />
             {errors.ecRelationship && <span className="text-xs text-red-500">{errors.ecRelationship.message}</span>}
          </div>
        </div>

        {/* 5. User Account */}
        <SectionHeader icon={Shield} title="User Account" />
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="label-text">Username *</label>
            <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input {...register('username')} className={`input-field pl-10 ${errors.username ? 'border-red-500' : ''}`} />
            </div>
            {errors.username && <span className="text-xs text-red-500">{errors.username.message}</span>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
                <label className="label-text">Password *</label>
                <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="password" {...register('password')} className={`input-field pl-10 ${errors.password ? 'border-red-500' : ''}`} />
                </div>
                {errors.password && <span className="text-xs text-red-500">{errors.password.message}</span>}
             </div>
             <div>
                <label className="label-text">Confirm Password *</label>
                <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="password" {...register('confirmPassword')} className={`input-field pl-10 ${errors.confirmPassword ? 'border-red-500' : ''}`} />
                </div>
                {errors.confirmPassword && <span className="text-xs text-red-500">{errors.confirmPassword.message}</span>}
             </div>
          </div>
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
