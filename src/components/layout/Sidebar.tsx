import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const floors = [1, 2, 3, 4, 5, 6];

export const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  return (
    <div
      className={cn(
        "h-screen bg-white border-r border-gray-200 transition-all duration-300 flex flex-col",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className={cn("flex items-center", isCollapsed && "justify-center")}>
          <Building2 className="h-6 w-6 text-primary" />
          {!isCollapsed && <span className="ml-2 font-semibold">MCPI Inventory</span>}
        </div>
        <button
          onClick={toggleSidebar}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {floors.map((floor) => (
          <div key={floor} className="mb-4">
            <div className="text-sm font-medium text-gray-500 mb-2">
              {!isCollapsed && `Floor ${floor}`}
            </div>
            <div className="space-y-1">
              {Array.from({ length: 8 }, (_, i) => i + 2).map((room) => (
                <button
                  key={room}
                  onClick={() => navigate(`/room/${floor}${room.toString().padStart(2, "0")}`)}
                  className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  {isCollapsed ? `${floor}${room.toString().padStart(2, "0")}` : `Room ${floor}${room.toString().padStart(2, "0")}`}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};