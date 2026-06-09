export const runtime = "edge";

import { redirect } from "next/navigation";

export default async function AcademyCatchAllRedirectPage({
  params,
}: {
  params: Promise<{ path: string[] }>;
}) {
  const { path } = await params;
  redirect(`/library/academy/${path.join("/")}`);
}

