import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface RoomCount {
  room_number: string;
  count: string;
}

export const RoomGrid = () => {
  const navigate = useNavigate();
  const floors = [1, 2, 3, 4, 5, 6];

  const { data: itemCounts } = useQuery({
    queryKey: ['itemCountsByRoom'],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('count_items_by_room');

      if (error) {
        console.error('Error fetching item counts:', error);
        return {};
      }

      // Convert array of room counts to a record object
      const counts: Record<string, number> = {};
      (data as RoomCount[] || []).forEach((item) => {
        counts[item.room_number] = parseInt(item.count);
      });
      
      return counts;
    }
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 gap-6 p-4">
      {floors.map((floor) => (
        <div key={floor} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Floor {floor}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {Array.from({ length: 8 }, (_, i) => i + 2).map((room) => {
              const roomNumber = `${floor}${room.toString().padStart(2, "0")}`;
              const itemCount = itemCounts?.[roomNumber] || 0;

              return (
                <div key={room} className="flex flex-col items-center">
                  <button
                    onClick={() => navigate(`/room/${roomNumber}`)}
                    className={`aspect-square w-full rounded-lg flex items-center justify-center transition-colors 
                      ${itemCount > 0 ? 'bg-green-50 hover:bg-green-100' : 'bg-gray-50 hover:bg-gray-100'}`}
                  >
                    <span className="text-sm font-medium">{room}</span>
                  </button>
                  <span className="text-xs text-gray-500 mt-1">
                    {itemCount} items
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};