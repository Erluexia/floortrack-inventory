import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface PreviousStatusProps {
  roomNumber: string;
}

export const PreviousStatus = ({ roomNumber }: PreviousStatusProps) => {
  const { data: items } = useQuery({
    queryKey: ["previous-items", roomNumber],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("items_history")
        .select("*")
        .eq("room_number", roomNumber)
        .order("changed_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  return (
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
          {items?.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                <div className="font-medium">{item.name}</div>
              </TableCell>
              <TableCell>{item.quantity}</TableCell>
              <TableCell>{item.status}</TableCell>
              <TableCell>
                {new Date(item.changed_at).toLocaleString()}
              </TableCell>
            </TableRow>
          ))}
          {(!items || items.length === 0) && (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-4">
                No previous changes recorded
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};