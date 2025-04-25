
import { Info } from "lucide-react";

interface MondayInfoProps {
  mondayId?: string;
}

export const MondayInfo = ({ mondayId }: MondayInfoProps) => {
  if (!mondayId) return null;

  return (
    <div className="space-y-2 py-2">
      <h3 className="font-semibold flex items-center">
        <Info className="h-4 w-4 mr-2 text-blue-500" />
        Information Monday.com
      </h3>
      <div className="bg-blue-50 p-3 rounded-md border border-blue-100">
        <p><span className="font-medium">ID Monday:</span> {mondayId}</p>
        <p className="text-xs text-blue-600 mt-1">
          Cet élément a été synchronisé avec Monday.com
        </p>
      </div>
    </div>
  );
};
