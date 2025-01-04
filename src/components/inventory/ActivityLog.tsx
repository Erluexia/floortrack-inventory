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

interface ActivityLog {
  id: string;
  item_name: string;
  action_type: string;
  details: string;
  created_at: string;
  user_id: string | null;
  email: string | null;
  username: string | null;
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
          email,
          username
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

  return (
    <div className="mt-8 font-arial">
      <h3 className="text-lg font-semibold mb-4">Activity Log</h3>
      <ScrollArea className="h-[400px] rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs?.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="font-medium">{log.item_name}</TableCell>
                <TableCell>{log.action_type}</TableCell>
                <TableCell>{log.username || "Unknown User"}</TableCell>
                <TableCell>{log.email || "N/A"}</TableCell>
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
                <TableCell colSpan={6} className="text-center text-muted-foreground">
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