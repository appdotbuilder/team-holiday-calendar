import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Keyboard } from 'lucide-react';

export function KeyboardHints() {
  return (
    <Card className="mt-4 border-gray-200 bg-gray-50/50">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Keyboard className="w-4 h-4 text-gray-500" />
          <span className="font-medium">Navigation:</span>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Badge variant="outline" className="text-xs px-2">←→</Badge>
              <span>Week navigation</span>
            </div>
            <div className="flex items-center gap-1">
              <Badge variant="outline" className="text-xs px-2">T</Badge>
              <span>Today</span>
            </div>
            <div className="flex items-center gap-1">
              <Badge variant="outline" className="text-xs px-2">Tab</Badge>
              <span>Focus controls</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}