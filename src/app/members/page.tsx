import { redirect } from "next/navigation";

// Members page moved to /about/members
export default function MembersRedirect() {
  redirect("/about/members");
}
