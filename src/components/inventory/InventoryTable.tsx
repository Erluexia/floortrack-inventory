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

interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  status: "good" | "maintenance" | "low";
  room_number: string;
  updated_at: string;
  maintenanceCount?: number;
  replacementCount?: number;
  goodCount?: number;
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

      if (error) {
        console.error("Error fetching items:", error);
        throw error;
      }

      // Group items by name and combine quantities
      const groupedItems = data.reduce((acc: { [key: string]: InventoryItem }, item) => {
        if (!acc[item.name]) {
          acc[item.name] = {
            ...item,
            maintenanceCount: item.status === 'maintenance' ? item.quantity : 0,
            replacementCount: item.status === 'low' ? item.quantity : 0,
            goodCount: item.status === 'good' ? item.quantity : 0,
          };
        } else {
          if (item.status === 'maintenance') {
            acc[item.name].maintenanceCount = (acc[item.name].maintenanceCount || 0) + item.quantity;
          } else if (item.status === 'low') {
            acc[item.name].replacementCount = (acc[item.name].replacementCount || 0) + item.quantity;
          } else {
            acc[item.name].goodCount = (acc[item.name].goodCount || 0) + item.quantity;
          }
          acc[item.name].quantity += item.quantity;
        }
        return acc;
      }, {});

      return Object.values(groupedItems) as InventoryItem[];
    },
  });

  const handleDelete = async () => {
    if (!itemToDelete) return;

    const { data: { user } } = await supabase.auth.getUser();

    const { error: deleteError } = await supabase
      .from("items")
      .delete()
      .eq("name", itemToDelete.name)
      .eq("room_number", roomNumber);

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
        user_id: user?.id,
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
              <TableHead>Total Quantity</TableHead>
              <TableHead>Need Maintenance</TableHead>
              <TableHead>Need Replacement</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items?.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="font-medium">{item.name}</div>
                </TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>{item.maintenanceCount || 0}</TableCell>
                <TableCell>{item.replacementCount || 0}</TableCell>
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