
import React from 'react';
import { Users, Code, CalendarDays, Search } from 'lucide-react';

interface TargetCardProps {
  title: string;
  description: string;
  icon: string;
}

const TargetCard: React.FC<TargetCardProps> = ({ title, description, icon }) => {
  const getIcon = () => {
    switch (icon) {
      case 'users':
        return <Users className="h-5 w-5" />;
      case 'code':
        return <Code className="h-5 w-5" />;
      case 'calendar-days':
        return <CalendarDays className="h-5 w-5" />;
      case 'search':
        return <Search className="h-5 w-5" />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white dark:bg-duomind-purple-darker rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 h-full">
      <div className="flex gap-4 items-start">
        <div className="bg-duomind-purple text-white rounded-full h-10 w-10 flex items-center justify-center">
          {getIcon()}
        </div>
        <div>
          <h3 className="font-bold text-lg mb-2">{title}</h3>
          <p className="text-muted-foreground text-sm">{description}</p>
        </div>
      </div>
    </div>
  );
};

export default TargetCard;
