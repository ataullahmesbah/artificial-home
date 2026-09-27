import type { Metadata } from "next";
import { cookies } from "next/headers";
import { requireAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/admin/ui";
import { PasswordForm, ProfileForm } from "@/components/admin/account-forms";

export const metadata: Metadata = { title: "My account" };

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ reset?: string }> }) {
  const admin = await requireAdmin();
  const { reset } = await searchParams;
  const jar = await cookies();
  const isReset = reset === "1" && jar.get("pw_reset")?.value === "1";
  return (
    <>
      <PageHeader title="My account" description={`Signed in as ${admin.email} · Role: ${admin.role}`} />
      <div className="space-y-6">
        {isReset && <PasswordForm reset />}
        <ProfileForm name={admin.displayName} avatar={admin.avatarUrl} />
        {!isReset && <PasswordForm reset={false} />}
      </div>
    </>
  );
}
