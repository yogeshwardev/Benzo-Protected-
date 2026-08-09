import {
  Bot,
  Braces,
  Code2,
  Coffee,
  Cpu,
  FileTerminal,
  ServerCog,
  TerminalSquare
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type CourseCategory = "Programming" | "Web & AI" | "DevOps & Linux";

export type CourseCatalogItem = {
  title: string;
  slug: string;
  category: CourseCategory;
  schedule: string;
  summary: string;
  outcomes: string[];
  accent: string;
  Icon: LucideIcon;
};

export const courseCatalog: CourseCatalogItem[] = [
  {
    title: "C Programming",
    slug: "c-programming",
    category: "Programming",
    schedule: "Monday-Saturday",
    summary: "Start with logic building, memory basics, loops, arrays, and practical C programs.",
    outcomes: ["Build programming fundamentals", "Practice daily problem solving", "Prepare for core CS subjects"],
    accent: "from-teal-600 to-cyan-500",
    Icon: FileTerminal
  },
  {
    title: "Python",
    slug: "python",
    category: "Programming",
    schedule: "Monday-Saturday",
    summary: "Learn Python from scratch through scripts, automation, data handling, and mini projects.",
    outcomes: ["Write clean Python programs", "Automate everyday tasks", "Create beginner projects"],
    accent: "from-amber-500 to-orange-500",
    Icon: Bot
  },
  {
    title: "Java",
    slug: "java",
    category: "Programming",
    schedule: "Monday-Saturday",
    summary: "Master Java foundations, OOP, collections, and interview-ready coding habits.",
    outcomes: ["Understand OOP deeply", "Build Java console apps", "Strengthen interview basics"],
    accent: "from-red-500 to-orange-500",
    Icon: Coffee
  },
  {
    title: "C++",
    slug: "cplusplus",
    category: "Programming",
    schedule: "Monday-Saturday",
    summary: "Use C++ for logic, STL basics, problem solving, and stronger programming confidence.",
    outcomes: ["Practice STL foundations", "Solve coding exercises", "Improve speed and accuracy"],
    accent: "from-blue-600 to-indigo-500",
    Icon: Cpu
  },
  {
    title: "Web Development Using AI",
    slug: "web-development-using-ai",
    category: "Web & AI",
    schedule: "Monday-Saturday",
    summary: "Build modern websites while using AI tools responsibly for planning, code, and debugging.",
    outcomes: ["Create responsive pages", "Use AI-assisted workflows", "Ship portfolio-ready work"],
    accent: "from-violet-600 to-fuchsia-500",
    Icon: Braces
  },
  {
    title: "DevOps",
    slug: "devops",
    category: "DevOps & Linux",
    schedule: "Monday-Saturday",
    summary: "Learn Linux, Git, CI/CD, Docker basics, and deployment workflows through live practice.",
    outcomes: ["Understand deployment flow", "Practice containers and CI", "Operate real project pipelines"],
    accent: "from-emerald-600 to-teal-500",
    Icon: ServerCog
  },
  {
    title: "Linux Administration",
    slug: "linux-administration",
    category: "DevOps & Linux",
    schedule: "Monday-Saturday",
    summary: "Operate Linux systems with shell commands, users, permissions, services, and troubleshooting.",
    outcomes: ["Use the command line", "Manage services and users", "Troubleshoot Linux basics"],
    accent: "from-slate-700 to-teal-600",
    Icon: TerminalSquare
  }
];

export const courseCategories: Array<"All" | CourseCategory> = [
  "All",
  "Programming",
  "Web & AI",
  "DevOps & Linux"
];

export function getCourseBySlug(slug: string) {
  return courseCatalog.find((course) => course.slug === slug);
}
