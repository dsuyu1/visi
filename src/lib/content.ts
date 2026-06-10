export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  date: string; // ISO
  tags: string[];
  content: string; // markdown
  author: string[];
  category: string;
  /** CSS gradient used as the hero banner background */
  coverGradient: string;
};

export type EventItem = {
  title: string;
  date?: string; // ISO (YYYY-MM-DD)
  dateLabel?: string; // e.g. "TBD"
  time?: string;
  location: string;
  description: string;
  details?: string;
  logoSrc?: string;
  logoAlt?: string;
  imageSrc?: string;
  imageAlt?: string;
};

export type Partner = {
  name: string;
  description: string;
  href?: string;
  logoSrc?: string;
  logoAlt?: string;
};

export type Member = {
  name: string;
  role: string;
  focus?: string;
  avatarUrl?: string;
};

export const BLOG_POSTS: BlogPost[] = [];

export const EVENTS: EventItem[] = [
  {
    title: "BSides RGV 2026",
    date: "2026-06-27",
    time: "9:00 AM - 5:00 PM CST",
    location: "Mission Event Center, Mission, TX",
    description:
      "Community cybersecurity conference in the Rio Grande Valley.",
    imageSrc: "/events/bsides-rgv-2026.jpg",
    imageAlt: "BSides RGV logo",
  },
  {
    title: "Google Build with AI @ UTRGV",
    date: "2026-07-15",
    time: "9:00 AM CST",
    location: "UTRGV",
    description:
      "A global event series enabling developers to learn and build with Google's latest AI & ML technologies.",
    // TODO: Add Google Maps venue link when available.
    details: `About this event

Calling all developers in the Rio Grande Valley!

Build with AI, a global event series enabling developers to learn and build using Google's latest artificial intelligence and machine learning technologies, is coming to the RGV!

Join us for an exciting day of:
- Hands-on workshops
- Networking opportunities and lunch
- And much more!

Don't miss this chance to:
- Get hands-on experience with Google AI and ML tools
- Learn from industry experts
- Connect with other developers in the RGV tech community
- Get inspired to build innovative solutions with AI

Come with your personal laptops.

#BuildWithAI #UTRGV #VISI`,
    logoSrc: "/bwai-2026.png",
    logoAlt: "Build with AI 2026",
  },
  {
    title: "UTRGV CS Spring Social 2026",
    date: "2026-05-06",
    time: "5:00 PM CST",
    location: "EIEAB Lobby",
    description:
      "Hosted by SHPE, ColorStack, VISI, Girls Who Code, and Frontera Devs.",
    imageSrc: "/events/utrgv-spring-social-2026.png",
    imageAlt: "Spring Social 2026 flyer",
  },
  {
    title: "Intro to Networking with Wireshark (Workshop)",
    date: "2026-04-29",
    time: "5:00 PM - 6:00 PM CST",
    location: "EIEAB 1.203",
    description: "Hands-on intro to traffic analysis with Wireshark.",
    imageSrc: "/events/wireshark-workshop.png",
    imageAlt: "Intro to Networking with Wireshark flyer",
  },
  {
    title: "OSINT Workshop",
    date: "2026-03-27",
    time: "4:00 PM CST",
    location: "EIEAB 2.204",
    description:
      "Hands-on OSINT workshop covering people-finding, infrastructure reconnaissance, and safe analysis workflows.\nSpeaker: Mauricio Martinez.",
    imageSrc: "/events/osint-workshop.png",
    imageAlt: "Open-Source Intelligence Workshop flyer",
  },
  {
    title: "picoCTF Workshop",
    date: "2026-03-13",
    time: "2:00 PM CST",
    location: "EIEAB 2.204",
    description:
      "Beginner-friendly, hands-on CTF workshop to learn offensive security fundamentals.\nSpeaker: Damian Villarreal.",
    imageSrc: "/events/picoctf-workshop.png",
    imageAlt: "picoCTF Workshop flyer",
  },
  {
    title: "Vulnerability Management Workshop",
    date: "2026-03-06",
    time: "2:00 PM CST",
    location: "EIEAB 2.204 (MARS Lab)",
    description:
      "Hands-on workshop with live demos: AngryIPScanner, Nmap, and OpenVAS, plus vulnerable machines in the VSOC and mitigation steps.\nSpeaker: Mauricio Martinez.",
    imageSrc: "/events/vulnerability-management-workshop.png",
    imageAlt: "Vulnerability Management Workshop flyer",
  },
  {
    title: "VISI First General Meeting",
    date: "2026-01-30",
    time: "2:00 PM CST",
    location: "EIEAB 2.204 (MARS Lab)",
    description:
      "Kickoff meeting to meet the community, learn what VISI is, and how to get involved. No experience required, just curiosity.",
  },
];

export const PARTNERS: Partner[] = [
  {
    name: "RGV Cyber",
    description:
      "Community-based nonprofit in the Rio Grande Valley. As a student organization at UTRGV, we collaborate with them on events and growing the local cybersecurity community.",
    href: "https://www.rgv-cyber.org/",
    logoSrc: "/partners/rgv-cyber-logo.avif",
    logoAlt: "RGV Cyber",
  },
];

export const MEMBERS: Member[] = [
  { name: "Damian Villarreal", role: "Founder & Executive Director", focus: "Research & mentorship" },
  { name: "Diego Zuniga", role: "Lead", focus: "Certifications & mentorship" },
  { name: "Mauricio Martinez", role: "Engineer", focus: "Automation" },
  { name: "Member Four", role: "Analyst", focus: "DFIR" },
  { name: "Member Five", role: "Builder", focus: "Detection engineering" },
];

// --- Our Work -----------------------------------------------------------------

export type WorkItem = {
  slug: string;
  title: string;
  description: string;
  category: "project" | "writeup" | "report";
  date: string;
  status: "active" | "completed";
  tags: string[];
  links?: { label: string; href: string }[];
};

export const WORK_ITEMS: WorkItem[] = [
  {
    slug: "gtin",
    title: "Global Threat Intelligence Navigator (GTIN)",
    description:
      "By Damian Villarreal. Automated OSINT aggregation through feeds like MITRE ATT&CK mapped to threat groups worldwide. A repository for threat intelligence collected with worker AI agents.",
    category: "project",
    date: "2026-06-04",
    status: "active",
    tags: ["OSINT", "Threat Intel", "MITRE ATT&CK", "Automation", "AI Agents"],
    links: [
      { label: "Open GTIN", href: "https://security.damianvillarreal.com/" },
    ],
  },
];

// --- Library ------------------------------------------------------------------

export type ResourceItem = {
  id: string;
  title: string;
  description: string;
  href?: string;
  downloadHref?: string;
  ctaLabel: string;
};

export const RESOURCES: ResourceItem[] = [
  {
    id: "aws-saa-notes",
    title: "AWS Certified Solutions Architect: Associate (SAA-C03) Notes",
    description:
      "Study notes for the AWS SAA-C03 exam: organized, practical, and continuously updated.",
    href: "https://docs.google.com/document/d/1X1o77rBwtmLUE6v9gWvvC-swavTHal8SnWtSaSyQlrI/edit-usp=sharing",
    ctaLabel: "Open notes",
  },
  {
    id: "aws-saa-acronyms-anki",
    title: "AWS SAA-C03 Acronyms (Anki Deck)",
    description:
      "An Anki deck to drill the acronyms that show up constantly across AWS services and exam questions.",
    downloadHref: "/resources/aws-saa-c03-acronyms.apkg",
    ctaLabel: "Download deck",
  },
];
