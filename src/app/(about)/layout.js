import InsightRoll from "@/src/components/About/InsightRoll";


const insights = [
    "Student organization and 501(c)(3) nonprofit",
    "Based in the Rio Grande Valley",
    "First general meeting January 2026",
    "Open to every major",
    "Hands-on workshops and CTFs",
    "Partnered with RGV Cyber 🤝",
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
