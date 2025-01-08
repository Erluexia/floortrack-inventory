import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, RefreshCw } from "lucide-react";
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
import { handleSupabaseError } from "@/utils/errorHandling";

interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  status: "good" | "maintenance" | "low";
  room_number: string;
  updated_at: string;
  created_at: string;
  maintenanceCount?: number;
  replacementCount?: number;
  goodCount?: number;
}

export const InventoryTable = ({ roomNumber }: { roomNumber: string }) => {
  const [itemToDelete, setItemToDelete] = useState<InventoryItem | null>(null);
  const { toast } = useToast();

  const { data: items = [], refetch, isRefetching } = useQuery({
    queryKey: ["items", roomNumber],
    queryFn: async () => {
      console.log("Fetching items for room:", roomNumber);
      const { data, error } = await supabase
        .from("current_status")
        .select("*")
        .eq("room_number", roomNumber)
        .order("name");

      if (error) {
        handleSupabaseError(error, "Error fetching items");
        return [];
      }

      if (!Array.isArray(data)) {
        console.error("Data is not an array:", data);
        return [];
      }

      const itemsMap = data.reduce((acc: { [key: string]: InventoryItem }, item) => {
        const itemStatus = item.status as "good" | "maintenance" | "low";
        
        if (!acc[item.name]) {
          acc[item.name] = {
            ...item,
            status: itemStatus,
            maintenanceCount: itemStatus === 'maintenance' ? item.quantity : 0,
            replacementCount: itemStatus === 'low' ? item.quantity : 0,
            goodCount: itemStatus === 'good' ? item.quantity : 0,
          };
        } else {
          if (itemStatus === 'maintenance') {
            acc[item.name].maintenanceCount = (acc[item.name].maintenanceCount || 0) + item.quantity;
          } else if (itemStatus === 'low') {
            acc[item.name].replacementCount = (acc[item.name].replacementCount || 0) + item.quantity;
          } else {
            acc[item.name].goodCount = (acc[item.name].goodCount || 0) + item.quantity;
          }
          acc[item.name].quantity += item.quantity;
        }
        return acc;
      }, {});

      const result = Object.values(itemsMap);
      console.log("Processed items:", result);
      return result;
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel('items-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'current_status',
          filter: `room_number=eq.${roomNumber}`,
        },
        () => {
          console.log('Items changed, refreshing data');
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomNumber, refetch]);

  const handleDelete = async () => {
    if (!itemToDelete) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to delete items",
          variant: "destructive",
        });
        return;
      }

      const { data: userData } = user.id ? await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .maybeSingle() : { data: null };

      // First, get the current item details for history
      const { data: currentItems } = await supabase
        .from("current_status")
        .select("*")
        .eq("name", itemToDelete.name)
        .eq("room_number", roomNumber);

      if (currentItems && currentItems.length > 0) {
        // Record history for each item being deleted
        for (const item of currentItems) {
          await supabase
            .from("previous_status")
            .insert({
              item_id: item.id,
              name: item.name,
              quantity: item.quantity,
              status: item.status,
              room_number: item.room_number,
            });
        }
      }

      const { error: deleteError } = await supabase
        .from("current_status")
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
      if (user) {
        await supabase
          .from("activity_logs")
          .insert({
            room_number: roomNumber,
            item_name: itemToDelete.name,
            action_type: "delete",
            details: `Deleted item with quantity: ${itemToDelete.quantity}`,
            user_id: user.id,
            email: user.email,
            username: userData?.username,
          });
      }

      toast({
        title: "Success",
        description: "Item deleted successfully",
      });
      refetch();
      setItemToDelete(null);
    } catch (error) {
      console.error("Delete error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4 font-arial">
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isRefetching}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
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
            {Array.isArray(items) && items.length > 0 ? (
              items.map((item: InventoryItem) => (
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
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                  No items found
                </TableCell>
              </TableRow>
            )}
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
