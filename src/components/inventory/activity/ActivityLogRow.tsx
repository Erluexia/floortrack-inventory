import { format } from "date-fns";
import { User, ArrowRight } from "lucide-react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronRight } from "lucide-react";

interface ActivityLogRowProps {
  log: {
    id: string;
    item_name: string;
    action_type: string;
    details: string;
    created_at: string;
    email: string | null;
    username: string | null;
    previous_status: string | null;
    current_status: string | null;
  };
}

export const ActivityLogRow = ({ log }: ActivityLogRowProps) => {
  const getStatusBadgeClass = (status: string | null) => {
    switch (status) {
      case 'good':
        return 'bg-green-100 text-green-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatActionMessage = () => {
    const timestamp = format(new Date(log.created_at), 'MMM d, yyyy HH:mm:ss');
    
    switch (log.action_type) {
      case 'edit':
        if (log.previous_status && log.current_status) {
          return (
            <div className="flex items-center gap-2">
              <span className="font-medium">{log.item_name}</span>
              <span>has been edited by</span>
              <span className="font-semibold">{log.username || "Unknown"}</span>
              <span>from</span>
              <span className={`px-2 py-1 rounded text-sm ${getStatusBadgeClass(log.previous_status)}`}>
                {log.previous_status}
              </span>
              <ArrowRight className="h-4 w-4 text-gray-400" />
              <span className={`px-2 py-1 rounded text-sm ${getStatusBadgeClass(log.current_status)}`}>
                {log.current_status}
              </span>
            </div>
          );
        }
        return null;
      
      default:
        return (
          <div className="flex items-center gap-2">
            <span className="font-medium">{log.item_name}</span>
            <span className="text-gray-600">{log.details}</span>
          </div>
        );
    }
  };

  return (
    <Collapsible asChild>
      <>
        <TableRow className="cursor-pointer hover:bg-gray-50">
          <TableCell>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="icon" className="h-4 w-4 p-0">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </CollapsibleTrigger>
          </TableCell>
          <TableCell>{formatActionMessage()}</TableCell>
          <TableCell className="text-muted-foreground">
            {format(new Date(log.created_at), 'MMM d, yyyy HH:mm:ss')}
          </TableCell>
        </TableRow>
        <CollapsibleContent asChild>
          <TableRow className="bg-gray-50">
            <TableCell colSpan={4} className="p-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span className="font-semibold">{log.username || "Unknown User"}</span>
                  {log.email && (
                    <>
                      <span>•</span>
                      <span>{log.email}</span>
                    </>
                  )}
                </div>
              </div>
            </TableCell>
          </TableRow>
        </CollapsibleContent>
      </>
    </Collapsible>
  );
};