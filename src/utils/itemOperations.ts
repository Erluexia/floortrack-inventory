import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

interface ItemData {
  name: string;
  quantity: number;
  status: 'good' | 'maintenance' | 'low';
  room_number: string;
}

export const fetchItems = async (roomNumber: string) => {
  console.log("Fetching items for room:", roomNumber);
  const { data, error } = await supabase
    .from("current_status")
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

  const itemsMap = data.reduce((acc: { [key: string]: any }, item) => {
    if (!acc[item.name]) {
      acc[item.name] = {
        ...item,
        maintenanceCount: item.status === 'maintenance' ? item.quantity : 0,
        replacementCount: item.status === 'low' ? item.quantity : 0,
        goodCount: item.status === 'good' ? item.quantity : 0,
      };
    } else {
      if (item.status === 'maintenance') {
        acc[item.name].maintenanceCount = item.quantity;
      } else if (item.status === 'low') {
        acc[item.name].replacementCount = item.quantity;
      } else {
        acc[item.name].goodCount = item.quantity;
      }
      acc[item.name].quantity += item.quantity;
    }
    return acc;
  }, {});

  console.log("Processed items:", Object.values(itemsMap));
  return Object.values(itemsMap);
};

export const updateItem = async (
  item: ItemData,
  maintenanceCount: number,
  replacementCount: number,
  totalQuantity: number,
  roomNumber: string
) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    toast({
      title: "Error",
      description: "You must be logged in to update items",
      variant: "destructive",
    });
    return false;
  }

  // Delete existing item
  const { error: deleteError } = await supabase
    .from("current_status")
    .delete()
    .eq("name", item.name)
    .eq("room_number", roomNumber);

  if (deleteError) {
    toast({
      title: "Error",
      description: "Failed to update item",
      variant: "destructive",
    });
    return false;
  }

  // Create new items with updated quantities
  const insertPromises = [];

  if (maintenanceCount > 0) {
    insertPromises.push(
      supabase
        .from("current_status")
        .insert({
          name: item.name,
          quantity: maintenanceCount,
          status: 'maintenance',
          room_number: roomNumber,
        })
    );
  }

  if (replacementCount > 0) {
    insertPromises.push(
      supabase
        .from("current_status")
        .insert({
          name: item.name,
          quantity: replacementCount,
          status: 'low',
          room_number: roomNumber,
        })
    );
  }

  const goodQuantity = totalQuantity - maintenanceCount - replacementCount;
  if (goodQuantity > 0) {
    insertPromises.push(
      supabase
        .from("current_status")
        .insert({
          name: item.name,
          quantity: goodQuantity,
          status: 'good',
          room_number: roomNumber,
        })
    );
  }

  const results = await Promise.all(insertPromises);
  const hasError = results.some(result => result.error);

  if (hasError) {
    toast({
      title: "Error",
      description: "Failed to update item quantities",
      variant: "destructive",
    });
    return false;
  }

  return true;
};

export const deleteItem = async (item: ItemData) => {
  const { error } = await supabase
    .from("current_status")
    .delete()
    .eq("name", item.name)
    .eq("room_number", item.room_number);

  if (error) {
    toast({
      title: "Error",
      description: "Failed to delete item",
      variant: "destructive",
    });
    return false;
  }

  return true;
};

export const addItem = async (
  name: string,
  totalQuantity: number,
  maintenanceCount: number,
  replacementCount: number,
  roomNumber: string
) => {
  const insertPromises = [];

  if (maintenanceCount > 0) {
    insertPromises.push(
      supabase
        .from("current_status")
        .insert({
          name,
          quantity: maintenanceCount,
          status: 'maintenance',
          room_number: roomNumber,
        })
    );
  }

  if (replacementCount > 0) {
    insertPromises.push(
      supabase
        .from("current_status")
        .insert({
          name,
          quantity: replacementCount,
          status: 'low',
          room_number: roomNumber,
        })
    );
  }

  const goodQuantity = totalQuantity - maintenanceCount - replacementCount;
  if (goodQuantity > 0) {
    insertPromises.push(
      supabase
        .from("current_status")
        .insert({
          name,
          quantity: goodQuantity,
          status: 'good',
          room_number: roomNumber,
        })
    );
  }

  const results = await Promise.all(insertPromises);
  const hasError = results.some(result => result.error);

  if (hasError) {
    toast({
      title: "Error",
      description: "Failed to add item",
      variant: "destructive",
    });
    return false;
  }

  return true;
};