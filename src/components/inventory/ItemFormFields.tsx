import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ItemFormFieldsProps {
  name: string;
  quantity: string;
  maintenanceCount: string;
  replacementCount: string;
  setName: (value: string) => void;
  setQuantity: (value: string) => void;
  setMaintenanceCount: (value: string) => void;
  setReplacementCount: (value: string) => void;
  isSubmitting: boolean;
}

export const ItemFormFields = ({
  name,
  quantity,
  maintenanceCount,
  replacementCount,
  setName,
  setQuantity,
  setMaintenanceCount,
  setReplacementCount,
  isSubmitting,
}: ItemFormFieldsProps) => {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isSubmitting}
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
          disabled={isSubmitting}
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
          disabled={isSubmitting}
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
          disabled={isSubmitting}
        />
      </div>
    </>
  );
};