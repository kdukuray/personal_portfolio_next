import { Icons } from "@/components/icons";
import { HomeIcon, NotebookIcon } from "lucide-react";

export const DATA = {
  name: "Kalelo Dukuray",
  initials: "KD",
  url: "https://kalelodukuray.com",
  location: "New York City, NY",
  locationLink: "https://www.google.com/maps/place/newyorkcity",
  description:
    "Software Engineer, ML Researcher, and Entrepreneur. I love building AI-powered tools that help people learn, create, and grow.",
  summary:
    "I’m a Software Engineer, Machine Learning Researcher, and Entrepreneur passionate about building AI-powered tools that make learning and life simpler. I currently work at the Air Force Research Laboratory (AFRL) in New York, where I develop multimodal AI systems. Outside of research, I’ve founded and built several projects — including [Learnimate](https://www.learnimate.com/) , an AI platform that creates personalized educational content for kids, and [QuizCrow](https://www.quizcrow.com/), an open-source platform for sharing and generating study materials. I’m also a 2× hackathon winner (HAQ-NYC 24, BYTE-Hacks 25). My work blends engineering, creativity, and impact — all driven by a curiosity to push what’s possible with AI and computers.",
  avatarUrl: "/mr.png",
  skills: [
    "Python",
    "JavaScript",
    "TypeScript",
    "React",
    "Next.js",
    "Tailwind CSS",
    "Node.js",
    "C/C++",
    "Rust",
    "Java",
    "Go",
    "Django",
    "FastAPI",
    "Firebase",
    "Supabase",
    "SQL",
    "Docker",
    "Git",
    "PyTorch",
    "Langchain/Langgraph"
  ],

  navbar: [
    { href: "/", icon: HomeIcon, label: "Home" },
    { href: "/blog", icon: NotebookIcon, label: "Blog" },
  ],
  contact: {
    email: "kdukuray01@gmail.com",
    tel: "+123456789",
    social: {
      GitHub: {
        name: "GitHub",
        url: "https://github.com/kdukuray",
        icon: Icons.github,
        navbar: true,
      },
      LinkedIn: {
        name: "LinkedIn",
        url: "https://www.linkedin.com/in/kalelo-dukuray-187b61282/",
        icon: Icons.linkedin,
        navbar: true,
      },
      X: {
        name: "X",
        url: "https://x.com/kalelodukuray",
        icon: Icons.x,

        navbar: true,
      },
      Youtube: {
        name: "Youtube",
        url: "https://www.youtube.com/@kalelodukuray",
        icon: Icons.youtube,
        navbar: true,
      },
      email: {
        name: "Send Email",
        url: "kdukuray01@gmail.com",
        icon: Icons.email,

        navbar: false,
      },
    },
  },
  work: [
    // General Structure of Work
    // {
    //   company: "Nvidia",
    //   href: "https://nvidia.com/",
    //   badges: [],
    //   location: "Santa Clara, CA",
    //   title: "Software Engineer",
    //   logoUrl: "/nvidia.png",
    //   start: "January 2020",
    //   end: "April 2020",
    //   description:
    //     "Architected and wrote the entire MVP of the GeForce Now Cloud Gaming internal admin and A/B testing dashboard using React, Redux, TypeScript, and Python.",
    // },
    {
      company: "Air Force Research Laboratory",
      href: "https://www.afrl.af.mil/",
      badges: [],
      location: "New York, New York",
      title: "Machine learning Research Assistant",
      logoUrl: "/afrl.jpg",
      start: "Dec 2024",
      end: "Present",
      description:
        "Developed multimodal AI systems combining 3D vision and language models for damage detection and classification. Designed synthetic data pipelines and optimized model architectures, achieving 3× faster inference and 16% higher accuracy. Conducted applied ML research at the Air Force Research Laboratory focused on real-world anomaly detection and generative modeling.",
    },
    {
      company: "Learnimate",
      badges: [],
      href: "https://learnimate.com",
      location: "New York, New York",
      title: "Software Engineer",
      logoUrl: "/learnimate.png",
      start: "June 2025",
      end: "Present",
      description:
        "Founded Learnimate, an AI-powered platform that generates personalized educational storybooks, music videos, and lessons for kids. Built multimodal generation pipelines integrating text, image, and audio models to create engaging, age-appropriate learning content. Led full-stack development and product design using Next.js, Supabase, and Tailwind CSS.",
    },

    {
      company: "QuizCrow",
      href: "https://quizcrow.com",
      badges: [],
      location: "San Jose, CA",
      title: "Founder, Maintainer",
      logoUrl: "/quizcrow.png",
      start: "Oct 2025",
      end: "Oct 2025",
      description:
        "Co-developed a prototype iOS app with another intern in Swift for the new Splunk Phantom security orchestration product (later publicly demoed and launched at .conf annual conference in Las Vegas). Implemented a realtime service for the iOS app in Django (Python) and C++; serialized data using protobufs transmitted over gRPC resulting in an approximate 500% increase in data throughput.",
    },
  ],
  education: [
    // General Structure of Education
    // {
    //   school: "Buildspace",
    //   href: "https://buildspace.so",
    //   degree: "s3, s4, sf1, s5",
    //   logoUrl: "/buildspace.jpg",
    //   start: "2023",
    //   end: "2024",
    // },
    {
      school: "City College of New York (Grove School)",
      href: "https://www.ccny.cuny.edu/",
      degree: "Bachelor's of Science in Computer Science",
      logoUrl: "/city_college.webp",
      start: "2024",
      end: "2026 (expected)",
    },
    {
      school: "Borough of Manhattan Community College",
      href: "https://www.bmcc.cuny.edu/",
      degree: "Associates's of Science in Computer Science",
      logoUrl: "/bmcc.jpg",
      start: "2022",
      end: "2024",
    },
  ],
  projects: [
    // General Structure of Project
    //    {
    //   title: "Chat Collect",
    //   href: "https://chatcollect.com",
    //   dates: "Jan 2024 - Feb 2024",
    //   active: true,
    //   description:
    //     "With the release of the [OpenAI GPT Store](https://openai.com/blog/introducing-the-gpt-store), I decided to build a SaaS which allows users to collect email addresses from their GPT users. This is a great way to build an audience and monetize your GPT API usage.",
    //   technologies: [
    //     "Next.js",
    //     "Typescript",
    //     "PostgreSQL",
    //     "Prisma",
    //     "TailwindCSS",
    //     "Stripe",
    //     "Shadcn UI",
    //     "Magic UI",
    //   ],
    //   links: [
    //     {
    //       type: "Website",
    //       href: "https://chatcollect.com",
    //       icon: <Icons.globe className="size-3" />,
    //     },
    //     {
    //       type: "Source",
    //       href: "https://github.com/magicuidesign/magicui",
    //       icon: <Icons.github className="size-3" />,
    //     },
    //   ],
    //   image: "",
    //   video:
    //     "https://pub-83c5db439b40468498f97946200806f7.r2.dev/chat-collect.mp4",
    // },
    {
      title: "Quiz Crow",
      href: "https://quizcrow.com",
      dates: "Oct 2025 - Present",
      active: true,
      description:
        "After noticing how hard it was for students to find past quizzes and exams, I built QuizCrow, an open-source platform that makes it easy to share, search, and study real quizzes. It helps students prepare smarter by organizing materials with powerful tags, filters, and search tools.",
      technologies: [
        "Next.js",
        "TypeScript",
        "Supabase",
        "PostgreSQL",
        "TailwindCSS",
        "Shadcn UI",
        "Vercel"
      ],
      links: [
        {
          type: "Website",
          href: "https://quizcrow.com",
          icon: <Icons.globe className="size-3" />,
        },
        {
          type: "Source",
          href: "https://github.com/kdukuray/quizcrow",
          icon: <Icons.github className="size-3" />,
        },
      ],
      image: "/quiz_crow_demo_1.png",
      video: "",
    },
    {
      title: "Preply AI",
      href: "https://www.preplyai.com/",
      dates: "Dec 2024",
      active: false,
      description:
        "Built PreplyAI, a SaaS platform that generates personalized quizzes and study materials using AI. Designed the entire product experience, from quiz generation logic to clean, responsive UI, helping students prepare for exams faster and more effectively.",
      technologies: [
        "Python",
        "Django",
        "Rest Framework",
        "Next.js",
        "TypeScript",
        "OpenAI API",
        "Supabase",
        "TailwindCSS",
        "Shadcn UI",
      ],
      links: [
        {
          type: "Website",
          href: "https://preplyai.com",
          icon: <Icons.globe className="size-3" />,
        },
        {
          type: "Source",
          href: "https://github.com/kdukuray/prpelyai-backend",
          icon: <Icons.github className="size-3" />,
        },
        {
          type: "Source",
          href: "https://github.com/kdukuray/preplyai-frontend",
          icon: <Icons.github className="size-3" />,
        },
      ],
      image: "/preply_ai_demo_1.png",
      video: "",
    },
  ],
  hackathons: [
    //    General Hackathon structure
    // {
    //       title: "DeveloperWeek Hackathon",
    //       dates: "February 3rd - 4th, 2018",
    //       location: "San Francisco, California",
    //       description:
    //         "Developed a web application which aggregates social media data regarding cryptocurrencies and predicts future prices.",
    //       image:
    //         "https://pub-83c5db439b40468498f97946200806f7.r2.dev/hackline/developer-week.jpg",
    //       links: [
    //         {
    //           title: "Github",
    //           icon: <Icons.github className="h-4 w-4" />,
    //           href: "https://github.com/cryptotrends/cryptotrends",
    //         },
    //       ],
    //     },
    {
      title: "Byte Hacks",
      dates: "October 6th - 7th 2025",
      location: "New York, New York",
      description:
        "Developed an AI-powered platform that helps entrepreneurs validate ideas and generate personalized startup roadmaps; won ‘Best Software for Tech Startups’ at Byte Hacks 2025.",
      image:
        "/byte_hacks.png",
      mlh: "#",
      links: [
         {
              title: "Github",
              icon: <Icons.github className="h-4 w-4" />,
              href: "https://github.com/ArshAnan/startup-stack",
            },
      ],
    },
    // https://github.com/ArshAnan/startup-stack
    {
      title: "HAQ NYC",
      dates: "September 8th - 28th, 2024",
      location: "New York, New York",
      description:
        "Built a post-quantum secure blockchain client that won 1st place in the HAQNYC Security Track among 600+ competitors.",
      image:
        "/haqnyc.png",
      mlh: "#",
      links: [
         {
              title: "Github",
              icon: <Icons.github className="h-4 w-4" />,
              href: "https://github.com/kdukuray/Qoin-Py-Client-PQ",
            },
      ],
    },
  ],
} as const;
