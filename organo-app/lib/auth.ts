import { redirect } from "next/navigation";
import { auth, neonAuthConfigured } from "@/lib/neon/auth-server";
import { getSql } from "@/lib/neon/db";

export type CurrentAccess = {
  id: string;
  email: string;
  fullName: string;
  isAdmin: boolean;
  accessStatus: string;
};

type ProfileRow = {
  id: string;
  email: string;
  full_name: string;
  platform_role: string;
  access_status: string;
};

export async function getCurrentAccess(): Promise<CurrentAccess | null> {
  if (!neonAuthConfigured || !process.env.DATABASE_URL) return null;

  const { data: session } = await auth.getSession();
  const user = session?.user;
  if (!user?.id || !user.email) return null;

  const id = String(user.id);
  const email = user.email.trim().toLowerCase();
  const fullName = user.name || "";
  const owner = email === "guyro76@gmail.com";
  const sql = getSql();

  const invitations = await sql`
    select id, organization_id, role
    from public.invitations
    where lower(email) = ${email}
      and status = 'pending'
      and expires_at > now()
    order by created_at desc
    limit 1
  `;
  const invitation = invitations[0] as { id: string; organization_id: string | null; role: string } | undefined;
  const initialStatus = owner || invitation ? "active" : "pending";
  const initialRole = owner ? "platform_admin" : "user";

  await sql`
    insert into public.profiles(id,email,full_name,platform_role,access_status,last_login_at)
    values(${id},${email},${fullName},${initialRole},${initialStatus},now())
    on conflict(id) do update set
      email = excluded.email,
      full_name = case when public.profiles.full_name = '' then excluded.full_name else public.profiles.full_name end,
      last_login_at = now(),
      updated_at = now()
  `;

  if (invitation) {
    await sql`
      update public.invitations
      set status = 'accepted'
      where id = ${invitation.id}
    `;
    if (invitation.organization_id) {
      await sql`
        insert into public.organization_members(organization_id,user_id,role,status)
        values(${invitation.organization_id},${id},${invitation.role},'active')
        on conflict(organization_id,user_id) do update set
          role = excluded.role,
          status = 'active'
      `;
    }
  }

  const rows = await sql`
    select id,email,full_name,platform_role,access_status
    from public.profiles
    where id = ${id}
    limit 1
  `;
  const profile = rows[0] as ProfileRow | undefined;
  if (!profile) return null;

  return {
    id: profile.id,
    email: profile.email,
    fullName: profile.full_name || fullName,
    isAdmin: profile.platform_role === "platform_admin" || owner,
    accessStatus: owner ? "active" : profile.access_status,
  };
}

export async function requireActiveUser() {
  const access = await getCurrentAccess();
  if (!access || access.accessStatus !== "active") redirect("/login");
  return access;
}

export async function requirePlatformAdmin() {
  const access = await requireActiveUser();
  if (!access.isAdmin) redirect("/");
  return access;
}
