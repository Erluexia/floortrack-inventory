import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
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
import { updateItem } from "@/utils/db/itemOperations";
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";

interface EditItemDialogProps {
  item: {
    id: string;
    name: string;
    quantity: number;
    status: "good" | "maintenance" | "low";
    maintenance_count: number;
    replacement_count: number;
  };
  roomNumber: string;
  onItemUpdated: () => void;
}

export const EditItemDialog = ({ item, roomNumber, onItemUpdated }: EditItemDialogProps) => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState(item.name);
  const [quantity, setQuantity] = useState(item.quantity.toString());
  const [maintenanceCount, setMaintenanceCount] = useState(item.maintenance_count.toString());
  const [replacementCount, setReplacementCount] = useState(item.replacement_count.toString());
  const { toast } = useToast();

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

      const success = await updateItem({
        ...item,
        quantity: totalQuantity,
        maintenance_count: maintenanceQuantity,
        replacement_count: replacementQuantity,
        room_number: roomNumber
      });

      if (success) {
        onItemUpdated();
        setOpen(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  }, 500);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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