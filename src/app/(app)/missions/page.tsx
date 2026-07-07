import { redirect } from "next/navigation";

// /missions → redirect to dashboard (missions are shown there)
export default function MissionsPage() {
  redirect("/dashboard");
}
