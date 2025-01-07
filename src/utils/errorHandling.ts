import { toast } from "@/components/ui/use-toast";

export const handleSupabaseError = (error: any, customMessage?: string) => {
  console.error('Supabase error:', error);
  toast({
    title: "Error",
    description: customMessage || "An unexpected error occurred",
    variant: "destructive",
  });
};

export const validateItemQuantities = (
  totalQuantity: number,
  maintenanceQuantity: number,
  replacementQuantity: number
): boolean => {
  if (maintenanceQuantity > totalQuantity || replacementQuantity > totalQuantity) {
    toast({
      title: "Error",
      description: "Maintenance or replacement count cannot be greater than total quantity",
      variant: "destructive",
    });
    return false;
  }
  return true;
};