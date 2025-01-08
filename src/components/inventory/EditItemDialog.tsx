import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState(item.name);
  const [quantity, setQuantity] = useState(item.quantity.toString());
  const [maintenanceCount, setMaintenanceCount] = useState("0");
  const [replacementCount, setReplacementCount] = useState("0");
  const { toast } = useToast();

  // Initialize status counts when dialog opens
  const initializeStatusCounts = async () => {
    const { data: items } = await supabase
      .from("current_status")
      .select("*")
      .eq("name", item.name)
      .eq("room_number", roomNumber);

    if (items) {
      const maintenance = items.find(i => i.status === 'maintenance')?.quantity || 0;
      const replacement = items.find(i => i.status === 'low')?.quantity || 0;
      const total = items.reduce((sum, i) => sum + i.quantity, 0);

      setMaintenanceCount(maintenance.toString());
      setReplacementCount(replacement.toString());
      setQuantity(total.toString());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const totalQuantity = parseInt(quantity);
      const maintenanceQuantity = parseInt(maintenanceCount) || 0;
      const replacementQuantity = parseInt(replacementCount) || 0;

      if (maintenanceQuantity > totalQuantity || replacementQuantity > totalQuantity) {
        toast({
          title: "Error",
          description: "Maintenance or replacement count cannot be greater than total quantity",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to edit items",
          variant: "destructive",
        });
        return;
      }

      // Get user information
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .maybeSingle();

      if (userError) {
        console.error("Error fetching user data:", userError);
      }

      // Record item history before deletion
      const { data: currentItems } = await supabase
        .from("current_status")
        .select("*")
        .eq("name", item.name)
        .eq("room_number", roomNumber);

      if (currentItems) {
        for (const currentItem of currentItems) {
          await supabase
            .from("previous_status")
            .insert({
              item_id: currentItem.id,
              name: currentItem.name,
              quantity: currentItem.quantity,
              status: currentItem.status,
              room_number: currentItem.room_number,
            });
        }
      }

      // Delete existing item
      const { error: deleteError } = await supabase
        .from("current_status")
        .delete()
        .eq("name", item.name)
        .eq("room_number", roomNumber);

      if (deleteError) {
        throw new Error("Failed to update item");
      }

      // Create new items with updated quantities
      if (maintenanceQuantity > 0) {
        await supabase
          .from("current_status")
          .insert({
            name,
            quantity: maintenanceQuantity,
            status: 'maintenance',
            room_number: roomNumber,
          });
      }

      if (replacementQuantity > 0) {
        await supabase
          .from("current_status")
          .insert({
            name,
            quantity: replacementQuantity,
            status: 'low',
            room_number: roomNumber,
          });
      }

      const goodQuantity = totalQuantity - maintenanceQuantity - replacementQuantity;
      if (goodQuantity > 0) {
        await supabase
          .from("current_status")
          .insert({
            name,
            quantity: goodQuantity,
            status: 'good',
            room_number: roomNumber,
          });
      }

      // Log the edit activity
      await supabase
        .from("activity_logs")
        .insert({
          room_number: roomNumber,
          item_name: name,
          action_type: "edit",
          details: `Updated quantity to ${totalQuantity} (Maintenance: ${maintenanceQuantity}, Replacement: ${replacementQuantity})`,
          user_id: user.id,
          email: user.email,
          username: userData?.username,
        });

      toast({
        title: "Success",
        description: "Item updated successfully",
      });
      onItemUpdated();
      setOpen(false);
    } catch (error) {
      console.error("Update error:", error);
      toast({
        title: "Error",
        description: "Failed to update item",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      setOpen(newOpen);
      if (newOpen) {
        initializeStatusCounts();
      }
    }}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" disabled={isSubmitting}>
          <Edit2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="font-arial">
        <DialogHeader>
          <DialogTitle>Edit Item</DialogTitle>
          <DialogDescription>
            Make changes to your item here. Click save when you're done.
          </DialogDescription>
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
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
