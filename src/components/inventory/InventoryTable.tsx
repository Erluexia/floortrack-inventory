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
import { useQuery } from "@tanstack/react-query";
import { AddItemDialog } from "./AddItemDialog";
import { EditItemDialog } from "./EditItemDialog";
import { fetchItemStatus, subscribeToItemChanges } from "@/utils/db/itemQueries";
import { deleteItem } from "@/utils/db/itemOperations";

interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  status: "good" | "maintenance" | "low";
  room_number: string;
  maintenance_count: number;
  replacement_count: number;
}

export const InventoryTable = ({ roomNumber }: { roomNumber: string }) => {
  const [itemToDelete, setItemToDelete] = useState<InventoryItem | null>(null);

  const { data: items = [], refetch, isRefetching } = useQuery({
    queryKey: ["items", roomNumber],
    queryFn: () => fetchItemStatus(roomNumber),
  });

  useEffect(() => {
    const channel = subscribeToItemChanges(roomNumber, refetch);
    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomNumber, refetch]);

  const handleDelete = async () => {
    if (!itemToDelete) return;

    const success = await deleteItem(itemToDelete);
    if (success) {
      refetch();
      setItemToDelete(null);
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
            {items.length > 0 ? (
              items.map((item: InventoryItem) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="font-medium">{item.name}</div>
                  </TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{item.maintenance_count}</TableCell>
                  <TableCell>{item.replacement_count}</TableCell>
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