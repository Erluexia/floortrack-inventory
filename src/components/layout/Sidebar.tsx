import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const floors = [1, 2, 3, 4, 5, 6];

export const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedFloors, setExpandedFloors] = useState<number[]>([]);
  const navigate = useNavigate();

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  const toggleFloor = (floor: number) => {
    setExpandedFloors((prev) =>
      prev.includes(floor) ? prev.filter((f) => f !== floor) : [...prev, floor]
    );
  };

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
        <button
          onClick={() => navigate("/")}
          className="w-full flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors mb-4"
        >
          <LayoutDashboard className="h-5 w-5" />
          {!isCollapsed && <span>Dashboard</span>}
        </button>

        {floors.map((floor) => (
          <Collapsible
            key={floor}
            open={expandedFloors.includes(floor)}
            onOpenChange={() => toggleFloor(floor)}
          >
            <CollapsibleTrigger className="w-full flex items-center justify-between p-2 hover:bg-gray-100 rounded-lg">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                {!isCollapsed && <span>Floor {floor}</span>}
              </div>
              {!isCollapsed && (
                expandedFloors.includes(floor) ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )
              )}
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="ml-4 space-y-1 mt-1">
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
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>
    </div>
  );
};