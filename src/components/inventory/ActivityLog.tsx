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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronRight, User } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  previous_status: string | null;
  current_status: string | null;
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

  const getStatusDisplay = (log: ActivityLog) => {
    if (log.action_type === 'status_change' && log.previous_status && log.current_status) {
      return (
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded text-sm ${
            log.previous_status === 'good' ? 'bg-green-100 text-green-800' :
            log.previous_status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {log.previous_status}
          </span>
          <span>→</span>
          <span className={`px-2 py-1 rounded text-sm ${
            log.current_status === 'good' ? 'bg-green-100 text-green-800' :
            log.current_status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {log.current_status}
          </span>
        </div>
      );
    }
    return log.action_type;
  };

  return (
    <div className="mt-8 font-arial">
      <h3 className="text-lg font-semibold mb-4">Activity Log</h3>
      <ScrollArea className="h-[400px] rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead></TableHead>
              <TableHead>Item</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs?.map((log) => (
              <Collapsible key={log.id} asChild>
                <>
                  <TableRow className="cursor-pointer hover:bg-gray-50">
                    <TableCell className="w-4">
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-4 w-4 p-0">
                          <ChevronRight className="h-4 w-4 transition-transform duration-200 [&[data-state=open]>svg]:rotate-90" />
                        </Button>
                      </CollapsibleTrigger>
                    </TableCell>
                    <TableCell className="font-medium">{log.item_name}</TableCell>
                    <TableCell>{getStatusDisplay(log)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(log.created_at).toLocaleString()}
                    </TableCell>
                  </TableRow>
                  <CollapsibleContent asChild>
                    <TableRow className="bg-gray-50">
                      <TableCell colSpan={4} className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <User className="h-4 w-4" />
                            <span className="font-semibold">{log.username || "Unknown User"}</span>
                            {log.email && (
                              <>
                                <span>•</span>
                                <span>{log.email}</span>
                              </>
                            )}
                          </div>
                          <p className="text-sm">{log.details}</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  </CollapsibleContent>
                </>
              </Collapsible>
            ))}
            {(!logs || logs.length === 0) && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
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