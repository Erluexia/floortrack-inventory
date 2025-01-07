import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useEffect } from "react";

interface PreviousStatusProps {
  roomNumber: string;
}

interface ItemHistory {
  id: string;
  item_id: string;
  name: string;
  quantity: number;
  status: string;
  room_number: string;
  changed_at: string;
}

export const PreviousStatus = ({ roomNumber }: PreviousStatusProps) => {
  const { data: history, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["items-history", roomNumber],
    queryFn: async () => {
      console.log("Fetching items history for room:", roomNumber);
      const { data, error } = await supabase
        .from("items_history")
        .select("*")
        .eq("room_number", roomNumber)
        .order("changed_at", { ascending: false });

      if (error) {
        console.error("Error fetching items history:", error);
        throw error;
      }

      // Group items by change timestamp to show complete state at each change
      const groupedHistory = data.reduce((acc: { [key: string]: any }, item) => {
        const timestamp = item.changed_at;
        if (!acc[timestamp]) {
          acc[timestamp] = {
            timestamp,
            items: {},
          };
        }
        
        // Store item details with its status
        acc[timestamp].items[item.name] = {
          name: item.name,
          total: item.quantity,
          maintenance: item.status === 'maintenance' ? item.quantity : 0,
          replacement: item.status === 'low' ? item.quantity : 0,
        };
        
        return acc;
      }, {});

      // Convert to array and sort by timestamp
      return Object.values(groupedHistory).sort((a: any, b: any) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    },
  });

  // Subscribe to real-time changes
  useEffect(() => {
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'items_history'
        },
        () => {
          console.log('Items history changed, refreshing data');
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  if (isLoading) {
    return <div>Loading previous status...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
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
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>Item Name</TableHead>
              <TableHead>Total Quantity</TableHead>
              <TableHead>Need Maintenance</TableHead>
              <TableHead>Need Replacement</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {history?.map((historyEntry: any) => (
              Object.values(historyEntry.items).map((item: any) => (
                <TableRow key={`${historyEntry.timestamp}-${item.name}`}>
                  <TableCell>{format(new Date(historyEntry.timestamp), 'MMM d, yyyy HH:mm:ss')}</TableCell>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.total}</TableCell>
                  <TableCell>{item.maintenance}</TableCell>
                  <TableCell>{item.replacement}</TableCell>
                </TableRow>
              ))
            ))}
            {(!history || history.length === 0) && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                  No previous changes recorded
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};