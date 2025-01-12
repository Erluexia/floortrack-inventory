import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

interface ItemData {
  id: string;
  name: string;
  quantity: number;
  status: 'good' | 'maintenance' | 'low';
  room_number: string;
  maintenance_count: number;
  replacement_count: number;
}

export const fetchItems = async (roomNumber: string) => {
  console.log("Fetching items for room:", roomNumber);
  const { data, error } = await supabase
    .from("currentitem")
    .select("*")
    .eq("room_number", roomNumber);

  if (error) {
    console.error("Error fetching items:", error);
    toast({
      title: "Error",
      description: "Failed to fetch items",
      variant: "destructive",
    });
    return [];
  }

  const itemsMap = data.reduce((acc: { [key: string]: ItemData }, item) => {
    if (!acc[item.name]) {
      acc[item.name] = {
        ...item,
        maintenanceCount: item.maintenance_count || 0,
        replacementCount: item.replacement_count || 0,
      };
    }
    return acc;
  }, {});

  console.log("Processed items:", Object.values(itemsMap));
  return Object.values(itemsMap);
};

export const updateItem = async (item: ItemData) => {
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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to add items",
        variant: "destructive",
      });
      return false;
    }

    const { error } = await supabase
      .from("currentitem")
      .insert({
        name,
        quantity: totalQuantity,
        maintenance_count: maintenanceCount,
        replacement_count: replacementCount,
        room_number: roomNumber,
        status: maintenanceCount > 0 ? 'maintenance' : replacementCount > 0 ? 'low' : 'good'
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
