import InsightRoll from "@/src/components/About/InsightRoll";


const insights = [
    "Student-run since day one",
    "Open to every major",
    "Hands-on workshops every semester",
    "CTF teams for all skill levels",
    "Certification study groups",
    "Partnered with the RGV security community 🤝",
    "No experience required 🐎",
  ];

export default function AboutLayout({ children }) {
  return (
    <main className="w-full flex flex-col items-center justify-between">
      <InsightRoll insights={insights} />
      {children}
    </main>
  );
}
