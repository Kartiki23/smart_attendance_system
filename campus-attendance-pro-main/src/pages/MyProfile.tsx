import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  BookOpen,
  Edit,
  Save,
  X
} from "lucide-react";
import { CollegeHeader } from "@/components/CollegeHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import api from "@/services/api";
import { toast } from "sonner";

type RoleType = "student" | "faculty" | "parent" | "admin";

interface UserData {
  _id: string;
  fullName: string;
  email: string;
  role: RoleType;
}

interface StudentProfile {
  _id: string;
  rollNo?: string;
  department?: string;
  semester?: number;
  phone?: string;
  address?: string;
  bloodGroup?: string;
  dateOfBirth?: string;
  academicYear?: string;
  admissionDate?: string;
  class?: {
    _id: string;
    name?: string;
    department?: string;
    semester?: number;
  };
}

interface FacultyProfile {
  _id: string;
  employeeId?: string;
  department?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  subjects?: Array<{
    _id: string;
    name?: string;
    code?: string;
  }>;
}

interface ParentProfile {
  _id: string;
  relation?: string;
  contactNumber?: string;
  studentRollNumber?: string;
  address?: string;
  students?: Array<{
    _id: string;
    rollNo?: string;
    user?: {
      fullName?: string;
      email?: string;
    };
    class?: {
      name?: string;
      department?: string;
      semester?: number;
    };
  }>;
}

interface ProfileResponse {
  role: RoleType;
  user: UserData;
  profile: StudentProfile | FacultyProfile | ParentProfile | { user: UserData };
}

export default function MyProfile() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [profileData, setProfileData] = useState<ProfileResponse | null>(null);

  const [formData, setFormData] = useState<any>({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    bloodGroup: "",
    dateOfBirth: "",
    academicYear: "",
    admissionDate: "",
    department: "",
    semester: "",
    rollNo: "",
    employeeId: "",
    relation: "",
    contactNumber: "",
    studentRollNumber: ""
  });

  const role = profileData?.role;

  const studentProfile = role === "student" ? (profileData?.profile as StudentProfile) : null;
  const facultyProfile = role === "faculty" ? (profileData?.profile as FacultyProfile) : null;
  const parentProfile = role === "parent" ? (profileData?.profile as ParentProfile) : null;

  const childInfo = useMemo(() => {
    if (!parentProfile?.students?.length) return null;
    return parentProfile.students[0];
  }, [parentProfile]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get("/profile/me");
      const data: ProfileResponse = res.data.data;

      setProfileData(data);

      setFormData({
        fullName: data.user?.fullName || "",
        email: data.user?.email || "",
        phone:
          (data.role === "student" && (data.profile as StudentProfile)?.phone) ||
          (data.role === "faculty" && (data.profile as FacultyProfile)?.phone) ||
          "",
        address:
          (data.role === "student" && (data.profile as StudentProfile)?.address) ||
          (data.role === "faculty" && (data.profile as FacultyProfile)?.address) ||
          (data.role === "parent" && (data.profile as ParentProfile)?.address) ||
          "",
        bloodGroup:
          data.role === "student" ? (data.profile as StudentProfile)?.bloodGroup || "" : "",
        dateOfBirth:
          data.role === "student"
            ? formatDateForInput((data.profile as StudentProfile)?.dateOfBirth)
            : data.role === "faculty"
            ? formatDateForInput((data.profile as FacultyProfile)?.dateOfBirth)
            : "",
        academicYear:
          data.role === "student" ? (data.profile as StudentProfile)?.academicYear || "" : "",
        admissionDate:
          data.role === "student"
            ? formatDateForInput((data.profile as StudentProfile)?.admissionDate)
            : "",
        department:
          data.role === "student"
            ? (data.profile as StudentProfile)?.department || ""
            : data.role === "faculty"
            ? (data.profile as FacultyProfile)?.department || ""
            : "",
        semester:
          data.role === "student"
            ? String((data.profile as StudentProfile)?.semester || "")
            : "",
        rollNo:
          data.role === "student" ? (data.profile as StudentProfile)?.rollNo || "" : "",
        employeeId:
          data.role === "faculty" ? (data.profile as FacultyProfile)?.employeeId || "" : "",
        relation:
          data.role === "parent" ? (data.profile as ParentProfile)?.relation || "" : "",
        contactNumber:
          data.role === "parent" ? (data.profile as ParentProfile)?.contactNumber || "" : "",
        studentRollNumber:
          data.role === "parent" ? (data.profile as ParentProfile)?.studentRollNumber || "" : ""
      });
    } catch (error: any) {
      console.error("Profile load error:", error);
      toast.error(error.response?.data?.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleChange = (field: string, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleUpdateProfile = async () => {
    try {
      setSaving(true);

      const payload: any = {
        fullName: formData.fullName,
        email: formData.email
      };

      if (role === "student") {
        payload.phone = formData.phone;
        payload.address = formData.address;
        payload.bloodGroup = formData.bloodGroup;
        payload.dateOfBirth = formData.dateOfBirth || null;
        payload.academicYear = formData.academicYear;
        payload.admissionDate = formData.admissionDate || null;
        payload.department = formData.department;
        payload.semester = formData.semester ? Number(formData.semester) : null;
        payload.rollNo = formData.rollNo;
      }

      if (role === "faculty") {
        payload.phone = formData.phone;
        payload.address = formData.address;
        payload.dateOfBirth = formData.dateOfBirth || null;
        payload.department = formData.department;
        payload.employeeId = formData.employeeId;
      }

      if (role === "parent") {
        payload.address = formData.address;
        payload.relation = formData.relation;
        payload.contactNumber = formData.contactNumber;
        payload.studentRollNumber = formData.studentRollNumber;
      }

      const res = await api.put("/profile/update-me", payload);

      toast.success(res.data?.message || "Profile updated successfully");
      setEditing(false);
      await loadProfile();
    } catch (error: any) {
      console.error("Profile update error:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const goBackPath =
    role === "student"
      ? "/student"
      : role === "faculty"
      ? "/faculty"
      : role === "parent"
      ? "/parent"
      : "/admin";

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <CollegeHeader />
        <div className="flex justify-center items-center h-[70vh]">
          <p className="text-lg font-semibold">Loading Profile...</p>
        </div>
      </div>
    );
  }

  const initials =
    profileData?.user?.fullName
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "U";

  return (
    <div className="min-h-screen bg-background">
      <CollegeHeader />

      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button variant="ghost" onClick={() => navigate(goBackPath)} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-3xl font-bold text-primary mb-2">
                My Profile
              </h1>
              <p className="text-muted-foreground">
                View and manage your personal information
              </p>
            </div>

            {!editing ? (
              <Button className="gap-2" onClick={() => setEditing(true)}>
                <Edit className="w-4 h-4" />
                Edit Profile
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setEditing(false)}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleUpdateProfile} disabled={saving}>
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            )}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <Card className="card-professional">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="relative inline-block mb-4">
                    <div className="w-32 h-32 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center text-white text-4xl font-bold">
                      {initials}
                    </div>
                  </div>

                  <h2 className="font-display text-2xl font-bold text-primary mb-1">
                    {profileData?.user?.fullName}
                  </h2>
                  <p className="text-muted-foreground mb-1">{profileData?.user?.email}</p>
                  <p className="text-sm text-muted-foreground mb-6 capitalize">
                    {profileData?.role}
                  </p>

                  <div className="space-y-3 text-left">
                    {role === "student" && (
                      <>
                        <ProfileStat label="Department" value={studentProfile?.department} />
                        <ProfileStat
                          label="Semester"
                          value={studentProfile?.semester ? `Semester ${studentProfile.semester}` : "N/A"}
                        />
                        <ProfileStat label="Class" value={studentProfile?.class?.name} />
                      </>
                    )}

                    {role === "faculty" && (
                      <>
                        <ProfileStat label="Department" value={facultyProfile?.department} />
                        <ProfileStat label="Employee ID" value={facultyProfile?.employeeId} />
                        <ProfileStat
                          label="Subjects"
                          value={String(facultyProfile?.subjects?.length || 0)}
                        />
                      </>
                    )}

                    {role === "parent" && (
                      <>
                        <ProfileStat label="Relation" value={parentProfile?.relation} />
                        <ProfileStat label="Contact" value={parentProfile?.contactNumber} />
                        <ProfileStat label="Child Name" value={childInfo?.user?.fullName} />
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 space-y-6"
          >
            <Card className="card-professional">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Personal Information
                </CardTitle>
                <CardDescription>Your personal details and contact information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <EditableField
                    label="Full Name"
                    value={formData.fullName}
                    editing={editing}
                    onChange={(v) => handleChange("fullName", v)}
                  />

                  <EditableField
                    label="Email Address"
                    value={formData.email}
                    editing={editing}
                    icon={<Mail className="w-3 h-3" />}
                    onChange={(v) => handleChange("email", v)}
                  />

                  {(role === "student" || role === "faculty") && (
                    <>
                      <EditableField
                        label="Phone Number"
                        value={formData.phone}
                        editing={editing}
                        icon={<Phone className="w-3 h-3" />}
                        onChange={(v) => handleChange("phone", v)}
                      />

                      <EditableField
                        label="Date of Birth"
                        type="date"
                        value={formData.dateOfBirth}
                        editing={editing}
                        icon={<Calendar className="w-3 h-3" />}
                        onChange={(v) => handleChange("dateOfBirth", v)}
                      />

                      <EditableField
                        label="Address"
                        value={formData.address}
                        editing={editing}
                        icon={<MapPin className="w-3 h-3" />}
                        onChange={(v) => handleChange("address", v)}
                        className="md:col-span-2"
                      />
                    </>
                  )}

                  {role === "parent" && (
                    <>
                      <EditableField
                        label="Contact Number"
                        value={formData.contactNumber}
                        editing={editing}
                        icon={<Phone className="w-3 h-3" />}
                        onChange={(v) => handleChange("contactNumber", v)}
                      />

                      <EditableField
                        label="Relation"
                        value={formData.relation}
                        editing={editing}
                        onChange={(v) => handleChange("relation", v)}
                      />

                      <EditableField
                        label="Address"
                        value={formData.address}
                        editing={editing}
                        icon={<MapPin className="w-3 h-3" />}
                        onChange={(v) => handleChange("address", v)}
                        className="md:col-span-2"
                      />
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {role === "student" && (
              <Card className="card-professional">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Academic Information
                  </CardTitle>
                  <CardDescription>Your academic details and enrollment information</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ReadOnlyField label="Class" value={studentProfile?.class?.name} />
                    <EditableField
                      label="Roll Number"
                      value={formData.rollNo}
                      editing={editing}
                      onChange={(v) => handleChange("rollNo", v)}
                    />
                    <EditableField
                      label="Department"
                      value={formData.department}
                      editing={editing}
                      onChange={(v) => handleChange("department", v)}
                    />
                    <EditableField
                      label="Semester"
                      value={formData.semester}
                      editing={editing}
                      onChange={(v) => handleChange("semester", v)}
                    />
                    <EditableField
                      label="Academic Year"
                      value={formData.academicYear}
                      editing={editing}
                      onChange={(v) => handleChange("academicYear", v)}
                    />
                    <EditableField
                      label="Admission Date"
                      type="date"
                      value={formData.admissionDate}
                      editing={editing}
                      onChange={(v) => handleChange("admissionDate", v)}
                    />
                    <EditableField
                      label="Blood Group"
                      value={formData.bloodGroup}
                      editing={editing}
                      onChange={(v) => handleChange("bloodGroup", v)}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {role === "faculty" && (
              <Card className="card-professional">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Faculty Information
                  </CardTitle>
                  <CardDescription>Your department and teaching information</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <EditableField
                      label="Employee ID"
                      value={formData.employeeId}
                      editing={editing}
                      onChange={(v) => handleChange("employeeId", v)}
                    />
                    <EditableField
                      label="Department"
                      value={formData.department}
                      editing={editing}
                      onChange={(v) => handleChange("department", v)}
                    />
                    <div className="md:col-span-2">
                      <label className="text-xs text-muted-foreground">Assigned Subjects</label>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {facultyProfile?.subjects?.length ? (
                          facultyProfile.subjects.map((subject) => (
                            <span
                              key={subject._id}
                              className="px-3 py-1 rounded-full bg-muted text-sm"
                            >
                              {subject.name} {subject.code ? `(${subject.code})` : ""}
                            </span>
                          ))
                        ) : (
                          <p className="font-semibold text-foreground mt-1">No subjects assigned</p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {role === "parent" && (
              <Card className="card-professional">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Child Information
                  </CardTitle>
                  <CardDescription>Linked student information</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ReadOnlyField label="Student Name" value={childInfo?.user?.fullName} />
                    <EditableField
                      label="Student Roll Number"
                      value={formData.studentRollNumber}
                      editing={editing}
                      onChange={(v) => handleChange("studentRollNumber", v)}
                    />
                    <ReadOnlyField label="Class" value={childInfo?.class?.name} />
                    <ReadOnlyField label="Department" value={childInfo?.class?.department} />
                    <ReadOnlyField
                      label="Semester"
                      value={childInfo?.class?.semester ? `Semester ${childInfo.class.semester}` : "N/A"}
                    />
                    <ReadOnlyField label="Student Email" value={childInfo?.user?.email} />
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function formatDateForInput(date?: string) {
  if (!date) return "";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().split("T")[0];
}

function ProfileStat({ label, value }: { label: string; value?: string }) {
  return (
    <div className="p-3 rounded-lg bg-muted/50">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="font-semibold text-foreground">{value || "N/A"}</p>
    </div>
  );
}

function ReadOnlyField({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <label className="text-xs text-muted-foreground">{label}</label>
      <p className="font-semibold text-foreground mt-1">{value || "N/A"}</p>
    </div>
  );
}

function EditableField({
  label,
  value,
  editing,
  onChange,
  icon,
  type = "text",
  className = ""
}: {
  label: string;
  value?: string;
  editing: boolean;
  onChange?: (value: string) => void;
  icon?: React.ReactNode;
  type?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="text-xs text-muted-foreground flex items-center gap-1">
        {icon}
        {label}
      </label>
      {editing ? (
        <Input
          type={type}
          value={value || ""}
          onChange={(e) => onChange?.(e.target.value)}
          className="mt-2"
        />
      ) : (
        <p className="font-semibold text-foreground mt-1">{value || "N/A"}</p>
      )}
    </div>
  );
}