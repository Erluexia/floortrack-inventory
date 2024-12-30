import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
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
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const totalQuantity = parseInt(quantity);
    const maintenanceQuantity = parseInt(maintenanceCount);

    if (maintenanceQuantity > totalQuantity) {
      toast({
        title: "Error",
        description: "Maintenance count cannot be greater than total quantity",
        variant: "destructive",
      });
      return;
    }

    const status = maintenanceQuantity > 0 ? "maintenance" : 
                  totalQuantity < 5 ? "low" : "good";

    const { error } = await supabase
      .from("items")
      .insert({
        name,
        quantity: totalQuantity,
        status,
        room_number: roomNumber,
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add item",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Item added successfully",
      });
      setIsOpen(false);
      setName("");
      setQuantity("");
      setMaintenanceCount("");
      onItemAdded();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <Plus className="h-4 w-4 mr-2" />
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
              required
            />
          </div>
          <Button type="submit" className="w-full">Add Item</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};