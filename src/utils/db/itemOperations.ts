import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

interface ItemData {
  name: string;
  quantity: number;
  status: 'good' | 'maintenance' | 'low';
  room_number: string;
  maintenance_count: number;
  replacement_count: number;
}

export const updateItem = async (
  item: ItemData,
  maintenanceCount: number,
  replacementCount: number,
  totalQuantity: number,
  roomNumber: string
) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to update items",
        variant: "destructive",
      });
      return false;
    }

    const { error: updateError } = await supabase
      .from("currentitem")
      .update({
        quantity: totalQuantity,
        maintenance_count: maintenanceCount,
        replacement_count: replacementCount,
        status: maintenanceCount > 0 ? 'maintenance' : replacementCount > 0 ? 'low' : 'good'
      })
      .eq("name", item.name)
      .eq("room_number", roomNumber);

    if (updateError) {
      console.error("Error updating item:", updateError);
      toast({
        title: "Error",
        description: "Failed to update item",
        variant: "destructive",
      });
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in updateItem:", error);
    toast({
      title: "Error",
      description: "An unexpected error occurred",
      variant: "destructive",
    });
    return false;
  }
};

export const deleteItem = async (item: ItemData) => {
  try {
    const { error } = await supabase
      .from("currentitem")
      .delete()
      .eq("name", item.name)
      .eq("room_number", item.room_number);

    if (error) {
      console.error("Error deleting item:", error);
      toast({
        title: "Error",
        description: "Failed to delete item",
        variant: "destructive",
      });
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in deleteItem:", error);
    toast({
      title: "Error",
      description: "An unexpected error occurred",
      variant: "destructive",
    });
    return false;
  }
};

export const addItem = async (
  name: string,
  totalQuantity: number,
  maintenanceCount: number,
  replacementCount: number,
  roomNumber: string
) => {
  try {
    console.log('Starting addItem function with:', {
      name,
      totalQuantity,
      maintenanceCount,
      replacementCount,
      roomNumber
    });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to add items",
        variant: "destructive",
      });
      return false;
    }

    const { data, error } = await supabase
      .from("currentitem")
      .insert({
        name,
        quantity: totalQuantity,
        maintenance_count: maintenanceCount,
        replacement_count: replacementCount,
        room_number: roomNumber,
        status: maintenanceCount > 0 ? 'maintenance' : replacementCount > 0 ? 'low' : 'good'
      })
      .select('*')
      .single();

    if (error) {
      console.error("Error adding item:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add item",
        variant: "destructive",
      });
      return false;
    }

    console.log('Successfully added item:', data);
    return true;
  } catch (error) {
    console.error("Error in addItem:", error);
    toast({
      title: "Error",
      description: "An unexpected error occurred",
      variant: "destructive",
    });
    return false;
  }
};