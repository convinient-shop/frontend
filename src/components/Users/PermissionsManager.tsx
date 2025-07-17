'use client';

import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store';
import { useAppSelector } from '@/redux/store';
import { Toaster, toast } from 'react-hot-toast';
import { 
  fetchPermissions, 
  fetchUserPermissions, 
  updateUserPermissions, 
  createPermission 
} from '@/redux/features/permission-slice';

interface Permission {
  id: string;
  name: string;
  description: string;
  group: string;
}

interface PermissionsManagerProps {
  userId: string;
}

const PermissionsManager = ({ userId }: PermissionsManagerProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const { permissions, userPermissions, loading } = useAppSelector(
    (state: RootState) => state.permission
  );
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [showNewPermissionModal, setShowNewPermissionModal] = useState(false);
  const [newPermission, setNewPermission] = useState({
    name: '',
    description: '',
    group: '',
  });

  useEffect(() => {
    const loadPermissions = async () => {
      try {
        await Promise.all([
          dispatch(fetchPermissions()).unwrap(),
          dispatch(fetchUserPermissions(userId)).unwrap()
        ]);
      } catch (error) {
        toast.error('Failed to load permissions');
      }
    };
    loadPermissions();
  }, [dispatch, userId]);

  useEffect(() => {
    if (userPermissions) {
      setSelectedPermissions(userPermissions.map((p: Permission) => p.id));
    }
  }, [userPermissions]);

  const handlePermissionToggle = (permissionId: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleSavePermissions = async () => {
    try {
      await dispatch(updateUserPermissions({ 
        userId, 
        permissions: selectedPermissions 
      })).unwrap();
      toast.success('Permissions updated successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update permissions';
      toast.error(errorMessage);
    }
  };

  const handleCreatePermission = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(createPermission(newPermission)).unwrap();
      setShowNewPermissionModal(false);
      setNewPermission({ name: '', description: '', group: '' });
      toast.success('Permission created successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create permission';
      toast.error(errorMessage);
    }
  };

  const permissionGroups = [
    'User Management',
    'Order Management',
    'Product Management',
    'Content Management',
    'System Settings',
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="border-b border-gray-3 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Permissions Management</h2>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowNewPermissionModal(true)}
              className="bg-blue text-white px-4 py-2 rounded-md hover:bg-blue-dark transition-colors"
            >
              Add Permission
            </button>
            <button
              onClick={handleSavePermissions}
              className="bg-green text-white px-4 py-2 rounded-md hover:bg-green-dark transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>

      {/* Permissions List */}
      <div className="p-6">
        {permissionGroups.map((group) => (
          <div key={group} className="mb-6">
            <h3 className="text-lg font-medium mb-4">{group}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {permissions
                .filter((p: Permission) => p.group === group)
                .map((permission: Permission) => (
                  <div
                    key={permission.id}
                    className="flex items-center p-4 border border-gray-3 rounded-lg hover:bg-gray-1"
                  >
                    <input
                      type="checkbox"
                      id={permission.id}
                      checked={selectedPermissions.includes(permission.id)}
                      onChange={() => handlePermissionToggle(permission.id)}
                      className="w-4 h-4 text-blue border-gray-3 rounded focus:ring-blue"
                    />
                    <label
                      htmlFor={permission.id}
                      className="ml-3 flex flex-col cursor-pointer"
                    >
                      <span className="font-medium">{permission.name}</span>
                      <span className="text-sm text-gray-500">
                        {permission.description}
                      </span>
                    </label>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>

      {/* New Permission Modal */}
      {showNewPermissionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-semibold mb-6">Add New Permission</h2>
            <form onSubmit={handleCreatePermission} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={newPermission.name}
                  onChange={(e) =>
                    setNewPermission({ ...newPermission, name: e.target.value })
                  }
                  className="w-full rounded-md border border-gray-3 bg-gray-1 py-2 px-4 outline-none focus:border-blue"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newPermission.description}
                  onChange={(e) =>
                    setNewPermission({ ...newPermission, description: e.target.value })
                  }
                  className="w-full rounded-md border border-gray-3 bg-gray-1 py-2 px-4 outline-none focus:border-blue"
                  rows={3}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Group
                </label>
                <select
                  value={newPermission.group}
                  onChange={(e) =>
                    setNewPermission({ ...newPermission, group: e.target.value })
                  }
                  className="w-full rounded-md border border-gray-3 bg-gray-1 py-2 px-4 outline-none focus:border-blue"
                  required
                >
                  <option value="">Select a group</option>
                  {permissionGroups.map((group) => (
                    <option key={group} value={group}>
                      {group}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowNewPermissionModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue text-white px-4 py-2 rounded-md hover:bg-blue-dark transition-colors"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PermissionsManager; 