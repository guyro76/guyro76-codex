"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState({ total_users: 0, total_projects: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (
      status === "authenticated" &&
      (session?.user as any)?.email !== "guyro76@gmail.com"
    ) {
      toast.error("גישת מנהל בלבד");
      router.push("/dashboard");
      return;
    }

    // Load admin data
    loadAdminData();
  }, [status, session, router]);

  const loadAdminData = async () => {
    try {
      // Mock data - in production, fetch from /api/admin
      setStats({
        total_users: 1,
        total_projects: 0,
      });
      setUsers([
        {
          id: "1",
          email: "guyro76@gmail.com",
          name: "גיא רוזנברג",
          role: "admin",
          createdAt: new Date().toISOString(),
        },
      ]);
    } catch (error) {
      toast.error("שגיאה בטעינת נתונים");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse">טוען...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen surface py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">🔐 ניהול מערכת</h1>
          <p className="ink-muted">
            מנהל אוגר: {(session?.user as any)?.email}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="surface border edge rounded-lg p-6">
            <p className="ink-muted mb-2">משתמשים רשומים</p>
            <p className="text-3xl font-bold">{stats.total_users}</p>
          </div>

          <div className="surface border edge rounded-lg p-6">
            <p className="ink-muted mb-2">פרויקטים כוללים</p>
            <p className="text-3xl font-bold">{stats.total_projects}</p>
          </div>

          <div className="surface border edge rounded-lg p-6">
            <p className="ink-muted mb-2">סטטוס מערכת</p>
            <p className="accent-ink font-bold">✅ פעיל</p>
          </div>
        </div>

        {/* Users Table */}
        <div className="surface border edge rounded-lg overflow-hidden">
          <div className="p-6 border-b edge">
            <h2 className="text-xl font-bold">משתמשים</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b edge surface-solid/50">
                  <th className="px-6 py-3 text-right">דואר אלקטרוני</th>
                  <th className="px-6 py-3 text-right">שם</th>
                  <th className="px-6 py-3 text-right">תפקיד</th>
                  <th className="px-6 py-3 text-right">תאריך הצטרפות</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b edge hover:surface-solid/30"
                  >
                    <td className="px-6 py-4">{user.email}</td>
                    <td className="px-6 py-4">{user.name}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded text-xs font-medium ${
                          user.role === "admin"
                            ? "bg-red-500/20 accent-ink"
                            : "bg-blue-500/20 accent-ink"
                        }`}
                      >
                        {user.role === "admin" ? "מנהל" : "משתמש"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {new Date(user.createdAt).toLocaleDateString("he-IL")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Settings Section */}
        <div className="mt-8 surface border edge rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">הגדרות API</h2>
          <div className="space-y-2 text-sm ink-muted">
            <p>✅ Google OAuth: מוגדר</p>
            <p>✅ Claude API: מוגדר</p>
            <p>✅ Image Search: פעיל</p>
            <p>⚠️ Apple OAuth: בהמתנה לקונפיגורציה</p>
          </div>
        </div>
      </div>
    </div>
  );
}
