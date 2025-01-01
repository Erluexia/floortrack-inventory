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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface EditItemDialogProps {
  item: {
    id: string;
    name: string;
    quantity: number;
    status: "good" | "maintenance" | "low";
  };
  onItemUpdated: () => void;
}

export const EditItemDialog = ({ item, onItemUpdated }: EditItemDialogProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(item.name);
  const [quantity, setQuantity] = useState(item.quantity.toString());
  const [status, setStatus] = useState(item.status);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase
      .from("items")
      .update({
        name,
        quantity: parseInt(quantity),
        status,
      })
      .eq("id", item.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update item",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Item updated successfully",
      });
      onItemUpdated();
      setOpen(false);
    }
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
            <Label htmlFor="quantity">Quantity</Label>
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
            <Label>Status</Label>
            <RadioGroup value={status} onValueChange={(value: "good" | "maintenance" | "low") => setStatus(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="good" id="good" />
                <Label htmlFor="good">Good</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="maintenance" id="maintenance" />
                <Label htmlFor="maintenance">Needs Maintenance</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="low" id="low" />
                <Label htmlFor="low">Needs Replacement</Label>
              </div>
            </RadioGroup>
          </div>
          <div className="flex justify-end">
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};