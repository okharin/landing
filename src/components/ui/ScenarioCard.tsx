
import React from 'react';

interface ScenarioCardProps {
  title: string;
  description: string;
  result: string;
}

const ScenarioCard: React.FC<ScenarioCardProps> = ({ title, description, result }) => {
  return (
    <div className="bg-white dark:bg-duomind-purple-darker rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300">
      <div className="p-6 border-b border-muted">
        <h3 className="font-bold text-xl mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
      <div className="p-6 bg-gradient-duomind-light dark:bg-duomind-purple-dark/20">
        <p className="font-semibold mb-1">Результат:</p>
        <p>{result}</p>
      </div>
    </div>
  );
};

export default ScenarioCard;
