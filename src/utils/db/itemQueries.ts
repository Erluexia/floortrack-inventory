import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export interface ItemStatusCounts {
  total: number;
  good: number;
  maintenance: number;
  replacement: number;
}

export const fetchItemStatus = async (roomNumber: string) => {
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

  return data;
};

export const fetchPreviousStatus = async (roomNumber: string) => {
  const { data, error } = await supabase
    .from("previous_status")
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
  return supabase
    .channel('items-channel')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'current_status',
        filter: `room_number=eq.${roomNumber}`,
      },
      () => {
        console.log('Items changed, refreshing data');
        onUpdate();
      }
    )
    .subscribe();
};