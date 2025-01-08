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
    queryKey: ["previous-status", roomNumber],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("previous_status")
        .select("*")
        .eq("room_number", roomNumber)
        .order("changed_at", { ascending: false });

      if (error) {
        console.error("Error fetching previous status:", error);
        throw error;
      }

      return data;
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
          table: 'previous_status'
        },
        () => {
          console.log('Previous status changed, refreshing data');
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  const getStatusBadgeClass = (status: string) => {
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
              <TableHead>Quantity</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {history?.map((item: ItemHistory) => (
              <TableRow key={item.id}>
                <TableCell>{format(new Date(item.changed_at), 'MMM d, yyyy HH:mm:ss')}</TableCell>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded text-sm ${getStatusBadgeClass(item.status)}`}>
                    {item.status}
                  </span>
                </TableCell>
              </TableRow>
            ))}
            {(!history || history.length === 0) && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
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