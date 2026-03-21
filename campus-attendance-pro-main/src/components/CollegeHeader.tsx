import { LogOut, User } from "lucide-react";
import { Button } from "./ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

interface CollegeHeaderProps {
    showUserInfo?: boolean;
}

export function CollegeHeader({ showUserInfo = true }: CollegeHeaderProps) {
    const { user, signOut } = useAuth();
     const navigate = useNavigate();

    return (
        <header className="institutional-header sticky top-0 z-50">
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    {/* Left: College Branding */}
                    <div className="flex items-center gap-4">
                        {/* College Emblem */}
                        <div className="w-12 h-12 rounded-full flex items-center justify-center">
                            <img
                                src="/college-logo.png"
                                alt="Government Polytechnic Awasari Logo"
                                className="w-full h-full object-contain"
                            />
                        </div>

                        {/* College Info */}
                        <div className="hidden md:block">
                            <h1 className="font-display font-bold text-base text-primary leading-tight">
                                Government Polytechnic, Awasari (Kh.)
                            </h1>
                            <p className="text-xs text-muted-foreground">
                                Attendance Management System
                            </p>
                        </div>
                    </div>

                    {/* Right: User Info & Logout */}
                    {showUserInfo && user && (
                        <div className="flex items-center gap-4">
                            <div className="hidden sm:flex items-center gap-3">
                                <div className="text-right">
                                    <p className="text-sm font-medium text-foreground">
                                        {user.fullName || "User"}
                                    </p>
                                    <p className="text-xs text-muted-foreground capitalize">
                                        {user.role}
                                    </p>
                                </div>
                                <Button onClick={() =>navigate('/my-profile')}>
                                <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                                    <User className="w-5 h-5 text-muted-foreground" />
                                </div>
                                </Button>
                            </div>

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={signOut}
                                className="text-muted-foreground hover:text-foreground"
                            >
                                <LogOut className="w-4 h-4 sm:mr-2" />
                                <span className="hidden sm:inline">Logout</span>
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
