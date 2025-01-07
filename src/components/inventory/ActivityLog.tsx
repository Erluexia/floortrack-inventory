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
import { ChevronRight, User, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

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

  const getStatusBadgeClass = (status: string | null) => {
    switch (status) {
      case 'good':
        return 'bg-green-100 text-green-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatActionMessage = (log: ActivityLog) => {
    if (log.action_type === 'status_change' && log.previous_status && log.current_status) {
      return (
        <div className="flex flex-col gap-2">
          <p className="text-sm">
            <span className="font-medium">{log.username || "Unknown user"}</span>
            {" has changed "}
            <span className="font-medium">{log.item_name}</span>
            {" from "}
            <span className={`px-2 py-1 rounded ${getStatusBadgeClass(log.previous_status)}`}>
              {log.previous_status}
            </span>
            {" to "}
            <span className={`px-2 py-1 rounded ${getStatusBadgeClass(log.current_status)}`}>
              {log.current_status}
            </span>
          </p>
        </div>
      );
    }
    return (
      <div className="flex flex-col gap-1">
        <span>{log.details}</span>
      </div>
    );
  };

  if (isLoading) {
    return <div>Loading activity logs...</div>;
  }

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Activity Log</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isRefetching}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
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
              <Collapsible key={log.id} asChild>
                <>
                  <TableRow className="cursor-pointer hover:bg-gray-50">
                    <TableCell>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-4 w-4 p-0">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </CollapsibleTrigger>
                    </TableCell>
                    <TableCell>{formatActionMessage(log)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(log.created_at), 'MMM d, yyyy HH:mm:ss')}
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
                        </div>
                      </TableCell>
                    </TableRow>
                  </CollapsibleContent>
                </>
              </Collapsible>
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