import { supabase } from "@/integrations/supabase/client";
import { handleSupabaseError } from "./errorHandling";

interface ItemData {
  name: string;
  quantity: number;
  status: 'good' | 'maintenance' | 'low';
  room_number: string;
}

export const createItem = async (itemData: ItemData) => {
  const { error } = await supabase
    .from("items")
    .insert(itemData);

  if (error) {
    handleSupabaseError(error, "Failed to create item");
    return false;
  }
  return true;
};

export const updateItem = async (
  id: string,
  itemData: Partial<ItemData>
) => {
  const { error } = await supabase
    .from("items")
    .update(itemData)
    .eq('id', id);

  if (error) {
    handleSupabaseError(error, "Failed to update item");
    return false;
  }
  return true;
};

export const logActivity = async (
  roomNumber: string,
  itemName: string,
  actionType: string,
  details: string,
  userId: string,
  email: string,
  username: string | null
) => {
  const { error } = await supabase
    .from("activity_logs")
    .insert({
      room_number: roomNumber,
      item_name: itemName,
      action_type: actionType,
      details,
      user_id: userId,
      email,
      username,
    });

  if (error) {
    console.error("Failed to log activity:", error);
  }
};