// Club content: events, people, partners, work, and resources.
// Pages read from here, so this is the only file to edit when something changes.

export const EVENTS = [
  {
    title: "BSides RGV 2026",
    date: "2026-06-27",
    time: "9:00 AM – 5:00 PM CST",
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
      "A global event series enabling developers to learn and build with Google's latest AI and ML technologies.",
    details: `Calling all developers in the Rio Grande Valley.

Build with AI, a global event series enabling developers to learn and build using Google's latest artificial intelligence and machine learning technologies, is coming to the RGV.

Join us for a day of hands-on workshops, networking, and lunch.

Come with your personal laptops.`,
    imageSrc: "/bwai-2026.png",
    imageAlt: "Build with AI 2026",
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
    title: "Intro to Networking with Wireshark",
    date: "2026-04-29",
    time: "5:00 PM – 6:00 PM CST",
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
      "Hands-on OSINT workshop covering people-finding, infrastructure reconnaissance, and safe analysis workflows.",
    speaker: "Mauricio Martinez",
    imageSrc: "/events/osint-workshop.png",
    imageAlt: "Open-Source Intelligence Workshop flyer",
  },
  {
    title: "picoCTF Workshop",
    date: "2026-03-13",
    time: "2:00 PM CST",
    location: "EIEAB 2.204",
    description:
      "Beginner-friendly, hands-on CTF workshop covering offensive security fundamentals.",
    speaker: "Damian Villarreal",
    imageSrc: "/events/picoctf-workshop.png",
    imageAlt: "picoCTF Workshop flyer",
  },
  {
    title: "Vulnerability Management Workshop",
    date: "2026-03-06",
    time: "2:00 PM CST",
    location: "EIEAB 2.204 (MARS Lab)",
    description:
      "Live demos of AngryIPScanner, Nmap, and OpenVAS against vulnerable machines in the VSOC, plus the mitigation steps that follow.",
    speaker: "Mauricio Martinez",
    imageSrc: "/events/vulnerability-management-workshop.png",
    imageAlt: "Vulnerability Management Workshop flyer",
  },
  {
    title: "VISI First General Meeting",
    date: "2026-01-30",
    time: "2:00 PM CST",
    location: "EIEAB 2.204 (MARS Lab)",
    description:
      "Kickoff meeting to meet the community, learn what VISI is, and find out how to get involved. No experience required, just curiosity.",
    imageSrc: "/home/group-photo.jpg",
    imageAlt: "VISI first general meeting group photo",
  },
];

export const MEMBERS = [
  {
    name: "Damian Villarreal",
    role: "Founder & Executive Director",
    focus: "Research & mentorship",
  },
  {
    name: "Diego Zuniga",
    role: "Lead",
    focus: "Certifications & mentorship",
  },
];

export const PARTNERS = [
  {
    name: "RGV Cyber",
    description:
      "Community-based nonprofit in the Rio Grande Valley. As a student organization at UTRGV, we collaborate with them on events and on growing the local cybersecurity community.",
    href: "https://www.rgv-cyber.org/",
    logoSrc: "/partners/rgv-cyber-logo.avif",
    logoAlt: "RGV Cyber",
  },
];

export const WORK_ITEMS = [
  {
    slug: "gtin",
    title: "Global Threat Intelligence Navigator (GTIN)",
    description:
      "By Damian Villarreal. Automated OSINT aggregation through feeds like MITRE ATT&CK mapped to threat groups worldwide. A repository for threat intelligence collected with worker AI agents.",
    category: "Project",
    date: "2026-06-04",
    status: "active",
    tags: ["OSINT", "Threat Intel", "MITRE ATT&CK", "Automation", "AI Agents"],
    links: [{ label: "Open GTIN", href: "https://security.damianvillarreal.com/" }],
  },
];

export const RESOURCES = [
  {
    id: "aws-saa-notes",
    title: "AWS Certified Solutions Architect – Associate (SAA-C03) Notes",
    description:
      "Study notes for the AWS SAA-C03 exam: organized, practical, and continuously updated.",
    href: "https://docs.google.com/document/d/1X1o77rBwtmLUE6v9gWvvC-swavTHal8SnWtSaSyQlrI/edit?usp=sharing",
    ctaLabel: "Open notes",
  },
  {
    id: "aws-saa-acronyms-anki",
    title: "AWS SAA-C03 Acronyms (Anki deck)",
    description:
      "An Anki deck to drill the acronyms that show up constantly across AWS services and exam questions.",
    href: "/resources/aws-saa-c03-acronyms.apkg",
    download: true,
    ctaLabel: "Download deck",
  },
];

// Pillars shown on the about page.
export const PILLARS = [
  {
    title: "Devotion",
    body: "We protect the communities we come from. When we learn something, we share it.",
  },
  {
    title: "Dedication",
    body: "Delivering real value takes discipline. We aim to produce quality work.",
  },
  {
    title: "Curiosity",
    body: "Curious minds are the roots of progress. We ask questions, explore, and share what we find.",
  },
  {
    title: "Honor",
    body: "We act honestly and within the law. When the easy path conflicts with the right one, we take the right one.",
  },
];
