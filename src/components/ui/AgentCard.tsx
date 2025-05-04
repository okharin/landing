
import React from 'react';
import { ArrowRight, Search, FileText, Code, Users } from 'lucide-react';

interface AgentCardProps {
  title: string;
  description: string;
  icon: string;
}

const AgentCard: React.FC<AgentCardProps> = ({ title, description, icon }) => {
  const getIcon = () => {
    switch (icon) {
      case 'search':
        return <Search className="h-5 w-5" />;
      case 'file-text':
        return <FileText className="h-5 w-5" />;
      case 'code':
        return <Code className="h-5 w-5" />;
      case 'users':
        return <Users className="h-5 w-5" />;
      default:
        return <ArrowRight className="h-5 w-5" />;
    }
  };

  return (
    <div className="bg-white dark:bg-duomind-purple-darker rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 h-full">
      <div className="bg-duomind-purple/10 rounded-full h-12 w-12 flex items-center justify-center mb-6">
        <div className="text-duomind-purple">
          {getIcon()}
        </div>
      </div>
      
      <h3 className="font-bold text-xl mb-3">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
};

export default AgentCard;
