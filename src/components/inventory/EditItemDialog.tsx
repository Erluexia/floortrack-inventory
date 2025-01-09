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
import { Edit2 } from "lucide-react";
import { ItemFormFields } from "./ItemFormFields";
import { updateItem } from "@/utils/itemOperations";
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";

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

  const handleSubmit = useDebouncedCallback(async (e: React.FormEvent) => {
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
        return;
      }

      const itemWithRoom = {
        ...item,
        room_number: roomNumber
      };

      const success = await updateItem(
        itemWithRoom,
        maintenanceQuantity,
        replacementQuantity,
        totalQuantity,
        roomNumber
      );

      if (success) {
        toast({
          title: "Success",
          description: "Item updated successfully",
        });
        onItemUpdated();
        setOpen(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  }, 1000);

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
          <ItemFormFields
            name={name}
            quantity={quantity}
            maintenanceCount={maintenanceCount}
            replacementCount={replacementCount}
            setName={setName}
            setQuantity={setQuantity}
            setMaintenanceCount={setMaintenanceCount}
            setReplacementCount={setReplacementCount}
            isSubmitting={isSubmitting}
          />
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