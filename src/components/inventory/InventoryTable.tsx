import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { AddItemDialog } from "./AddItemDialog";
import { EditItemDialog } from "./EditItemDialog";
import { ActivityLog } from "./ActivityLog";

interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  status: "good" | "maintenance" | "low";
  room_number: string;
  updated_at: string;
}

export const InventoryTable = ({ roomNumber }: { roomNumber: string }) => {
  const [itemToDelete, setItemToDelete] = useState<InventoryItem | null>(null);
  const { toast } = useToast();

  const { data: items, refetch } = useQuery({
    queryKey: ["items", roomNumber],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("items")
        .select("*")
        .eq("room_number", roomNumber)
        .order("name");

      if (error) throw error;
      return data as InventoryItem[];
    },
  });

  const handleDelete = async () => {
    if (!itemToDelete) return;

    const { error: deleteError } = await supabase
      .from("items")
      .delete()
      .eq("id", itemToDelete.id);

    if (deleteError) {
      toast({
        title: "Error",
        description: "Failed to delete item",
        variant: "destructive",
      });
      return;
    }

    // Log the delete activity
    const { error: logError } = await supabase
      .from("activity_logs")
      .insert({
        room_number: roomNumber,
        item_name: itemToDelete.name,
        action_type: "delete",
        details: `Deleted item with quantity: ${itemToDelete.quantity}`,
      });

    if (logError) {
      console.error("Failed to log activity:", logError);
    }

    toast({
      title: "Success",
      description: "Item deleted successfully",
    });
    refetch();
    setItemToDelete(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <AddItemDialog roomNumber={roomNumber} onItemAdded={refetch} />
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item Name</TableHead>
              <TableHead>Need Maintenance</TableHead>
              <TableHead>Need Replacement</TableHead>
              <TableHead className="w-[100px]"></TableHead>
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
                  <div className="flex justify-end gap-2">
                    <EditItemDialog item={item} roomNumber={roomNumber} onItemUpdated={refetch} />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setItemToDelete(item)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ActivityLog roomNumber={roomNumber} />

      <AlertDialog open={!!itemToDelete} onOpenChange={() => setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete{" "}
              {itemToDelete?.name} from the inventory.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};