import { Bell } from "lucide-react";

export const Header = () => {
  return (
    <header className="h-16 border-b border-gray-200 bg-white px-6 flex items-center justify-between">
      <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
      <div className="flex items-center space-x-4">
        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors relative">
          <Bell className="h-5 w-5 text-gray-600" />
          <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
        </button>
        <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center">
          <span className="text-white text-sm font-medium">JD</span>
        </div>
      </div>
    </header>
  );
};