import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";

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
  const { data: history, isLoading } = useQuery({
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

      console.log("Fetched items history:", data);
      return data as ItemHistory[];
    },
  });

  if (isLoading) {
    return <div>Loading previous status...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item Name</TableHead>
              <TableHead>Previous Quantity</TableHead>
              <TableHead>Previous Status</TableHead>
              <TableHead>Changed At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {history?.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>
                  <span className={`capitalize px-2 py-1 rounded text-sm ${
                    item.status === 'good' ? 'bg-green-100 text-green-800' :
                    item.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {item.status}
                  </span>
                </TableCell>
                <TableCell>
                  {format(new Date(item.changed_at), 'MMM d, yyyy HH:mm:ss')}
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