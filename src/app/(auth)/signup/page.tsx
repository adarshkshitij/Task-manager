import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { getSession } from "@/lib/session";

export default async function SignupPage() {
  const session = await getSession();

  if (session?.user) {
    redirect("/dashboard");
  }

  return <AuthForm mode="signup" />;
}
