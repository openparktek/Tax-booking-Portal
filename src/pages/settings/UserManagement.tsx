import { useState, useEffect } from "react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Badge } from "../../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../components/ui/dialog";
import { Plus, Edit2, Trash2, User, AlertCircle, Search, Key } from "lucide-react";
import { rolesApi, usersApi, companiesApi } from "../../lib/api";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  inactive: "bg-gray-100 text-gray-700",
  suspended: "bg-red-100 text-red-700",
};

export default function UserManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [passwordUser, setPasswordUser] = useState<any>(null);
  const [isAddMode, setIsAddMode] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    roleId: "",
    companyId: "",
    phone: "",
    status: "active",
  });

  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersResponse, rolesResponse, companiesResponse] = await Promise.all([
        usersApi.getAll(),
        rolesApi.getAll(),
        companiesApi.getAll(),
      ]);

      if (usersResponse.success) {
        setUsers(usersResponse.data || []);
      }
      if (rolesResponse.success) {
        setRoles(rolesResponse.data || []);
      }
      if (companiesResponse.success) {
        setCompanies(companiesResponse.data || []);
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
    setEditingUser(null);
    setFormData({
      name: "",
      email: "",
      password: "",
      roleId: "",
      companyId: "",
      phone: "",
      status: "active",
    });
    setEditDialogOpen(true);
  };

  const handleEdit = (user: any) => {
    setIsAddMode(false);
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: "", // Don't show existing password
      roleId: user.roleId,
      companyId: user.companyId || "",
      phone: user.phone || "",
      status: user.status,
    });
    setEditDialogOpen(true);
  };

  const handleChangePassword = (user: any) => {
    setPasswordUser(user);
    setPasswordData({
      newPassword: "",
      confirmPassword: "",
    });
    setPasswordDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }

    if (!formData.email.trim()) {
      toast.error("Email is required");
      return;
    }

    if (!formData.roleId) {
      toast.error("Please select a role");
      return;
    }

    // Password validation only for new users
    if (isAddMode && !formData.password) {
      toast.error("Password is required for new users");
      return;
    }

    if (isAddMode && formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      if (isAddMode) {
        await usersApi.create(formData);
        toast.success("User created successfully!");
      } else {
        // Don't send password in update unless it's been changed
        const updateData = { ...formData };
        if (!updateData.password) {
          delete updateData.password;
        }
        await usersApi.update(editingUser.id, updateData);
        toast.success("User updated successfully!");
      }

      await loadData();
      setEditDialogOpen(false);
    } catch (error: any) {
      console.error("Error saving user:", error);
      toast.error(error.message || "Failed to save user");
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!passwordData.newPassword) {
      toast.error("New password is required");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      await usersApi.update(passwordUser.id, {
        password: passwordData.newPassword,
      });
      toast.success("Password updated successfully!");
      setPasswordDialogOpen(false);
    } catch (error: any) {
      console.error("Error updating password:", error);
      toast.error(error.message || "Failed to update password");
    }
  };

  const handleDelete = async (user: any) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete user "${user.name}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    setDeletingUserId(user.id);

    try {
      await usersApi.delete(user.id);
      toast.success("User deleted successfully!");
      await loadData();
    } catch (error: any) {
      console.error("Error deleting user:", error);
      toast.error(error.message || "Failed to delete user");
    } finally {
      setDeletingUserId(null);
    }
  };

  const getRoleName = (roleId: string) => {
    const role = roles.find((r) => r.id === roleId);
    return role?.name || "Unknown";
  };

  const getCompanyName = (companyId: string) => {
    if (!companyId) return "N/A";
    const company = companies.find((c) => c.id === companyId);
    return company?.name || "Unknown";
  };

  // Filter users
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      searchQuery === "" ||
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === "all" || user.roleId === roleFilter;
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Check if selected role requires company assignment
  const selectedRole = roles.find(r => r.id === formData.roleId);
  const requiresCompany = selectedRole?.name === "Company Manager" || 
                         selectedRole?.name === "Company Cashier";

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-gray-900 mb-1">User Management</h1>
          <p className="text-gray-600">Manage system users and their access</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="grid grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Search users..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {roles.map((role) => (
                <SelectItem key={role.id} value={role.id}>
                  {role.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery("");
              setRoleFilter("all");
              setStatusFilter("all");
            }}
          >
            Clear Filters
          </Button>
        </div>
      </Card>

      {/* Users Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-3 px-4 text-sm text-gray-600">User</th>
                <th className="text-left py-3 px-4 text-sm text-gray-600">Email</th>
                <th className="text-left py-3 px-4 text-sm text-gray-600">Role</th>
                <th className="text-left py-3 px-4 text-sm text-gray-600">Company</th>
                <th className="text-left py-3 px-4 text-sm text-gray-600">Status</th>
                <th className="text-left py-3 px-4 text-sm text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    Loading users...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12">
                    <div className="flex flex-col items-center justify-center text-center">
                      <AlertCircle className="w-12 h-12 text-gray-300 mb-3" />
                      <p className="text-gray-900 mb-1">No Users Found</p>
                      <p className="text-sm text-gray-500 mb-4">
                        {searchQuery || roleFilter !== "all" || statusFilter !== "all"
                          ? "Try adjusting your filters"
                          : "Create your first user to get started"}
                      </p>
                      {!searchQuery && roleFilter === "all" && statusFilter === "all" && (
                        <Button onClick={handleAdd}>
                          <Plus className="w-4 h-4 mr-2" />
                          Add User
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-gray-100">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-900">{user.name}</p>
                          {user.phone && (
                            <p className="text-xs text-gray-500">{user.phone}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">{user.email}</td>
                    <td className="py-4 px-4 text-sm text-gray-900">
                      {getRoleName(user.roleId)}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">
                      {getCompanyName(user.companyId)}
                    </td>
                    <td className="py-4 px-4">
                      <Badge
                        variant="secondary"
                        className={statusColors[user.status] || statusColors.active}
                      >
                        {user.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEdit(user)}
                          title="Edit user"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleChangePassword(user)}
                          title="Change password"
                        >
                          <Key className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDelete(user)}
                          disabled={deletingUserId === user.id}
                          title="Delete user"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between p-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Showing {filteredUsers.length} of {users.length} users
          </p>
        </div>
      </Card>

      {/* Edit/Add User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{isAddMode ? "Add New User" : "Edit User"}</DialogTitle>
            <DialogDescription>
              {isAddMode
                ? "Create a new user account with role assignment and password"
                : "Update user information and role"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="John Doe"
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  placeholder="john@example.com"
                  required
                />
              </div>
            </div>

            {isAddMode && (
              <div>
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, password: e.target.value }))
                  }
                  placeholder="Minimum 6 characters"
                  required={isAddMode}
                  minLength={6}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Password must be at least 6 characters
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="roleId">Role *</Label>
                <Select
                  value={formData.roleId}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, roleId: value }))
                  }
                >
                  <SelectTrigger id="roleId">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  placeholder="+1 234 567 8900"
                />
              </div>
            </div>

            {requiresCompany && (
              <div>
                <Label htmlFor="companyId">Company {requiresCompany ? "*" : ""}</Label>
                <Select
                  value={formData.companyId}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, companyId: value }))
                  }
                >
                  <SelectTrigger id="companyId">
                    <SelectValue placeholder="Select company" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {!isAddMode && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-700">
                  <Key className="w-4 h-4 inline mr-1" />
                  To change the password, use the "Change Password" button in the user list.
                </p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {isAddMode ? "Create User" : "Update User"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Set a new password for {passwordUser?.name}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData((prev) => ({ ...prev, newPassword: e.target.value }))
                }
                placeholder="Enter new password"
                required
                minLength={6}
              />
              <p className="text-xs text-gray-500 mt-1">
                Password must be at least 6 characters
              </p>
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData((prev) => ({ ...prev, confirmPassword: e.target.value }))
                }
                placeholder="Confirm new password"
                required
                minLength={6}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setPasswordDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                Update Password
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
