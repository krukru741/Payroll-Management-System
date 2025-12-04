import React, { useState } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import EmployeeFormModal from '../components/EmployeeFormModal';
import LeaveCreditsModal from '../components/LeaveCreditsModal';
import { Employee, EmployeeStatus } from '../types';
import { Plus, Search, Filter, Edit, Trash2, Lock, Award } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { getScope, hasPermission } from '../utils/rbac';

const Employees: React.FC = () => {
  const { user } = useAuth();
  const { employees, addEmployee, updateEmployee, deleteEmployee, loading } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCreditsModal, setShowCreditsModal] = useState(false);
  const [selectedEmployeeForCredits, setSelectedEmployeeForCredits] = useState<Employee | null>(null);

  // RBAC Filtering
  const scope = user ? getScope(user.role, 'employees', 'read') : 'none';
  
  const accessibleEmployees = employees.filter(emp => {
    if (scope === 'all') return true;
    if (scope === 'team') return emp.department === user?.department;
    if (scope === 'self') return emp.id === user?.employeeId;
    return false;
  });

  const filteredEmployees = accessibleEmployees.filter(emp => 
    emp.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const canCreate = user && hasPermission(user.role, 'employees', 'create');
  const canUpdate = user && hasPermission(user.role, 'employees', 'update');
  const canDelete = user && hasPermission(user.role, 'employees', 'delete');

  const getStatusColor = (status: EmployeeStatus) => {
    switch (status) {
      case EmployeeStatus.ACTIVE: return 'bg-green-100 text-green-800';
      case EmployeeStatus.INACTIVE: return 'bg-gray-100 text-gray-800';
      case EmployeeStatus.ON_LEAVE: return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleOpenAddModal = () => {
    setEditingId(null);
    setIsModalOpen(true);
  };

  const handleEdit = (employee: Employee) => {
    setEditingId(employee.id);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this employee? This action cannot be undone.')) {
      deleteEmployee(id);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSubmit = (formData: Omit<Employee, 'id' | 'avatarUrl'>) => {
    if (editingId) {
      // Find existing to preserve ID and Avatar
      const existing = employees.find(e => e.id === editingId);
      if (existing) {
        updateEmployee({
          ...existing,
          ...formData
        });
      }
    } else {
      const newEmployee: Employee = {
        id: `EMP-${Math.floor(Math.random() * 10000).toString().padStart(3, '0')}`,
        ...formData,
        avatarUrl: `https://ui-avatars.com/api/?name=${formData.firstName}+${formData.lastName}&background=random`
      };
      addEmployee(newEmployee);
    }
  };

  const handleManageCredits = (employee: Employee) => {
    setSelectedEmployeeForCredits(employee);
    setShowCreditsModal(true);
  };

  const handleCloseCreditsModal = () => {
    setShowCreditsModal(false);
    setSelectedEmployeeForCredits(null);
  };


  const currentEmployee = editingId 
    ? employees.find(e => e.id === editingId) || null
    : null;

  if (loading) return <div>Loading employees...</div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Employees</h2>
          <p className="text-gray-500 text-sm">Manage your team members and their roles.</p>
        </div>
        {canCreate && (
          <Button onClick={handleOpenAddModal}>
            <Plus size={18} className="mr-2" />
            Add Employee
          </Button>
        )}
      </div>

      <Card className="p-0">
        {/* Toolbar */}
        <div className="p-3 border-b border-gray-100 flex flex-col sm:flex-row gap-3 justify-between bg-white">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder="Search by name or department..."
              className="w-full pl-9 pr-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter size={18} />
            Filters
          </Button>
        </div>

        {/* Table */}
        <div className="overflow-visible min-h-\[350px\]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Employee ID</th>
                <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">First Name</th>
                <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Name</th>
                <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Position</th>
                <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Department</th>
                <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date Hired</th>
                <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredEmployees.map((emp) => (
                <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-2.5 whitespace-nowrap text-sm text-gray-500 font-medium">
                    {emp.id}
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap">
                    <div className="flex items-center">
                      <img className="h-7 w-7 rounded-full object-cover border border-gray-200 mr-2" src={emp.avatarUrl} alt="" />
                      <div className="text-sm font-medium text-gray-900">{emp.firstName}</div>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap text-sm text-gray-900">
                    {emp.lastName}
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap text-sm text-gray-500">
                    {emp.email}
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap text-sm text-gray-900">
                    {emp.position}
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap text-sm text-gray-500">
                    {emp.department}
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(emp.status)}`}>
                      {emp.status}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap text-sm text-gray-500">
                    {new Date(emp.dateHired).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      {canUpdate && (
                        <button
                          onClick={() => handleEdit(emp)}
                          className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors"
                          title="Edit Employee"
                        >
                          <Edit size={16} />
                        </button>
                      )}
                      
                      {user?.role === 'ADMIN' && (
                        <button
                          onClick={() => handleManageCredits(emp)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Manage Leave Credits"
                        >
                          <Award size={16} />
                        </button>
                      )}
                      
                      {canDelete && (
                        <button
                          onClick={() => handleDelete(emp.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete Employee"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                      
                      {!canUpdate && !canDelete && <Lock size={14} className="text-gray-300" />}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredEmployees.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                    No employees found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination placeholder */}
        <div className="px-4 py-2.5 border-t border-gray-100 flex items-center justify-between">
          <span className="text-sm text-gray-500">Showing {filteredEmployees.length} of {accessibleEmployees.length} results</span>
          <div className="flex gap-2">
             <Button variant="outline" size="sm" disabled>Previous</Button>
             <Button variant="outline" size="sm">Next</Button>
          </div>
        </div>
      </Card>

      <EmployeeFormModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        initialData={currentEmployee}
      />

      {selectedEmployeeForCredits && (
        <LeaveCreditsModal
          isOpen={showCreditsModal}
          onClose={handleCloseCreditsModal}
          employeeId={selectedEmployeeForCredits.id}
          employeeName={`${selectedEmployeeForCredits.firstName} ${selectedEmployeeForCredits.lastName}`}
        />
      )}
    </div>
  );
};

export default Employees;
