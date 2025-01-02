import { useParams } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { InventoryTable } from "@/components/inventory/InventoryTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ActivityLog } from "@/components/inventory/ActivityLog";
import { PreviousStatus } from "@/components/inventory/PreviousStatus";

const Room = () => {
  const { id } = useParams();

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">Room {id}</h2>
            <p className="text-sm text-gray-500 mt-1">Manage inventory for this room</p>
          </div>
          
          <Tabs defaultValue="current" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="current">Current Status</TabsTrigger>
              <TabsTrigger value="previous">Previous Status</TabsTrigger>
              <TabsTrigger value="activity">Activity Log</TabsTrigger>
            </TabsList>
            
            <TabsContent value="current">
              <InventoryTable roomNumber={id || ""} />
            </TabsContent>
            
            <TabsContent value="previous">
              <PreviousStatus roomNumber={id || ""} />
            </TabsContent>
            
            <TabsContent value="activity">
              <ActivityLog roomNumber={id || ""} />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default Room;