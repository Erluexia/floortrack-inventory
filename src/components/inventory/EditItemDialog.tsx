import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit2 } from "lucide-react";

interface EditItemDialogProps {
  item: {
    id: string;
    name: string;
    quantity: number;
    status: "good" | "maintenance" | "low";
  };
  roomNumber: string;
  onItemUpdated: () => void;
}

export const EditItemDialog = ({ item, roomNumber, onItemUpdated }: EditItemDialogProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(item.name);
  const [quantity, setQuantity] = useState(item.quantity.toString());
  const [maintenanceCount, setMaintenanceCount] = useState(item.status === "maintenance" ? item.quantity.toString() : "0");
  const [replacementCount, setReplacementCount] = useState(item.status === "low" ? item.quantity.toString() : "0");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const totalQuantity = parseInt(quantity);
    const maintenanceQuantity = parseInt(maintenanceCount);
    const replacementQuantity = parseInt(replacementCount);

    if (maintenanceQuantity > totalQuantity || replacementQuantity > totalQuantity) {
      toast({
        title: "Error",
        description: "Maintenance or replacement count cannot be greater than total quantity",
        variant: "destructive",
      });
      return;
    }

    let status = 'good';
    if (maintenanceQuantity > 0) status = 'maintenance';
    if (replacementQuantity > 0) status = 'low';

    const { error: updateError } = await supabase
      .from("items")
      .update({
        name,
        quantity: totalQuantity,
        status,
      })
      .eq("id", item.id);

    if (updateError) {
      toast({
        title: "Error",
        description: "Failed to update item",
        variant: "destructive",
      });
      return;
    }

    // Log the edit activity
    const { error: logError } = await supabase
      .from("activity_logs")
      .insert({
        room_number: roomNumber,
        item_name: name,
        action_type: "edit",
        details: `Updated quantity: ${totalQuantity}, Maintenance: ${maintenanceQuantity}, Replacement: ${replacementQuantity}`,
      });

    if (logError) {
      console.error("Failed to log activity:", logError);
    }

    toast({
      title: "Success",
      description: "Item updated successfully",
    });
    onItemUpdated();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Edit2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Item</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="quantity">Total Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min="0"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="maintenance">Items Needing Maintenance</Label>
            <Input
              id="maintenance"
              type="number"
              min="0"
              value={maintenanceCount}
              onChange={(e) => setMaintenanceCount(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="replacement">Items Needing Replacement</Label>
            <Input
              id="replacement"
              type="number"
              min="0"
              value={replacementCount}
              onChange={(e) => setReplacementCount(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};