import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { RoomGrid } from "@/components/dashboard/RoomGrid";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";

const Index = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <DashboardStats />
          <RoomGrid />
        </main>
      </div>
    </div>
  );
};

export default Index;