import { useNavigate } from "react-router-dom";

export const RoomGrid = () => {
  const navigate = useNavigate();
  const floors = [1, 2, 3, 4, 5, 6];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {floors.map((floor) => (
        <div key={floor} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Floor {floor}</h3>
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 8 }, (_, i) => i + 2).map((room) => (
              <button
                key={room}
                onClick={() => navigate(`/room/${floor}${room.toString().padStart(2, "0")}`)}
                className="aspect-square bg-gray-50 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
              >
                <span className="text-sm font-medium">{room}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};