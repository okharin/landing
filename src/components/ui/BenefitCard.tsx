
import React from 'react';
import { ArrowRight, Search, FileText, ArrowUp } from 'lucide-react';

interface BenefitCardProps {
  title: string;
  description: string;
  icon: string;
}

const BenefitCard: React.FC<BenefitCardProps> = ({ title, description, icon }) => {
  const getIcon = () => {
    switch (icon) {
      case 'arrow-right':
        return <ArrowRight className="h-6 w-6" />;
      case 'search':
        return <Search className="h-6 w-6" />;
      case 'file-text':
        return <FileText className="h-6 w-6" />;
      case 'arrow-up':
        return <ArrowUp className="h-6 w-6" />;
      default:
        return <ArrowRight className="h-6 w-6" />;
    }
  };

  return (
    <div className="bg-white dark:bg-duomind-purple-darker rounded-2xl p-8 shadow-md hover:shadow-xl transition-all duration-300">
      <div className="flex items-start gap-6">
        <div className="bg-duomind-purple text-white rounded-full h-14 w-14 flex items-center justify-center">
          {getIcon()}
        </div>
        <div>
          <h3 className="font-bold text-2xl mb-4">{title}</h3>
          <p className="text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  );
};

export default BenefitCard;
