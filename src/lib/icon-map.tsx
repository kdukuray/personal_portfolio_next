import { Icons } from "@/components/icons";
import {
  GlobeIcon,
  HomeIcon,
  NotebookIcon,
  GithubIcon,
} from "lucide-react";

/**
 * Maps string icon keys (stored in the database) to React icon components.
 * Used to dynamically render icons from DB data where JSX can't be stored.
 * @param key - The string identifier for the icon.
 * @param className - Optional className to apply to the icon.
 * @returns A React element for the icon, or a fallback globe icon.
 */
export function getIconByKey(
  key: string,
  className?: string
): React.ReactNode {
  const iconMap: Record<string, React.ReactNode> = {
    github: <Icons.github className={className || "size-4"} />,
    linkedin: <Icons.linkedin className={className || "size-4"} />,
    x: <Icons.x className={className || "size-4"} />,
    youtube: <Icons.youtube className={className || "size-4"} />,
    email: <Icons.email className={className || "size-4"} />,
    globe: <GlobeIcon className={className || "size-4"} />,
    home: <HomeIcon className={className || "size-4"} />,
    notebook: <NotebookIcon className={className || "size-4"} />,
    notion: <Icons.notion className={className || "size-4"} />,
    whatsapp: <Icons.whatsapp className={className || "size-4"} />,
  };

  return iconMap[key] || <GlobeIcon className={className || "size-4"} />;
}

/** List of available icon keys for dropdown selectors in the dashboard. */
export const AVAILABLE_ICON_KEYS = [
  "github",
  "linkedin",
  "x",
  "youtube",
  "email",
  "globe",
  "home",
  "notebook",
  "notion",
  "whatsapp",
] as const;
