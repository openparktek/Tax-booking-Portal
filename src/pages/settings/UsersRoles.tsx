import { useState, useEffect } from "react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Badge } from "../../components/ui/badge";
import { Checkbox } from "../../components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../components/ui/dialog";
import { Plus, Edit2, Trash2, Shield, AlertCircle } from "lucide-react";
import { rolesApi, usersApi } from "../../lib/api";
import { toast } from "sonner";

const availablePermissions = [
  { id: "dashboard", label: "Dashboard" },
  { id: "bookings", label: "Bookings Management" },
  { id: "companies", label: "Companies Management" },
  { id: "drivers", label: "Drivers Management" },
  { id: "fleet", label: "Fleet Management" },
  { id: "trips", label: "Live Trips" },
  { id: "settlements", label: "Settlements & Finance" },
  { id: "fares", label: "Fares & Zones" },
  { id: "alerts", label: "Alerts & Incidents" },
  { id: "audit", label: "Audit Log" },
  { id: "settings", label: "System Settings" },
  { id: "users", label: "User Management" },
];

export default function UsersRoles() {
  const [roles, setRoles] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);
  const [isAddMode, setIsAddMode] = useState(false);
  const [deletingRoleId, setDeletingRoleId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    permissions: [] as string[],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [rolesResponse, usersResponse] = await Promise.all([
        rolesApi.getAll(),
        usersApi.getAll(),
      ]);

      if (rolesResponse.success) {
        setRoles(rolesResponse.data || []);
      }
      if (usersResponse.success) {
        setUsers(usersResponse.data || []);
      }
    } catch (error: any) {
      console.error("Error loading data:", error);
      toast.error(error.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setIsAddMode(true);
    setEditingRole(null);
    setFormData({
      name: "",
      description: "",
      permissions: [],
    });
    setEditDialogOpen(true);
  };

  const handleEdit = (role: any) => {
    setIsAddMode(false);
    setEditingRole(role);
    setFormData({
      name: role.name,
      description: role.description,
      permissions: role.permissions || [],
    });
    setEditDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Role name is required");
      return;
    }

    if (formData.permissions.length === 0) {
      toast.error("Please select at least one permission");
      return;
    }

    try {
      if (isAddMode) {
        await rolesApi.create(formData);
        toast.success("Role created successfully!");
      } else {
        await rolesApi.update(editingRole.id, formData);
        toast.success("Role updated successfully!");
      }

      await loadData();
      setEditDialogOpen(false);
    } catch (error: any) {
      console.error("Error saving role:", error);
      toast.error(error.message || "Failed to save role");
    }
  };

  const handleDelete = async (role: any) => {
    // Count users with this role
    const usersWithRole = users.filter(user => user.roleId === role.id);
    
    if (usersWithRole.length > 0) {
      toast.error(`Cannot delete role: ${usersWithRole.length} user(s) are assigned to this role`);
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete the role "${role.name}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    setDeletingRoleId(role.id);

    try {
      await rolesApi.delete(role.id);
      toast.success("Role deleted successfully!");
      await loadData();
    } catch (error: any) {
      console.error("Error deleting role:", error);
      toast.error(error.message || "Failed to delete role");
    } finally {
      setDeletingRoleId(null);
    }
  };

  const handlePermissionToggle = (permissionId: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(p => p !== permissionId)
        : [...prev.permissions, permissionId],
    }));
  };

  const getUserCount = (roleId: string) => {
    return users.filter(user => user.roleId === roleId).length;
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-gray-900 mb-1">User Roles & Permissions</h1>
          <p className="text-gray-600">
            Manage system roles and their access permissions
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Add Role
        </Button>
      </div>

      {loading ? (
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <p className="text-gray-500">Loading roles...</p>
          </div>
        </Card>
      ) : roles.length === 0 ? (
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <AlertCircle className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-gray-900 mb-1">No Roles Found</p>
            <p className="text-sm text-gray-500 mb-4">
              Create your first role to get started
            </p>
            <Button onClick={handleAdd}>
              <Plus className="w-4 h-4 mr-2" />
              Add Role
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {roles.map((role) => (
            <Card key={role.id} className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-gray-900 mb-1">{role.name}</h3>
                    <p className="text-sm text-gray-600">{role.description}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleEdit(role)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDelete(role)}
                    disabled={deletingRoleId === role.id}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2">Permissions:</p>
                <div className="flex flex-wrap gap-2">
                  {role.permissions?.map((permission: string) => (
                    <Badge key={permission} variant="secondary" className="bg-blue-50 text-blue-700">
                      {availablePermissions.find(p => p.id === permission)?.label || permission}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  {getUserCount(role.id)} user(s) assigned
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Edit/Add Role Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isAddMode ? "Add New Role" : "Edit Role"}</DialogTitle>
            <DialogDescription>
              {isAddMode
                ? "Create a new role and assign permissions"
                : "Update role information and permissions"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Role Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="e.g., Company Manager"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Brief description of this role"
                required
              />
            </div>

            <div>
              <Label className="mb-3 block">Permissions</Label>
              <div className="grid grid-cols-2 gap-3">
                {availablePermissions.map((permission) => (
                  <div key={permission.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={permission.id}
                      checked={formData.permissions.includes(permission.id)}
                      onCheckedChange={() => handlePermissionToggle(permission.id)}
                    />
                    <label
                      htmlFor={permission.id}
                      className="text-sm text-gray-700 cursor-pointer"
                    >
                      {permission.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {isAddMode ? "Create Role" : "Update Role"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
