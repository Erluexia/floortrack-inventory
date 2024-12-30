import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "good" | "maintenance" | "low";
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        {
          "bg-green-100 text-green-800": status === "good",
          "bg-yellow-100 text-yellow-800": status === "maintenance",
          "bg-red-100 text-red-800": status === "low",
        }
      )}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};