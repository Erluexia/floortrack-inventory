import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export interface ItemStatusCounts {
  total: number;
  good: number;
  maintenance: number;
  replacement: number;
}

export const fetchItemStatus = async (roomNumber: string) => {
  console.log("Fetching items for room:", roomNumber);
  const { data, error } = await supabase
    .from("currentitem")
    .select("*")
    .eq("room_number", roomNumber)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching items:", error);
    toast({
      title: "Error",
      description: "Failed to fetch items",
      variant: "destructive",
    });
    return [];
  }

  return data;
};

export const fetchPreviousStatus = async (roomNumber: string) => {
  console.log("Fetching previous status for room:", roomNumber);
  const { data, error } = await supabase
    .from("itemhistory")
    .select(`
      id,
      item_id,
      name,
      quantity,
      status,
      room_number,
      changed_at
    `)
    .eq("room_number", roomNumber)
    .order("changed_at", { ascending: false });

  if (error) {
    console.error("Error fetching previous status:", error);
    toast({
      title: "Error",
      description: "Failed to fetch previous status",
      variant: "destructive",
    });
    return [];
  }

  return data;
};

export const subscribeToItemChanges = (roomNumber: string, onUpdate: () => void) => {
  console.log("Setting up realtime subscription for room:", roomNumber);
  return supabase
    .channel('items-channel')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'currentitem',
        filter: `room_number=eq.${roomNumber}`,
      },
      (payload) => {
        console.log('Items changed:', payload);
        onUpdate();
      }
    )
    .subscribe();
};