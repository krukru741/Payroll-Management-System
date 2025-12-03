import React, { useEffect } from "react";
import Modal from "./Modal";
import Button from "./Button";
import {
  Department,
  EmployeeStatus,
  Employee,
  Gender,
  CivilStatus,
} from "../types";
import { POSITION_DEPARTMENT_MAP } from "../constants";
import { Camera, User, Briefcase, DollarSign, AlertCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { employeeFormSchema, EmployeeFormData } from "../lib/schemas";

interface EmployeeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Employee, "id" | "avatarUrl">) => void;
  initialData: Employee | null;
}

const EmployeeFormModal: React.FC<EmployeeFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: {
      status: EmployeeStatus.ACTIVE,
      department: Department.ENGINEERING,
      gender: Gender.MALE,
      civilStatus: CivilStatus.SINGLE,
      basicSalary: 0,
    },
  });

  const basicSalary = watch("basicSalary");

  // Calculate hourly and daily rates
  // Assuming: 22 working days per month, 8 hours per day
  const biMonthlySalary = basicSalary ? (basicSalary / 2).toFixed(2) : "0.00";
  const dailyRate = basicSalary ? (basicSalary / 22).toFixed(2) : "0.00";
  const hourlyRate = basicSalary ? (basicSalary / 22 / 8).toFixed(2) : "0.00";

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          firstName: initialData.firstName,
          lastName: initialData.lastName,
          middleName: initialData.middleName || "",
          email: initialData.email,
          contactNo: initialData.contactNo || "",
          birthDate: initialData.birthDate
            ? new Date(initialData.birthDate).toISOString().split("T")[0]
            : "",
          age: initialData.age,
          gender: initialData.gender || Gender.MALE,
          civilStatus: initialData.civilStatus || CivilStatus.SINGLE,
          address: initialData.address || "",

          position: initialData.position,
          department: initialData.department,
          status: initialData.status,
          dateHired: initialData.dateHired
            ? new Date(initialData.dateHired).toISOString().split("T")[0]
            : "",
          basicSalary: initialData.basicSalary,

          sssNo: initialData.governmentIds?.sss || "",
          philhealthNo: initialData.governmentIds?.philHealth || "",
          pagibigNo: initialData.governmentIds?.pagIbig || "",
          tinNo: initialData.governmentIds?.tin || "",

          ecFullName: initialData.emergencyContact?.fullName || "",
          ecContactNumber: initialData.emergencyContact?.contactNumber || "",
          ecRelationship: initialData.emergencyContact?.relationship || "",
        });
      } else {
        reset({
          status: EmployeeStatus.ACTIVE,
          department: Department.ENGINEERING,
          dateHired: new Date().toISOString().split("T")[0],
          basicSalary: 0,
        });
      }
    }
  }, [initialData, isOpen, reset]);

  const onFormSubmit = (data: EmployeeFormData) => {
    // Calculate hourly and daily rates from basic salary
    const calculatedBiMonthlySalary = data.basicSalary
      ? parseFloat((data.basicSalary / 2).toFixed(2))
      : 0;
    const calculatedDailyRate = data.basicSalary
      ? parseFloat((data.basicSalary / 22).toFixed(2))
      : 0;
    const calculatedHourlyRate = data.basicSalary
      ? parseFloat((data.basicSalary / 22 / 8).toFixed(2))
      : 0;

    // Transform flat form data to the structure expected by the backend
    // Remove the nested objects and use flat fields instead
    const payload: any = {
      firstName: data.firstName,
      lastName: data.lastName,
      middleName: data.middleName,
      email: data.email,
      contactNo: data.contactNo,
      birthDate: data.birthDate,
      age: data.age,
      gender: data.gender,
      civilStatus: data.civilStatus,
      address: data.address,

      position: data.position,
      department: data.department,
      status: data.status,
      dateHired: data.dateHired,
      basicSalary: data.basicSalary,
      biMonthlySalary: calculatedBiMonthlySalary,
      ratePerDay: calculatedDailyRate,
      ratePerHour: calculatedHourlyRate,

      // Map flat form fields to database fields
      sssNo: data.sssNo,
      philHealthNo: data.philhealthNo,
      pagIbigNo: data.pagibigNo,
      tinNo: data.tinNo,

      ecFullName: data.ecFullName,
      ecContactNo: data.ecContactNumber,
      ecRelation: data.ecRelationship,
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
      title={
        initialData ? "Edit Employee Details" : "New Employee Registration"
      }
    >
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
        {/* Profile Photo Section */}
        <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
          <div className="relative">
            <img
              src={currentAvatar}
              alt="Profile"
              className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-md"
            />
            <button
              type="button"
              className="absolute bottom-0 right-0 bg-white rounded-full p-1.5 shadow-sm border border-gray-200 text-gray-500 hover:text-primary-600 transition-colors"
            >
              <Camera size={12} />
            </button>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 text-sm">
              Profile Photo
            </h4>
            <p className="text-xs text-gray-500 mt-0.5">
              Upload a professional photo (JPG, PNG). Max 2MB.
            </p>
          </div>
        </div>

        {/* Personal Info Group */}
        <div>
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
            <User size={16} className="text-primary-500" />
            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              Personal Information
            </h4>
          </div>

          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-12 md:col-span-4">
              <label className="label-text">First Name *</label>
              <input
                {...register("firstName")}
                className={`input-field ${
                  errors.firstName ? "border-red-500" : ""
                }`}
                placeholder="e.g. John"
              />
              {errors.firstName && (
                <span className="text-xs text-red-500 mt-1">
                  {errors.firstName.message}
                </span>
              )}
            </div>
            <div className="col-span-12 md:col-span-4">
              <label className="label-text">Middle Name</label>
              <input
                {...register("middleName")}
                className="input-field"
                placeholder="e.g. M."
              />
            </div>
            <div className="col-span-12 md:col-span-4">
              <label className="label-text">Last Name *</label>
              <input
                {...register("lastName")}
                className={`input-field ${
                  errors.lastName ? "border-red-500" : ""
                }`}
                placeholder="e.g. Doe"
              />
              {errors.lastName && (
                <span className="text-xs text-red-500 mt-1">
                  {errors.lastName.message}
                </span>
              )}
            </div>

            <div className="col-span-12 md:col-span-6">
              <label className="label-text">Email Address *</label>
              <input
                {...register("email")}
                className={`input-field ${
                  errors.email ? "border-red-500" : ""
                }`}
                placeholder="john.doe@company.com"
              />
              {errors.email && (
                <span className="text-xs text-red-500 mt-1">
                  {errors.email.message}
                </span>
              )}
            </div>
            <div className="col-span-12 md:col-span-6">
              <label className="label-text">Contact No. *</label>
              <input
                {...register("contactNo")}
                className={`input-field ${
                  errors.contactNo ? "border-red-500" : ""
                }`}
                placeholder="09xxxxxxxxx"
              />
              {errors.contactNo && (
                <span className="text-xs text-red-500 mt-1">
                  {errors.contactNo.message}
                </span>
              )}
            </div>

            <div className="col-span-6 md:col-span-3">
              <label className="label-text">Birthdate *</label>
              <input
                type="date"
                {...register("birthDate")}
                className={`input-field ${
                  errors.birthDate ? "border-red-500" : ""
                }`}
              />
              {errors.birthDate && (
                <span className="text-xs text-red-500 mt-1">
                  {errors.birthDate.message}
                </span>
              )}
            </div>
            <div className="col-span-6 md:col-span-2">
              <label className="label-text">Age</label>
              <input
                type="number"
                {...register("age")}
                className="input-field"
              />
            </div>
            <div className="col-span-6 md:col-span-3">
              <label className="label-text">Gender *</label>
              <select {...register("gender")} className="input-field">
                {Object.values(Gender).map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-6 md:col-span-4">
              <label className="label-text">Civil Status *</label>
              <select {...register("civilStatus")} className="input-field">
                {Object.values(CivilStatus).map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-12">
              <label className="label-text">Address *</label>
              <input
                {...register("address")}
                className={`input-field ${
                  errors.address ? "border-red-500" : ""
                }`}
                placeholder="House No, Street, City, Province"
              />
              {errors.address && (
                <span className="text-xs text-red-500 mt-1">
                  {errors.address.message}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Employment Details Group */}
        <div>
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
            <Briefcase size={16} className="text-primary-500" />
            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              Employment Details
            </h4>
          </div>

          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-12 md:col-span-6">
              <label className="label-text">Position *</label>
              <div className="relative">
                <select
                  {...register("position")}
                  className={`input-field appearance-none ${
                    errors.position ? "border-red-500" : ""
                  }`}
                  onChange={(e) => {
                    register("position").onChange(e);
                    const selectedPos = e.target.value;
                    const deptEntry = Object.entries(
                      POSITION_DEPARTMENT_MAP
                    ).find(([_, positions]) => positions.includes(selectedPos));
                    if (deptEntry) {
                      setValue("department", deptEntry[0] as Department);
                    }
                  }}
                >
                  <option value="">Select Position</option>
                  {Object.entries(POSITION_DEPARTMENT_MAP).map(
                    ([dept, positions]) => (
                      <optgroup key={dept} label={dept}>
                        {positions.map((pos) => (
                          <option key={pos} value={pos}>
                            {pos}
                          </option>
                        ))}
                      </optgroup>
                    )
                  )}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                  <svg
                    className="fill-current h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
              {errors.position && (
                <span className="text-xs text-red-500 mt-1">
                  {errors.position.message}
                </span>
              )}
            </div>

            <div className="col-span-12 md:col-span-6">
              <label className="label-text">Department *</label>
              <div className="relative">
                <select
                  {...register("department")}
                  className="input-field appearance-none bg-gray-50"
                  readOnly
                >
                  {Object.values(Department).map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                  <svg
                    className="fill-current h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="col-span-12 md:col-span-6">
              <label className="label-text">Date Hired *</label>
              <input
                type="date"
                {...register("dateHired")}
                className={`input-field ${
                  errors.dateHired ? "border-red-500" : ""
                }`}
              />
              {errors.dateHired && (
                <span className="text-xs text-red-500 mt-1">
                  {errors.dateHired.message}
                </span>
              )}
            </div>

            <div className="col-span-12 md:col-span-6">
              <label className="label-text">Status *</label>
              <div className="relative">
                <select
                  {...register("status")}
                  className="input-field appearance-none"
                >
                  {Object.values(EmployeeStatus).map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                  <svg
                    className="fill-current h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Government IDs Group */}
        <div>
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
            <AlertCircle size={16} className="text-primary-500" />
            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              Government IDs
            </h4>
          </div>
          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-12 md:col-span-6">
              <label className="label-text">SSS No.</label>
              <input
                {...register("sssNo")}
                className="input-field"
                placeholder="XX-XXXXXXX-X"
              />
            </div>
            <div className="col-span-12 md:col-span-6">
              <label className="label-text">PhilHealth No.</label>
              <input
                {...register("philhealthNo")}
                className="input-field"
                placeholder="XX-XXXXXXXXX-X"
              />
            </div>
            <div className="col-span-12 md:col-span-6">
              <label className="label-text">Pag-IBIG No.</label>
              <input
                {...register("pagibigNo")}
                className="input-field"
                placeholder="XXXX-XXXX-XXXX"
              />
            </div>
            <div className="col-span-12 md:col-span-6">
              <label className="label-text">TIN</label>
              <input
                {...register("tinNo")}
                className="input-field"
                placeholder="XXX-XXX-XXX-XXX"
              />
            </div>
          </div>
        </div>

        {/* Emergency Contact Group */}
        <div>
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
            <AlertCircle size={16} className="text-primary-500" />
            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              Emergency Contact
            </h4>
          </div>
          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-12 md:col-span-5">
              <label className="label-text">Full Name</label>
              <input
                {...register("ecFullName")}
                className={`input-field ${
                  errors.ecFullName ? "border-red-500" : ""
                }`}
              />
              {errors.ecFullName && (
                <span className="text-xs text-red-500 mt-1">
                  {errors.ecFullName.message}
                </span>
              )}
            </div>
            <div className="col-span-12 md:col-span-4">
              <label className="label-text">Contact No.</label>
              <input
                {...register("ecContactNumber")}
                className={`input-field ${
                  errors.ecContactNumber ? "border-red-500" : ""
                }`}
              />
              {errors.ecContactNumber && (
                <span className="text-xs text-red-500 mt-1">
                  {errors.ecContactNumber.message}
                </span>
              )}
            </div>
            <div className="col-span-12 md:col-span-3">
              <label className="label-text">Relationship</label>
              <input
                {...register("ecRelationship")}
                className={`input-field ${
                  errors.ecRelationship ? "border-red-500" : ""
                }`}
                placeholder="e.g. Spouse"
              />
              {errors.ecRelationship && (
                <span className="text-xs text-red-500 mt-1">
                  {errors.ecRelationship.message}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Compensation Group */}
        <div>
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
            <DollarSign size={16} className="text-primary-500" />
            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              Compensation
            </h4>
          </div>

          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-12 md:col-span-3">
              <label className="label-text">Basic Monthly Salary *</label>
              <div className="flex items-center gap-2">
                <span className="text-gray-500 font-medium">₱</span>
                <input
                  type="number"
                  step="0.01"
                  {...register("basicSalary", { valueAsNumber: true })}
                  className={`input-field font-mono flex-1 ${
                    errors.basicSalary ? "border-red-500" : ""
                  }`}
                  placeholder="0.00"
                />
              </div>
              {errors.basicSalary && (
                <span className="text-xs text-red-500 mt-1">
                  {errors.basicSalary.message}
                </span>
              )}
            </div>

            <div className="col-span-12 md:col-span-3">
              <label className="label-text">Bi-Monthly Salary</label>
              <div className="flex items-center gap-2">
                <span className="text-gray-500 font-medium">₱</span>
                <input
                  type="text"
                  value={biMonthlySalary}
                  readOnly
                  className="input-field font-mono bg-gray-50 text-gray-600 flex-1"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Half of monthly salary
              </p>
            </div>

            <div className="col-span-12 md:col-span-3">
              <label className="label-text">Daily Rate</label>
              <div className="flex items-center gap-2">
                <span className="text-gray-500 font-medium">₱</span>
                <input
                  type="text"
                  value={dailyRate}
                  readOnly
                  className="input-field font-mono bg-gray-50 text-gray-600 flex-1"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                22 working days/month
              </p>
            </div>

            <div className="col-span-12 md:col-span-3">
              <label className="label-text">Hourly Rate</label>
              <div className="flex items-center gap-2">
                <span className="text-gray-500 font-medium">₱</span>
                <input
                  type="text"
                  value={hourlyRate}
                  readOnly
                  className="input-field font-mono bg-gray-50 text-gray-600 flex-1"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">8 hours/day</p>
            </div>
          </div>
        </div>

        <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {initialData ? "Save Changes" : "Register Employee"}
          </Button>
        </div>
      </form>
      <style>{`
        .label-text {
          display: block;
          font-size: 0.7rem;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.25rem;
        }
        .input-field {
          width: 100%;
          padding: 0.5rem 0.625rem;
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
