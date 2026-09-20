import Image from "next/image";
import Link from "next/link";
import PageHeader from "@/src/components/Elements/PageHeader";
import Section from "@/src/components/Elements/Section";
import { MEMBERS } from "@/src/utils/siteContent";

export const metadata = {
  title: "Members",
  description: "The students behind the Vaquero Information Security Initiative at UTRGV.",
};

const initials = (name) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export default function MembersPage() {
  return (
    <main className="w-full flex flex-col items-center justify-center">
      <PageHeader title="Meet the team">
        Student researchers, engineers, and analysts working on real problems.
      </PageHeader>

      <Section shaded>
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {MEMBERS.map((member) => (
            <li
              key={member.name}
              className="flex items-center gap-4 rounded-xl border-2 border-solid border-dark dark:border-light p-5"
            >
              <div className="shrink-0 w-16 h-16 rounded-full overflow-hidden bg-dark dark:bg-light text-light dark:text-dark flex items-center justify-center font-bold text-lg">
                {member.avatarUrl ? (
                  <Image
                    src={member.avatarUrl}
                    alt={member.name}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  initials(member.name)
                )}
              </div>
              <div>
                <h2 className="font-semibold text-lg">{member.name}</h2>
                <p className="font-in text-sm text-accent dark:text-accentDark font-semibold">
                  {member.role}
                </p>
                {member.focus ? (
                  <p className="font-in text-sm text-gray dark:text-light/60">{member.focus}</p>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <Section>
        <h2 className="font-bold text-2xl md:text-3xl">Want to be on this page?</h2>
        <p className="mt-4 font-in text-base max-w-2xl">
          Members come from every major, and most joined knowing nothing about security. Come to a
          meeting, then{" "}
          <Link href="/contact" className="underline underline-offset-2 text-accent dark:text-accentDark">
            get in touch
          </Link>{" "}
          and we&apos;ll get you plugged into a project or a team.
        </p>
      </Section>
    </main>
  );
}
