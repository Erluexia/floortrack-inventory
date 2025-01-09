import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ActivityLogHeader } from "./ActivityLogHeader";
import { ActivityLogRow } from "./ActivityLogRow";

interface ActivityLogProps {
  roomNumber: string;
}

export const ActivityLog = ({ roomNumber }: ActivityLogProps) => {
  const { data: logs, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["activity_logs", roomNumber],
    queryFn: async () => {
      console.log("Fetching activity logs for room:", roomNumber);
      const { data, error } = await supabase
        .from("activity_logs")
        .select(`
          id,
          item_name,
          action_type,
          details,
          created_at,
          user_id,
          email,
          username,
          previous_status,
          current_status
        `)
        .eq("room_number", roomNumber)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching activity logs:", error);
        throw error;
      }
      
      return data;
    },
  });

  if (isLoading) {
    return <div>Loading activity logs...</div>;
  }

  return (
    <div className="mt-8">
      <ActivityLogHeader onRefresh={refetch} isRefetching={isRefetching} />
      <ScrollArea className="h-[400px] rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>Action</TableHead>
              <TableHead className="w-[200px]">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs?.map((log) => (
              <ActivityLogRow key={log.id} log={log} />
            ))}
            {(!logs || logs.length === 0) && (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">
                  No activity recorded yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
};