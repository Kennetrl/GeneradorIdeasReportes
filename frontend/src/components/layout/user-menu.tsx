"use client";

import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogOut, Settings } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function UserMenu() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  if (!user) return null;

  const handleLogout = async () => {
    await signOut();
    router.push("/login");
  };

  const getInitials = (email: string) => {
    return email
      .split("@")[0]
      .split(".")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const initials = getInitials(user.email || "");

  return (
    <div className="flex items-center gap-2">
      <Select defaultValue="menu">
        <SelectTrigger className="w-10 h-10 p-0 rounded-full border-2">
          <div className="flex items-center justify-center w-full h-full bg-primary text-primary-foreground text-xs font-bold rounded-full">
            {initials}
          </div>
        </SelectTrigger>
        <SelectContent align="end">
          <div className="px-2 py-1.5 text-sm text-muted-foreground pointer-events-none">
            {user.email}
          </div>
          <SelectItem value="admin">
            <Link href="/admin/users" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Admin
            </Link>
          </SelectItem>
          <SelectItem value="logout" onClick={handleLogout}>
            <button className="flex items-center gap-2 w-full">
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
