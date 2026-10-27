// All copy for the US landing-page template (deck slide 07).
// angle = the ad's offer, trk = Track A (Indian-American parents) or Track B (mainstream US parents).

export const ANGLES = ["amc8", "cogat", "ai-coding", "math"] as const;
export type Angle = (typeof ANGLES)[number];
export type Track = "a" | "b";

export const ASSETS = "https://assets.brightchamps.com";

export function parseAngle(v?: string): Angle {
  return (ANGLES as readonly string[]).includes(v ?? "") ? (v as Angle) : "math";
}
export function parseTrack(v?: string | string[]): Track {
  return (Array.isArray(v) ? v[0] : v)?.toLowerCase() === "b" ? "b" : "a";
}

export const STATES: Record<string, string> = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", CA: "California", CO: "Colorado", CT: "Connecticut",
  FL: "Florida", GA: "Georgia", HI: "Hawaii", IL: "Illinois", MA: "Massachusetts", MD: "Maryland",
  MI: "Michigan", MN: "Minnesota", NC: "North Carolina", NJ: "New Jersey", NY: "New York", OH: "Ohio",
  OR: "Oregon", PA: "Pennsylvania", TX: "Texas", VA: "Virginia", WA: "Washington",
};

export type AngleContent = {
  key: string;
  pill: string;
  h1: Record<Track, [string, string]>; // [plain, highlighted]
  sub: string;
  ticks: string[];
  formTitle: string;
  how2: string;
  currLead: string;
  currTitle: string;
  badges: string[];
  modules: [string, string][];
  final: string;
  heroImage: string;
};

export const ANGLE_CONTENT: Record<Angle, AngleContent> = {
  amc8: {
    key: "AMC 8",
    pill: "Free AMC 8 Readiness Check",
    h1: { a: ["Is your child ready for ", "AMC 8?"], b: ["Is your child ready for ", "AMC 8?"] },
    sub: "A short readiness quiz with a score, then a free 1:1 review class with a competition math coach.",
    ticks: ["Readiness quiz scored by topic", "1:1 review of your child's weakest areas", "A 3-week prep plan before the January contest"],
    formTitle: "Book your free AMC 8 Readiness Check",
    how2: "A competition coach reviews the quiz score and works through the topics your child missed.",
    currLead: "A focused prep track built around the AMC 8 syllabus, from first steps to contest day.",
    currTitle: "What your child will master for AMC 8",
    badges: ["Aligned to Common Core", "Mapped to AMC 8 topics"],
    modules: [
      ["Number theory", "Primes, divisibility, remainders and digit problems"],
      ["Counting & probability", "Casework, combinations and expected outcomes"],
      ["Geometry", "Angles, area, similar figures and the coordinate plane"],
      ["Algebra & patterns", "Equations, sequences and multi-step word problems"],
      ["Speed & strategy", "25 questions in 40 minutes: pacing and estimation"],
      ["Past-paper practice", "Timed AMC 8 sets with step-by-step review"],
    ],
    final: "3 weeks to AMC 8. Find out where your child stands.",
    heroImage: `${ASSETS}/imagekit/landingPage/first%20fold/indian_LCP.webp`,
  },
  cogat: {
    key: "CogAT",
    pill: "Free CogAT practice test",
    h1: { a: ["Get your child ready for ", "CogAT & gifted testing"], b: ["Get your child ready for ", "CogAT & gifted testing"] },
    sub: "A free CogAT-style practice test and live 1:1 class, plus a report on verbal, quantitative and non-verbal reasoning.",
    ticks: ["Practice questions in the real CogAT format", "1:1 class on the question types your child finds hardest", "Skill report you can share with their school"],
    formTitle: "Book your free CogAT practice class",
    how2: "Your child works through CogAT-style questions with a teacher who explains the reasoning behind each answer.",
    currLead: "Practice across all three CogAT batteries, at the right level for your child's grade.",
    currTitle: "What your child will practice for CogAT",
    badges: ["Aligned to Common Core", "Covers all 3 CogAT batteries"],
    modules: [
      ["Verbal reasoning", "Analogies, sentence completion and verbal classification"],
      ["Quantitative reasoning", "Number series, number puzzles and analogies"],
      ["Non-verbal reasoning", "Figure matrices, paper folding and classification"],
      ["Logic & patterns", "Spotting the rule and reasoning step by step"],
      ["Test strategy", "Pacing, elimination and checking work"],
      ["Test-day confidence", "Calm habits for younger test-takers"],
    ],
    final: "Give your child a calm, confident test day.",
    heroImage: `${ASSETS}/imagekit/landingPage/first%20fold/indian_LCP.webp`,
  },
  "ai-coding": {
    key: "AI coding",
    pill: "Free class · Build an AI app in 60 minutes",
    h1: { a: ["Your child can ", "build an AI app in 60 minutes"], b: ["Turn screen time into ", "building an AI app"] },
    sub: "A free live 1:1 class where your child builds and shares a working AI app. No coding experience needed.",
    ticks: ["Builds a real AI app to show the family", "Learns how AI works, safely and step by step", "For ages 6–16, at your child's level"],
    formTitle: "Book your child's free AI coding class",
    how2: "Your child builds a working AI app with a coding teacher, screen-sharing one-on-one.",
    currLead: "From first blocks of code to real AI apps, one project at a time.",
    currTitle: "What your child will build with AI",
    badges: ["Aligned to CSTA standards", "Kid-safe AI tools"],
    modules: [
      ["Block coding", "Logic, loops and events through games (Grades 1–4)"],
      ["Python", "Real code, from variables to small projects (Grades 5+)"],
      ["AI basics", "How AI learns: prompts and models, explained simply"],
      ["Build an AI app", "Chatbots, image classifiers and quiz apps"],
      ["Web & app design", "Projects that work on any device"],
      ["Safe AI habits", "Privacy, fact-checking and responsible use"],
    ],
    final: "Swap an hour of scrolling for an hour of building.",
    heroImage: `${ASSETS}/imagekit/landingPage/first%20fold/indian_LCP.webp`,
  },
  math: {
    key: "math",
    pill: "Free live 1:1 math class",
    h1: { a: ["Help your child get ", "ahead of grade in math"], b: ["Build your child's ", "confidence in math"] },
    sub: "A free live 1:1 class with an expert math teacher, plus a skill report you keep.",
    ticks: ["Guided by top 1% expert teachers", "Real-world math, not rote drills", "Olympiad & competition ready"],
    formTitle: "Claim your child's free math class",
    how2: "Your child works one-on-one with a math teacher, on camera, at their own level.",
    currLead: "Every class maps to your child's grade and the Common Core standards.",
    currTitle: "What your child will learn with MatIQ™",
    badges: ["Aligned to Common Core", "Grades K–8"],
    modules: [
      ["MatIQ™ method", "Step-by-step problem solving through real-world examples"],
      ["Mental speed math", "Techniques to solve problems in seconds"],
      ["Number sense & operations", "Place value, fractions, decimals and estimation"],
      ["Algebra & geometry", "Patterns, equations, shapes, area and angles"],
      ["NUMON™ adaptive worksheets", "Practice that adjusts difficulty with every answer"],
      ["Olympiad & AMC 8 prep", "Competition problems that go beyond school math"],
    ],
    final: "See how your child learns math, one-on-one.",
    heroImage: `${ASSETS}/imagekit/landingPage/first%20fold/indian_LCP.webp`,
  },
};

export const PROGRAMS = [
  { name: "TrailBlazer", icon: "/landingPage/curriculam_trailblazer_icon.webp", sessions: 45, perClass: 37, blurb: "Core skills, mental math and confidence" },
  { name: "Pathfinder", icon: "/landingPage/curriculam_pathfinder_icon.webp", sessions: 90, perClass: 30, blurb: "Everything in TrailBlazer plus applied problem solving", popular: true },
  { name: "Luminary", icon: "/landingPage/curriculam_luminary_icon.webp", sessions: 150, perClass: 23, blurb: "Everything in Pathfinder plus competition depth" },
];

export type TrackContent = {
  stats: [string, string][];
  teachTitle: string;
  teachLead: string;
  trustLine: string;
  finalSub: string;
};

export const TRACK_CONTENT: Record<Track, TrackContent> = {
  a: {
    stats: [["200K+", "classes a month"], ["30+", "countries"], ["4.6", "on Trustpilot"]],
    teachTitle: "Meet Our Teachers",
    teachLead: "Learn from the top 1% of educators, who make learning fun and engaging.",
    trustLine: "Expert math & coding teachers, trusted by Indian-American families",
    finalSub: "Book a free 1:1 class in under a minute.",
  },
  b: {
    stats: [["4.6", "on Trustpilot"], ["1:1", "live classes"], ["US", "academic lead"]],
    teachTitle: "Meet Your Teaching Team",
    teachLead: "Expert 1:1 teachers, plus a US academic lead who joins the last 15 minutes of your class and runs your follow-up call.",
    trustLine: "US academic lead on every trial · Common Core aligned",
    finalSub: "Meet your teacher and a US academic lead. Free, in under a minute.",
  },
};

export type Teacher = { name: string; img?: string; years: number; tags: string[]; rating: string; reviews: string; us?: boolean };

const T = {
  vikrant: { name: "Vikrant Sharma", img: "/teachers/ai_avatar/15071_ai.png", years: 3, tags: ["Algebra", "Geometry", "Data analysis"], rating: "5.0", reviews: "905" },
  saakshi: { name: "Saakshi", img: "/teachers/ai_avatar/15484_ai.png", years: 3, tags: ["Algebra", "Critical thinking", "Geometry"], rating: "5.0", reviews: "1,079" },
  adeeba: { name: "Adeeba Umar", img: "/teachers/ai_avatar/16926_ai.png", years: 3, tags: ["Critical reasoning", "Geometry", "Algebra"], rating: "4.9", reviews: "1,031" },
  nishtha: { name: "Nishtha Tiwari", img: "/teachers/ai_avatar/16666_ai.png", years: 4, tags: ["Data analysis", "Geometry", "Algebra"], rating: "4.9", reviews: "625" },
  siska: { name: "Siska F. Mauludiah", img: "/nw-teachers/output/image-4562.png", years: 3, tags: ["Coding", "Data analysis", "Logic"], rating: "5.0", reviews: "694" },
  ali: { name: "Mohammad Ali Ahmad", img: "/teachers/ai_avatar/5450_ai.png", years: 3, tags: ["Coding", "Robotics", "Lesson planning"], rating: "4.9", reviews: "251" },
} satisfies Record<string, Teacher>;

export const TEACHERS: Record<Angle, Teacher[]> = {
  amc8: [T.nishtha, T.vikrant, T.adeeba],
  cogat: [T.saakshi, T.adeeba, T.nishtha],
  "ai-coding": [T.ali, T.siska, T.vikrant],
  math: [T.vikrant, T.saakshi, T.adeeba],
};

// Placeholder until the US academic lead is hired; swap in their name and photo.
export const US_LEAD: Teacher = {
  name: "Your US Academic Lead", years: 10, tags: ["M.Ed.", "US classroom teacher", "Follow-up call"], rating: "", reviews: "", us: true,
};

// Sample reviews. In production: verified Trustpilot reviews tagged with the reviewer's state.
export type Review = { kid: string; grade: string; parent: string; img: string; win: string; quote: string };
export const REVIEWS: Record<Angle, Review[]> = {
  amc8: [
    { kid: "Rohan", grade: "Grade 6", parent: "Deepa M.", img: "us_kid_5.jpg", win: "AMC 8 Honor Roll", quote: "Two weeks of 1:1 sessions and he finally cracked counting problems. The coach found his weak areas early." },
    { kid: "Ananya", grade: "Grade 5", parent: "Sunita P.", img: "us_kid_4.jpg", win: "Cleared Olympiad round 1", quote: "The readiness quiz showed exactly where she lost points. Every session was built around that." },
    { kid: "Ishaan", grade: "Grade 7", parent: "Anita N.", img: "us_kid_6.jpg", win: "Preparing for state level", quote: "He went from fearing math to enjoying it. Now he paces himself and checks his work." },
  ],
  cogat: [
    { kid: "Diya", grade: "Grade 3", parent: "Kavitha K.", img: "us_kid_2.jpg", win: "Accepted to gifted program", quote: "She was nervous about the gifted test. After the practice sessions she walked in calm." },
    { kid: "Aarav", grade: "Grade 1", parent: "Priya S.", img: "us_kid_1.jpg", win: "Topped class math quiz", quote: "The non-verbal puzzles were his weak spot. The teacher made them fun and he improved fast." },
    { kid: "Arjun", grade: "Grade 4", parent: "Meena J.", img: "us_kid_3.jpg", win: "Full marks, twice", quote: "Clear reports after every class, so we always knew what to practice at home." },
  ],
  "ai-coding": [
    { kid: "Arjun", grade: "Grade 4", parent: "Meena J.", img: "us_kid_3.jpg", win: "Built his first chatbot", quote: "He built a chatbot in his first class and showed it to the whole family at dinner." },
    { kid: "Ananya", grade: "Grade 5", parent: "Sunita P.", img: "us_kid_4.jpg", win: "Published a quiz app", quote: "Finally, screen time I feel good about. She asks to do her coding practice." },
    { kid: "Ishaan", grade: "Grade 7", parent: "Anita N.", img: "us_kid_6.jpg", win: "Python project showcase", quote: "The teacher explains AI in a way a kid actually gets. Now he wants to build games." },
  ],
  math: [
    { kid: "Diya", grade: "Grade 3", parent: "Kavitha K.", img: "us_kid_2.jpg", win: "School Olympiad winner", quote: "Her mental math speed and accuracy have improved so much after starting MatIQ." },
    { kid: "Rohan", grade: "Grade 6", parent: "Deepa M.", img: "us_kid_5.jpg", win: "Scored 98% in school exam", quote: "His teacher found his weak areas early. He's working a grade ahead now." },
    { kid: "Aarav", grade: "Grade 1", parent: "Priya S.", img: "us_kid_1.jpg", win: "Topped class math quiz", quote: "He finishes classwork so fast his teacher now gives him higher-level worksheets." },
  ],
};

export const AWARDS = [
  { src: "/imagekit/website/new_website/Homepage_Awards_Logos/Home/Winner_EdTech_Breakthrough_Awards.png", title: "EdTech Startup of the Year" },
  { src: "/imagekit/website/new_website/Homepage_Awards_Logos/Learning/FE%20India%20Education.webp", title: "Excellence in AI in Education" },
  { src: "/imagekit/website/new_website/Homepage_Awards_Logos/Home/Education%20Innovation%20Summit.png", title: "Best Coding Education Solution" },
  { src: "/imagekit/website/new_website/Homepage_Awards_Logos/Home/Hurun%20INdia%20Logo.png", title: "Hurun Future Unicorn" },
];

export const PARTNERS = [
  { src: "/landingPage/iitk_v2_logo.webp", alt: "IIT Kanpur" },
  { src: "/landingPage/iima_v2_logo.webp", alt: "IIM Ahmedabad" },
  { src: "/landingPage/nyu_v2_logo.webp", alt: "NYU Stern" },
];

export const FAQS: [string, string][] = [
  ["Is the class really free?", "Yes. The first class is free and we never ask for a card. Afterwards a learning advisor shares your child's skill report and options. There's no obligation to buy."],
  ["What device does my child need?", "A laptop or desktop with internet, a webcam and a microphone. Classes run live on Zoom. Tablets work for some activities, but coding and math tools work best on a computer."],
  ["Which time zone are classes in?", "Your local time zone. Slots are shown automatically in your time, and we teach across every US time zone, including after school and weekends."],
  ["Can I reschedule?", "Yes. Reschedule or cancel up to 12 hours before the class, from the link in your confirmation text or the Student Dashboard."],
  ["Are classes recorded?", "To protect children's privacy, we don't share recordings. Class notes, projects and activities are shared after every session."],
  ["How much does it cost after the free class, and what about refunds?", "Packages run from $23 to $37 per class, depending on size (45, 90 or 150 classes). Your advisor explains the refund policy in writing before you pay, and the free class is never charged."],
];

// Real campaign deadlines (deck slide 05/06). The first live one for the track wins; AMC 8 pages always count to registration close.
export const OFFERS = [
  { trk: "a", end: "2026-11-08T23:59:00-05:00", text: "🪔 Diwali “Gift of Learning” offer ends in" },
  { trk: "b", end: "2026-11-30T23:59:00-05:00", text: "🦃 Thanksgiving offer ends in" },
  { trk: "*", end: "2026-12-20T23:59:00-05:00", text: "❄️ Winter-break camp sign-ups close in" },
  { trk: "*", end: "2027-01-10T23:59:00-05:00", text: "🎯 New Year goals offer ends in" },
] as const;
export const AMC8_DEADLINE = { end: "2027-01-05T23:59:00-05:00", text: "⏳ AMC 8 school registration closes Jan 5 ·" };
