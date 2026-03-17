"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/context/auth-context";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  email: string;
  full_name?: string;
  role: "viewer" | "editor" | "admin";
  created_at: string;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const { user: currentUser, loading: authLoading } = useAuth();
  const supabase = createClient();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<{
    [key: string]: string;
  }>({});

  // Check if user is admin
  useEffect(() => {
    if (!authLoading && currentUser) {
      fetchUserRole();
    }
  }, [currentUser, authLoading]);

  const fetchUserRole = async () => {
    if (!currentUser) return;

    try {
      const response = await fetch("/api/v1/admin/users", {
        headers: {
          Authorization: `Bearer ${(
            await supabase.auth.getSession()
          ).data.session?.access_token}`,
        },
      });

      if (response.status === 403) {
        router.push("/");
        return;
      }

      if (!response.ok) throw new Error("Failed to fetch users");

      const data = await response.json();
      setUsers(data.users);

      // Initialize selected roles
      const roles: { [key: string]: string } = {};
      data.users.forEach((u: User) => {
        roles[u.id] = u.role;
      });
      setSelectedRole(roles);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    setSelectedRole((prev) => ({ ...prev, [userId]: newRole }));

    try {
      const session = await supabase.auth.getSession();
      const response = await fetch(`/api/v1/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.data.session?.access_token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Failed to update role");
      }

      // Refresh users list
      await fetchUserRole();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update role");
      // Revert selection
      if (users.find((u) => u.id === userId)) {
        setSelectedRole((prev) => ({
          ...prev,
          [userId]: users.find((u) => u.id === userId)!.role,
        }));
      }
    }
  };

  if (authLoading || loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground">Manage user roles and permissions</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded text-sm text-red-600">
          {error}
        </div>
      )}

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold">
                  Joined
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-muted/50">
                  <td className="px-6 py-4 text-sm">{u.email}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {u.full_name || "-"}
                  </td>
                  <td className="px-6 py-4">
                    {u.id === currentUser?.id ? (
                      <span className="px-2.5 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                        {selectedRole[u.id] || u.role}
                      </span>
                    ) : (
                      <Select
                        value={selectedRole[u.id] || u.role}
                        onValueChange={(newRole) =>
                          handleRoleChange(u.id, newRole)
                        }
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="viewer">Viewer</SelectItem>
                          <SelectItem value="editor">Editor</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
