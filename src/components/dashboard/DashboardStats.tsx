import { AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const DashboardStats = () => {
  const { data: stats } = useQuery({
    queryKey: ['itemStats'],
    queryFn: async () => {
      const { data: items, error } = await supabase
        .from('current_status')
        .select('status, quantity');

      if (error) throw error;

      const total = items.reduce((sum, item) => sum + item.quantity, 0);
      const maintenance = items
        .filter(item => item.status === 'maintenance')
        .reduce((sum, item) => sum + item.quantity, 0);
      const replacement = items
        .filter(item => item.status === 'low')
        .reduce((sum, item) => sum + item.quantity, 0);

      return { total, maintenance, replacement };
    }
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Items</p>
            <p className="text-2xl font-semibold mt-1">{stats?.total || 0}</p>
          </div>
          <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-6 w-6 text-primary" />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Need Maintenance</p>
            <p className="text-2xl font-semibold mt-1">{stats?.maintenance || 0}</p>
          </div>
          <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
            <Clock className="h-6 w-6 text-yellow-600" />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Need Replacement</p>
            <p className="text-2xl font-semibold mt-1">{stats?.replacement || 0}</p>
          </div>
          <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
        </div>
      </div>
    </div>
  );
};