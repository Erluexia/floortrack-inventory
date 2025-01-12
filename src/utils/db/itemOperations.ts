import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export interface ItemData {
  id: string;
  name: string;
  quantity: number;
  status: 'good' | 'maintenance' | 'low';
  room_number: string;
  maintenance_count: number;
  replacement_count: number;
}

export const updateItem = async (item: ItemData) => {
  console.log("Updating item:", item);
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
        quantity: item.quantity,
        maintenance_count: item.maintenance_count,
        replacement_count: item.replacement_count,
        status: item.maintenance_count > 0 ? 'maintenance' : item.replacement_count > 0 ? 'low' : 'good'
      })
      .eq("name", item.name)
      .eq("room_number", item.room_number);

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
  console.log("Deleting item:", item);
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
  quantity: number,
  maintenance_count: number,
  replacement_count: number,
  room_number: string
) => {
  console.log("Adding new item:", { name, quantity, maintenance_count, replacement_count, room_number });
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to add items",
        variant: "destructive",
      });
      return false;
    }

    // Check if item already exists
    const { data: existingItems } = await supabase
      .from('currentitem')
      .select('*')
      .eq('name', name.trim())
      .eq('room_number', room_number);

    if (existingItems && existingItems.length > 0) {
      toast({
        title: "Error",
        description: "An item with this name already exists in this room",
        variant: "destructive",
      });
      return false;
    }

    const { error } = await supabase
      .from("currentitem")
      .insert({
        name: name.trim(),
        quantity,
        maintenance_count,
        replacement_count,
        room_number,
        status: maintenance_count > 0 ? 'maintenance' : replacement_count > 0 ? 'low' : 'good'
      });

    if (error) {
      console.error("Error adding item:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add item",
        variant: "destructive",
      });
      return false;
    }

    toast({
      title: "Success",
      description: "Item added successfully",
    });
    return true;
  } catch (error) {
    console.error("Error in addItem:", error);
    toast({
      title: "Error",
      description: error instanceof Error ? error.message : "Failed to add item",
      variant: "destructive",
    });
    return false;
  }
};