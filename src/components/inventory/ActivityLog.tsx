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

interface ActivityLogProps {
  roomNumber: string;
}

type ActivityLog = {
  id: string;
  item_name: string;
  action_type: string;
  details: string;
  created_at: string;
  user_id: string | null;
  profiles: {
    username: string | null;
    avatar_url: string | null;
  } | null;
}

export const ActivityLog = ({ roomNumber }: ActivityLogProps) => {
  const { data: logs } = useQuery<ActivityLog[]>({
    queryKey: ["activity_logs", roomNumber],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("activity_logs")
        .select(`
          id,
          item_name,
          action_type,
          details,
          created_at,
          user_id,
          profiles:user_id (
            username,
            avatar_url
          )
        `)
        .eq("room_number", roomNumber)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching activity logs:", error);
        throw error;
      }
      
      return data || [];
    },
  });

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold mb-4">Activity Log</h3>
      <ScrollArea className="h-[400px] rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs?.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="font-medium">{log.item_name}</TableCell>
                <TableCell>{log.action_type}</TableCell>
                <TableCell>{log.profiles?.username || "Unknown User"}</TableCell>
                <TableCell className="max-w-[200px] truncate">
                  {log.details}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(log.created_at).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
            {(!logs || logs.length === 0) && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
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