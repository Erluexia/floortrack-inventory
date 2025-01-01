import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ActivityLogProps {
  roomNumber: string;
}

export const ActivityLog = ({ roomNumber }: ActivityLogProps) => {
  const { data: logs } = useQuery({
    queryKey: ["activity_logs", roomNumber],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("activity_logs")
        .select("*")
        .eq("room_number", roomNumber)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold mb-4">Activity Log</h3>
      <ScrollArea className="h-[200px] rounded-md border">
        <div className="p-4">
          {logs?.map((log) => (
            <div
              key={log.id}
              className="mb-3 pb-3 border-b last:border-b-0 last:mb-0 last:pb-0"
            >
              <p className="text-sm">
                <span className="font-medium">{log.item_name}</span>{" "}
                was {log.action_type}ed
              </p>
              <p className="text-xs text-gray-500">{log.details}</p>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(log.created_at).toLocaleString()}
              </p>
            </div>
          ))}
          {(!logs || logs.length === 0) && (
            <p className="text-sm text-gray-500">No activity recorded yet.</p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};