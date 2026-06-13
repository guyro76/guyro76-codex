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
    <div className="min-h-screen bg-slate-950 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">🔐 ניהול מערכת</h1>
          <p className="text-slate-400">
            מנהל אוגר: {(session?.user as any)?.email}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
            <p className="text-slate-400 mb-2">משתמשים רשומים</p>
            <p className="text-3xl font-bold">{stats.total_users}</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
            <p className="text-slate-400 mb-2">פרויקטים כוללים</p>
            <p className="text-3xl font-bold">{stats.total_projects}</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
            <p className="text-slate-400 mb-2">סטטוס מערכת</p>
            <p className="text-green-400 font-bold">✅ פעיל</p>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
          <div className="p-6 border-b border-slate-800">
            <h2 className="text-xl font-bold">משתמשים</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-800/50">
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
                    className="border-b border-slate-800 hover:bg-slate-800/30"
                  >
                    <td className="px-6 py-4">{user.email}</td>
                    <td className="px-6 py-4">{user.name}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded text-xs font-medium ${
                          user.role === "admin"
                            ? "bg-red-500/20 text-red-300"
                            : "bg-blue-500/20 text-blue-300"
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
        <div className="mt-8 bg-slate-900 border border-slate-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">הגדרות API</h2>
          <div className="space-y-2 text-sm text-slate-400">
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
