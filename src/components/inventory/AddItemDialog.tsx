import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { ItemFormFields } from "./ItemFormFields";
import { addItem } from "@/utils/db/itemOperations";
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";

interface AddItemDialogProps {
  roomNumber: string;
  onItemAdded: () => void;
}

export const AddItemDialog = ({ roomNumber, onItemAdded }: AddItemDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [maintenanceCount, setMaintenanceCount] = useState("");
  const [replacementCount, setReplacementCount] = useState("");
  const { toast } = useToast();

  const resetForm = () => {
    setName("");
    setQuantity("");
    setMaintenanceCount("");
    setReplacementCount("");
    setIsSubmitting(false);
  };

  const handleSubmit = useDebouncedCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;

    const totalQuantity = parseInt(quantity);
    const maintenanceQuantity = parseInt(maintenanceCount) || 0;
    const replacementQuantity = parseInt(replacementCount) || 0;

    // Validate inputs
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Item name is required",
        variant: "destructive",
      });
      return;
    }

    if (isNaN(totalQuantity) || totalQuantity <= 0) {
      toast({
        title: "Error",
        description: "Total quantity must be a positive number",
        variant: "destructive",
      });
      return;
    }

    if (maintenanceQuantity + replacementQuantity > totalQuantity) {
      toast({
        title: "Error",
        description: "Maintenance and replacement counts cannot exceed total quantity",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const success = await addItem(
        name.trim(),
        totalQuantity,
        maintenanceQuantity,
        replacementQuantity,
        roomNumber
      );

      if (success) {
        onItemAdded();
        setIsOpen(false);
        resetForm();
      }
    } finally {
      setIsSubmitting(false);
    }
  }, 500);

  const handleOpenChange = (open: boolean) => {
    if (!isSubmitting) {
      if (!open) {
        resetForm();
      }
      setIsOpen(open);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button 
          className="ml-auto bg-primary hover:bg-primary/90 text-white font-arial" 
          size="sm"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] font-arial">
        <DialogHeader>
          <DialogTitle>Add New Item</DialogTitle>
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
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting}
          >
            {isSubmitting ? "Adding..." : "Add Item"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};