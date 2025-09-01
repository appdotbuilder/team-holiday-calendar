import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

export function SampleDataNotice() {
  return (
    <Alert className="mb-6 border-blue-200 bg-blue-50/50">
      <Info className="h-4 w-4 text-blue-600" />
      <AlertDescription className="text-blue-800">
        <strong>Demo Mode:</strong> The backend handlers are currently placeholder implementations. 
        This demo shows the calendar interface design and structure. In a production environment, 
        team members and holidays would be loaded from your database.
      </AlertDescription>
    </Alert>
  );
}