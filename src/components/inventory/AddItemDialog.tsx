import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AddItemDialogProps {
  roomNumber: string;
  onItemAdded: () => void;
}

export const AddItemDialog = ({ roomNumber, onItemAdded }: AddItemDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [maintenanceCount, setMaintenanceCount] = useState("");
  const [replacementCount, setReplacementCount] = useState("");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const totalQuantity = parseInt(quantity);
    const maintenanceQuantity = parseInt(maintenanceCount) || 0;
    const replacementQuantity = parseInt(replacementCount) || 0;

    if (maintenanceQuantity > totalQuantity || replacementQuantity > totalQuantity) {
      toast({
        title: "Error",
        description: "Maintenance or replacement count cannot be greater than total quantity",
        variant: "destructive",
      });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();

    // Create separate items for different statuses
    if (maintenanceQuantity > 0) {
      const { error: maintenanceError } = await supabase
        .from("items")
        .insert({
          name,
          quantity: maintenanceQuantity,
          status: 'maintenance',
          room_number: roomNumber,
        });

      if (maintenanceError) {
        toast({
          title: "Error",
          description: "Failed to add maintenance items",
          variant: "destructive",
        });
        return;
      }
    }

    if (replacementQuantity > 0) {
      const { error: replacementError } = await supabase
        .from("items")
        .insert({
          name,
          quantity: replacementQuantity,
          status: 'low',
          room_number: roomNumber,
        });

      if (replacementError) {
        toast({
          title: "Error",
          description: "Failed to add replacement items",
          variant: "destructive",
        });
        return;
      }
    }

    // Add remaining items as 'good' status
    const goodQuantity = totalQuantity - maintenanceQuantity - replacementQuantity;
    if (goodQuantity > 0) {
      const { error: goodError } = await supabase
        .from("items")
        .insert({
          name,
          quantity: goodQuantity,
          status: 'good',
          room_number: roomNumber,
        });

      if (goodError) {
        toast({
          title: "Error",
          description: "Failed to add good items",
          variant: "destructive",
        });
        return;
      }
    }

    // Log the activity
    const { error: logError } = await supabase
      .from("activity_logs")
      .insert({
        room_number: roomNumber,
        item_name: name,
        action_type: "add",
        details: `Added ${totalQuantity} items (Maintenance: ${maintenanceQuantity}, Replacement: ${replacementQuantity})`,
        user_id: user?.id,
      });

    if (logError) {
      console.error("Failed to log activity:", logError);
    }

    toast({
      title: "Success",
      description: "Items added successfully",
    });
    setIsOpen(false);
    setName("");
    setQuantity("");
    setMaintenanceCount("");
    setReplacementCount("");
    onItemAdded();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          className="ml-auto bg-primary hover:bg-primary/90 text-white" 
          size="sm"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Item</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Item Name</Label>
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
          <Button type="submit" className="w-full">Add Item</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};