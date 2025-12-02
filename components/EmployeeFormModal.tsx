import React, { useEffect } from 'react';
import Modal from './Modal';
import Button from './Button';
import { Department, EmployeeStatus, Employee, Gender, CivilStatus } from '../types';
import { Camera, User, Briefcase, DollarSign, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { employeeFormSchema, EmployeeFormData } from '../lib/schemas';

interface EmployeeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Employee, 'id' | 'avatarUrl'>) => void;
  initialData: Employee | null;
}

const EmployeeFormModal: React.FC<EmployeeFormModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setValue
  } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: {
      status: EmployeeStatus.ACTIVE,
      department: Department.ENGINEERING,
      gender: Gender.MALE,
      civilStatus: CivilStatus.SINGLE,
      basicSalary: 0
    }
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          firstName: initialData.firstName,
          lastName: initialData.lastName,
          middleName: initialData.middleName || '',
          email: initialData.email,
          contactNo: initialData.contactNo || '',
          birthDate: initialData.birthDate || '',
          age: initialData.age,
          gender: initialData.gender || Gender.MALE,
          civilStatus: initialData.civilStatus || CivilStatus.SINGLE,
          address: initialData.address || '',
          
          position: initialData.position,
          department: initialData.department,
          status: initialData.status,
          dateHired: initialData.dateHired,
          basicSalary: initialData.basicSalary,

          sssNo: initialData.governmentIds?.sss || '',
          philhealthNo: initialData.governmentIds?.philHealth || '',
          pagibigNo: initialData.governmentIds?.pagIbig || '',
          tinNo: initialData.governmentIds?.tin || '',

          ecFullName: initialData.emergencyContact?.fullName || '',
          ecContactNumber: initialData.emergencyContact?.contactNumber || '',
          ecRelationship: initialData.emergencyContact?.relationship || '',
        });
      } else {
        reset({
          status: EmployeeStatus.ACTIVE,
          department: Department.ENGINEERING,
          dateHired: new Date().toISOString().split('T')[0],
          basicSalary: 0
        });
      }
    }
  }, [initialData, isOpen, reset]);

  const onFormSubmit = (data: EmployeeFormData) => {
    // Transform flat form data back to nested structure if needed by onSubmit
    // For now we pass individual fields and let the parent handle structure or
    // we adapt here. The parent Employees.tsx expects a flattened structure 
    // but the Employee type has nested objects.
    
    // Constructing the object to match Employee interface structure
    const payload: any = {
      ...data,
      governmentIds: {
        sss: data.sssNo,
        philHealth: data.philhealthNo,
        pagIbig: data.pagibigNo,
        tin: data.tinNo
      },
      emergencyContact: {
        fullName: data.ecFullName,
        contactNumber: data.ecContactNumber,
        relationship: data.ecRelationship
      }
    };
    
    onSubmit(payload);
    onClose();
  };

  const currentAvatar = initialData 
    ? initialData.avatarUrl 
    : `https://ui-avatars.com/api/?background=random&color=fff&name=New+User`;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={initialData ? "Edit Employee Details" : "New Employee Registration"}
    >
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
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
              <label className="label-text">First Name *</label>
              <input {...register('firstName')} className={`input-field ${errors.firstName ? 'border-red-500' : ''}`} placeholder="e.g. John" />
              {errors.firstName && <span className="text-xs text-red-500 mt-1">{errors.firstName.message}</span>}
            </div>
            <div>
              <label className="label-text">Last Name *</label>
              <input {...register('lastName')} className={`input-field ${errors.lastName ? 'border-red-500' : ''}`} placeholder="e.g. Doe" />
              {errors.lastName && <span className="text-xs text-red-500 mt-1">{errors.lastName.message}</span>}
            </div>
            <div className="sm:col-span-2">
              <label className="label-text">Email Address *</label>
              <input {...register('email')} className={`input-field ${errors.email ? 'border-red-500' : ''}`} placeholder="john.doe@company.com" />
              {errors.email && <span className="text-xs text-red-500 mt-1">{errors.email.message}</span>}
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
              <label className="label-text">Position *</label>
              <input {...register('position')} className={`input-field ${errors.position ? 'border-red-500' : ''}`} placeholder="e.g. Software Engineer" />
              {errors.position && <span className="text-xs text-red-500 mt-1">{errors.position.message}</span>}
            </div>
            
            <div>
              <label className="label-text">Department *</label>
              <div className="relative">
                <select {...register('department')} className="input-field appearance-none">
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
              <label className="label-text">Date Hired *</label>
              <input type="date" {...register('dateHired')} className={`input-field ${errors.dateHired ? 'border-red-500' : ''}`} />
              {errors.dateHired && <span className="text-xs text-red-500 mt-1">{errors.dateHired.message}</span>}
            </div>

             <div>
              <label className="label-text">Status *</label>
              <div className="relative">
                <select {...register('status')} className="input-field appearance-none">
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
            <label className="label-text">Basic Monthly Salary *</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">₱</span>
              <input
                type="number"
                step="0.01"
                {...register('basicSalary', { valueAsNumber: true })}
                className={`input-field pl-8 font-mono ${errors.basicSalary ? 'border-red-500' : ''}`}
                placeholder="0.00"
              />
            </div>
            {errors.basicSalary && <span className="text-xs text-red-500 mt-1">{errors.basicSalary.message}</span>}
            <p className="text-xs text-gray-400 mt-1">This amount is used for tax and contribution calculations.</p>
          </div>
        </div>

        <div className="pt-6 flex justify-end gap-3 border-t border-gray-100">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={isSubmitting}>{initialData ? 'Save Changes' : 'Register Employee'}</Button>
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

export default EmployeeFormModal;
