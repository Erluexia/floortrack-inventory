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
import { addItem } from "@/utils/itemOperations";

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
        return;
      }

      const success = await addItem(
        name,
        totalQuantity,
        maintenanceQuantity,
        replacementQuantity,
        roomNumber
      );

      if (success) {
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
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          className="ml-auto bg-primary hover:bg-primary/90 text-white font-arial" 
          size="sm"
          disabled={isSubmitting}
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