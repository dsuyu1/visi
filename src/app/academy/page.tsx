export const runtime = "edge";

import { redirect } from "next/navigation";

export default function AcademyRedirectPage() {
  redirect("/library/academy");
}
