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
        .from("items")
        .select("*")
        .eq("room_number", roomNumber)
        .order("updated_at", { ascending: false });

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
            <TableHead>Need Maintenance</TableHead>
            <TableHead>Need Replacement</TableHead>
            <TableHead>Last Updated</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items?.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                <div className="font-medium">
                  {item.name}: {item.quantity}
                </div>
              </TableCell>
              <TableCell>
                {item.status === "maintenance" ? item.quantity : 0}
              </TableCell>
              <TableCell>
                {item.status === "low" ? item.quantity : 0}
              </TableCell>
              <TableCell>
                {new Date(item.updated_at).toLocaleString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};