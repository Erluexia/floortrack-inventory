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
      setReplacementCount("");
      onItemAdded();
    }
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
          <Button type="submit" className="w-full">Add Item</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};