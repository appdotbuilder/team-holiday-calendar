import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Plus, Calendar } from 'lucide-react';

interface EmptyStateProps {
  onAddTeamMember?: () => void;
}

export function EmptyState({ onAddTeamMember }: EmptyStateProps) {
  return (
    <div className="text-center py-16">
      <div className="max-w-md mx-auto">
        {/* Icon */}
        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
          <Users className="w-12 h-12 text-gray-400" />
        </div>
        
        {/* Title and description */}
        <h3 className="text-2xl font-semibold text-gray-700 mb-3">
          No Team Members Yet
        </h3>
        <p className="text-gray-500 text-lg mb-8">
          Get started by adding your team members to begin tracking holidays and time off.
        </p>
        
        {/* Features preview */}
        <div className="grid grid-cols-1 gap-4 mb-8">
          <Card className="border border-gray-200 bg-gray-50/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Calendar className="w-5 h-5 text-blue-500" />
                <span>Weekly calendar view for easy planning</span>
              </div>
            </CardContent>
          </Card>
          <Card className="border border-gray-200 bg-gray-50/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Users className="w-5 h-5 text-green-500" />
                <span>Track holidays for all team members</span>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Action button (if handler provided) */}
        {onAddTeamMember && (
          <Button 
            onClick={onAddTeamMember}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add First Team Member
          </Button>
        )}
        
        {/* Demo note */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-400">
            💡 In production, team members would be managed through your admin interface
          </p>
        </div>
      </div>
    </div>
  );
}