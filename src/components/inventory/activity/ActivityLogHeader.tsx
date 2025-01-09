import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface ActivityLogHeaderProps {
  onRefresh: () => void;
  isRefetching: boolean;
}

export const ActivityLogHeader = ({ onRefresh, isRefetching }: ActivityLogHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg font-semibold">Activity Log</h3>
      <Button
        variant="outline"
        size="sm"
        onClick={onRefresh}
        disabled={isRefetching}
      >
        <RefreshCw className={`h-4 w-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
        Refresh
      </Button>
    </div>
  );
};