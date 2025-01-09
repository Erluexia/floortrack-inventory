import { useQuery } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useEffect } from "react";
import { fetchPreviousStatus, subscribeToItemChanges } from "@/utils/db/itemQueries";
import { supabase } from "@/integrations/supabase/client";

interface PreviousStatusProps {
  roomNumber: string;
}

export const PreviousStatus = ({ roomNumber }: PreviousStatusProps) => {
  const { data: history, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["previous-status", roomNumber],
    queryFn: () => fetchPreviousStatus(roomNumber)
  });

  useEffect(() => {
    const channel = subscribeToItemChanges(roomNumber, refetch);
    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomNumber, refetch]);

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
              <TableHead>Status</TableHead>
              <TableHead>Changed At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {history?.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>{item.status}</TableCell>
                <TableCell>{format(new Date(item.changed_at), 'MMM d, yyyy HH:mm:ss')}</TableCell>
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