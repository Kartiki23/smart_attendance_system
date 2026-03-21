import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  UserPlus,
  Search,
  MoreVertical,
  Trash2,
  Edit,
  Mail,
  GraduationCap,
  UserCheck,
  UserCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import adminService, { User } from "@/services/adminService";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/DashboardLayout";

const roleColors = {
  admin: "bg-red-100 text-red-700 border-red-200",
  faculty: "bg-blue-100 text-blue-700 border-blue-200",
  student: "bg-green-100 text-green-700 border-green-200",
  parent: "bg-purple-100 text-purple-700 border-purple-200"
};

const roleIcons = {
  admin: UserCheck,
  faculty: GraduationCap,
  student: Users,
  parent: UserCircle
};

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const [newUser, setNewUser] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "faculty" as "admin" | "faculty" | "student" | "parent",
    department: "",
    employeeId: "",
    rollNo: "",
    semester: 1,
    studentRollNumber: "",
    relation: "Guardian" as "Father" | "Mother" | "Guardian",
    contactNumber: ""
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchQuery, selectedRole]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllUsers();
      setUsers(data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to fetch users");
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    if (selectedRole !== "all") {
      filtered = filtered.filter((user) => user.role === selectedRole);
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (user) =>
          user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      await adminService.deleteUser(userId);
      toast.success("User deleted successfully");
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete user");
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      await adminService.createUser(newUser);

      toast.success("User created successfully");
      setIsCreateDialogOpen(false);

      setNewUser({
        fullName: "",
        email: "",
        password: "",
        role: "faculty",
        department: "",
        employeeId: "",
        rollNo: "",
        semester: 1,
        studentRollNumber: "",
        relation: "Guardian",
        contactNumber: ""
      });

      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create user");
    } finally {
      setIsCreating(false);
    }
  };

  const getRoleCount = (role: string) => {
    if (role === "all") return users.length;
    return users.filter((u) => u.role === role).length;
  };

  return (
    <DashboardLayout role="admin">
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="font-display text-3xl font-bold text-primary mb-2">
                  User Management
                </h1>
                <p className="text-muted-foreground">
                  Manage all system users - Students, Faculty, Parents, and Administrators
                </p>
              </div>

              <Button
                className="bg-primary hover:bg-primary/90 gap-2"
                onClick={() => setIsCreateDialogOpen(true)}
              >
                <UserPlus className="w-4 h-4" />
                Add New User
              </Button>
            </div>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div
              className="card-professional p-6 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedRole("all")}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold text-primary">{getRoleCount("all")}</p>
                </div>
              </div>
            </div>

            <div
              className="card-professional p-6 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedRole("student")}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Students</p>
                  <p className="text-2xl font-bold text-primary">{getRoleCount("student")}</p>
                </div>
              </div>
            </div>

            <div
              className="card-professional p-6 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedRole("faculty")}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Faculty</p>
                  <p className="text-2xl font-bold text-primary">{getRoleCount("faculty")}</p>
                </div>
              </div>
            </div>

            <div
              className="card-professional p-6 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedRole("parent")}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <UserCircle className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Parents</p>
                  <p className="text-2xl font-bold text-primary">{getRoleCount("parent")}</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="card-professional mb-8">
              <CardHeader>
                <CardTitle className="text-lg">Filter Users</CardTitle>
                <CardDescription>Search and filter users by role</CardDescription>
              </CardHeader>

              <CardContent>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger className="w-full md:w-[200px]">
                      <SelectValue placeholder="All Roles" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="student">Students</SelectItem>
                      <SelectItem value="faculty">Faculty</SelectItem>
                      <SelectItem value="parent">Parents</SelectItem>
                      <SelectItem value="admin">Administrators</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="card-professional">
              <CardHeader>
                <CardTitle>
                  {selectedRole === "all"
                    ? "All Users"
                    : `${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}s`}
                </CardTitle>
                <CardDescription>
                  Showing {filteredUsers.length} of {users.length} users
                </CardDescription>
              </CardHeader>

              <CardContent>
                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Loading users...</p>
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No users found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                            User
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                            Email
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                            Role
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                            Joined
                          </th>
                          <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">
                            Actions
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {filteredUsers.map((user, index) => {
                          const RoleIcon = roleIcons[user.role];

                          return (
                            <motion.tr
                              key={user._id}
                              className="border-b border-border hover:bg-muted/50 transition-colors"
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3, delay: index * 0.05 }}
                            >
                              <td className="py-4 px-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                    <RoleIcon className="w-5 h-5 text-primary" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-foreground">{user.fullName}</p>
                                  </div>
                                </div>
                              </td>

                              <td className="py-4 px-4">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Mail className="w-4 h-4" />
                                  {user.email}
                                </div>
                              </td>

                              <td className="py-4 px-4">
                                <Badge className={`${roleColors[user.role]} border`}>
                                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                </Badge>
                              </td>

                              <td className="py-4 px-4 text-sm text-muted-foreground">
                                {new Date(user.createdAt).toLocaleDateString()}
                              </td>

                              <td className="py-4 px-4 text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <MoreVertical className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>

                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem>
                                      <Edit className="w-4 h-4 mr-2" />
                                      Edit User
                                    </DropdownMenuItem>

                                    <DropdownMenuItem
                                      onClick={() => handleDeleteUser(user._id)}
                                      className="text-red-600"
                                    >
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Delete User
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </td>
                            </motion.tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
                <DialogDescription>
                  Create a new user account for students, faculty, parents, or administrators
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleCreateUser} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={newUser.fullName}
                    onChange={(e) =>
                      setNewUser({ ...newUser, fullName: e.target.value })
                    }
                    placeholder="Enter full name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) =>
                      setNewUser({ ...newUser, email: e.target.value })
                    }
                    placeholder="email@example.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newUser.password}
                    onChange={(e) =>
                      setNewUser({ ...newUser, password: e.target.value })
                    }
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role *</Label>
                  <Select
                    value={newUser.role}
                    onValueChange={(value: any) =>
                      setNewUser({ ...newUser, role: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="faculty">Faculty</SelectItem>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="parent">Parent</SelectItem>
                      <SelectItem value="admin">Administrator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {(newUser.role === "faculty" || newUser.role === "student") && (
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      value={newUser.department}
                      onChange={(e) =>
                        setNewUser({ ...newUser, department: e.target.value })
                      }
                      placeholder="e.g., Computer Engineering"
                    />
                  </div>
                )}

                {newUser.role === "faculty" && (
                  <div className="space-y-2">
                    <Label htmlFor="employeeId">Employee ID</Label>
                    <Input
                      id="employeeId"
                      value={newUser.employeeId}
                      onChange={(e) =>
                        setNewUser({ ...newUser, employeeId: e.target.value })
                      }
                      placeholder="e.g., EMP001"
                    />
                  </div>
                )}

                {newUser.role === "student" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="rollNo">Roll Number</Label>
                      <Input
                        id="rollNo"
                        value={newUser.rollNo}
                        onChange={(e) =>
                          setNewUser({ ...newUser, rollNo: e.target.value })
                        }
                        placeholder="e.g., 2024001"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="semester">Semester</Label>
                      <Select
                        value={newUser.semester.toString()}
                        onValueChange={(value) =>
                          setNewUser({
                            ...newUser,
                            semester: parseInt(value)
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5, 6].map((sem) => (
                            <SelectItem key={sem} value={sem.toString()}>
                              Semester {sem}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {newUser.role === "parent" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="studentRollNumber">Student Roll Number *</Label>
                      <Input
                        id="studentRollNumber"
                        value={newUser.studentRollNumber}
                        onChange={(e) =>
                          setNewUser({
                            ...newUser,
                            studentRollNumber: e.target.value
                          })
                        }
                        placeholder="Enter linked student's roll number"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="relation">Relation</Label>
                      <Select
                        value={newUser.relation}
                        onValueChange={(value: "Father" | "Mother" | "Guardian") =>
                          setNewUser({ ...newUser, relation: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Father">Father</SelectItem>
                          <SelectItem value="Mother">Mother</SelectItem>
                          <SelectItem value="Guardian">Guardian</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contactNumber">Contact Number</Label>
                      <Input
                        id="contactNumber"
                        value={newUser.contactNumber}
                        onChange={(e) =>
                          setNewUser({
                            ...newUser,
                            contactNumber: e.target.value
                          })
                        }
                        placeholder="Enter contact number"
                      />
                    </div>
                  </>
                )}

                <div className="flex gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    className="flex-1 bg-primary hover:bg-primary/90"
                    disabled={isCreating}
                  >
                    {isCreating ? "Creating..." : "Create User"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </DashboardLayout>
  );
}