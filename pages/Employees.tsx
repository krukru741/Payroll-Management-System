import React, { useState } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import EmployeeFormModal from '../components/EmployeeFormModal';
import { MOCK_EMPLOYEES } from '../constants';
import { Employee, EmployeeStatus } from '../types';
import { Plus, Search, Filter, MoreHorizontal, Mail, Edit, Trash2, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getScope, hasPermission } from '../utils/rbac';

const Employees: React.FC = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>(MOCK_EMPLOYEES);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

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
    setActiveMenuId(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this employee? This action cannot be undone.')) {
      setEmployees(prev => prev.filter(emp => emp.id !== id));
    }
    setActiveMenuId(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSubmit = (formData: Omit<Employee, 'id' | 'avatarUrl'>) => {
    if (editingId) {
      setEmployees(prev => prev.map(emp => 
        emp.id === editingId 
          ? { ...emp, ...formData } 
          : emp
      ));
    } else {
      const newEmployee: Employee = {
        id: `EMP-${Math.floor(Math.random() * 10000).toString().padStart(3, '0')}`,
        ...formData,
        avatarUrl: `https://picsum.photos/100/100?random=${Math.floor(Math.random() * 1000)}`
      };
      setEmployees([newEmployee, ...employees]);
    }
  };

  const currentEmployee = editingId 
    ? employees.find(e => e.id === editingId) || null
    : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Employees</h2>
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
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between bg-white">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder="Search by name or department..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Employee ID</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">First Name</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Name</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Position</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date Hired</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredEmployees.map((emp) => (
                <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
                    {emp.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img className="h-8 w-8 rounded-full object-cover border border-gray-200 mr-3" src={emp.avatarUrl} alt="" />
                      <div className="text-sm font-medium text-gray-900">{emp.firstName}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {emp.lastName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {emp.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {emp.position}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {emp.department}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(emp.status)}`}>
                      {emp.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(emp.dateHired).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative">
                    <div className="flex items-center justify-end gap-2">
                      <a href={`mailto:${emp.email}`} className="text-gray-400 hover:text-primary-500 p-1" title="Send Email">
                        <Mail size={16} />
                      </a>
                      
                      {canUpdate && (
                        <div className="relative">
                          <button 
                            onClick={() => setActiveMenuId(activeMenuId === emp.id ? null : emp.id)}
                            className={`p-1 rounded transition-colors ${activeMenuId === emp.id ? 'bg-primary-50 text-primary-600' : 'text-gray-400 hover:text-primary-500'}`}
                          >
                            <MoreHorizontal size={16} />
                          </button>

                          {/* Dropdown Menu */}
                          {activeMenuId === emp.id && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => setActiveMenuId(null)}></div>
                              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 z-20 py-1 text-left">
                                <button 
                                  onClick={() => handleEdit(emp)}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                >
                                  <Edit size={14} className="text-gray-500" /> Edit Details
                                </button>
                                {canDelete && (
                                  <button 
                                    onClick={() => handleDelete(emp.id)}
                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                  >
                                    <Trash2 size={14} className="text-red-500" /> Delete Employee
                                  </button>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      )}
                      
                      {!canUpdate && <Lock size={14} className="text-gray-300" />}
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
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
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
    </div>
  );
};

export default Employees;