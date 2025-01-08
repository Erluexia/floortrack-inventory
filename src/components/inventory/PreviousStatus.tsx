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

      // Group items by name to calculate quantities
      const groupedData = data.reduce((acc: { [key: string]: any }, item) => {
        if (!acc[item.name]) {
          acc[item.name] = {
            ...item,
            maintenanceCount: item.status === 'maintenance' ? item.quantity : 0,
            replacementCount: item.status === 'low' ? item.quantity : 0,
            goodCount: item.status === 'good' ? item.quantity : 0,
          };
        } else {
          if (item.status === 'maintenance') {
            acc[item.name].maintenanceCount = item.quantity;
          } else if (item.status === 'low') {
            acc[item.name].replacementCount = item.quantity;
          } else {
            acc[item.name].goodCount = item.quantity;
          }
        }
        return acc;
      }, {});

      return Object.values(groupedData);
    },
  });

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

  if (isLoading) {
    return <div>Loading previous status...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Previous Status</h3>
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
              <TableHead>Item Name</TableHead>
              <TableHead>Total Quantity</TableHead>
              <TableHead>Maintenance</TableHead>
              <TableHead>Replacement</TableHead>
              <TableHead>Changed At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {history?.map((item: any) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>{item.maintenanceCount}</TableCell>
                <TableCell>{item.replacementCount}</TableCell>
                <TableCell>{format(new Date(item.changed_at), 'MMM d, yyyy HH:mm:ss')}</TableCell>
              </TableRow>
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