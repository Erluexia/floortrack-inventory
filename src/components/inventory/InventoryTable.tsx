import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/StatusBadge";

interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  status: "good" | "maintenance" | "low";
  lastUpdated: string;
}

const mockItems: InventoryItem[] = [
  {
    id: "1",
    name: "Student Chair",
    quantity: 40,
    status: "good",
    lastUpdated: "2024-02-20",
  },
  {
    id: "2",
    name: "Teacher's Desk",
    quantity: 1,
    status: "maintenance",
    lastUpdated: "2024-02-19",
  },
  {
    id: "3",
    name: "Whiteboard",
    quantity: 2,
    status: "good",
    lastUpdated: "2024-02-18",
  },
  {
    id: "4",
    name: "Projector",
    quantity: 1,
    status: "low",
    lastUpdated: "2024-02-17",
  },
];

export const InventoryTable = () => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Item Name</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Updated</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockItems.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell>{item.quantity}</TableCell>
              <TableCell>
                <StatusBadge status={item.status} />
              </TableCell>
              <TableCell>{item.lastUpdated}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};