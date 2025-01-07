import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface RoomCount {
  room_number: string;
  total_count: string;
  good_count: string;
  maintenance_count: string;
  replacement_count: string;
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

      const counts: Record<string, {
        total: number;
        good: number;
        maintenance: number;
        replacement: number;
      }> = {};
      
      (data as unknown as RoomCount[]).forEach((item) => {
        counts[item.room_number] = {
          total: parseInt(item.total_count),
          good: parseInt(item.good_count),
          maintenance: parseInt(item.maintenance_count),
          replacement: parseInt(item.replacement_count),
        };
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
              const roomData = itemCounts?.[roomNumber] || { total: 0, good: 0, maintenance: 0, replacement: 0 };

              const getBgColor = () => {
                if (roomData.maintenance > 0) return 'bg-yellow-50 hover:bg-yellow-100';
                if (roomData.replacement > 0) return 'bg-red-50 hover:bg-red-100';
                if (roomData.good > 0) return 'bg-green-50 hover:bg-green-100';
                return 'bg-gray-50 hover:bg-gray-100';
              };

              return (
                <div key={room} className="flex flex-col items-center">
                  <button
                    onClick={() => navigate(`/room/${roomNumber}`)}
                    className={`aspect-square w-full rounded-lg flex items-center justify-center transition-colors ${getBgColor()}`}
                  >
                    <span className="text-sm font-medium">{room}</span>
                  </button>
                  <div className="text-xs text-gray-500 mt-1 flex flex-col items-center">
                    <span>{roomData.total} items</span>
                    {roomData.maintenance > 0 && (
                      <span className="text-yellow-600">{roomData.maintenance} maintenance</span>
                    )}
                    {roomData.replacement > 0 && (
                      <span className="text-red-600">{roomData.replacement} replacement</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};