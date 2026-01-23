import React from 'react';
import { 
  MapIcon, 
  CurrencyDollarIcon, 
  ClockIcon, 
  UserIcon 
} from '@heroicons/react/24/outline';

const ActionButton = ({ icon: Icon, label, onClick }) => (
  <button 
    onClick={onClick}
    className="bg-card hover:bg-surface transition-colors 
               p-4 rounded-lg flex flex-col items-center 
               justify-center space-y-2 border border-border"
  >
    <Icon className="h-8 w-8 text-primary" />
    <span className="text-text-secondary text-sm">{label}</span>
  </button>
);

const DriverActions = () => {
  const actions = [
    { 
      icon: MapIcon, 
      label: 'View Routes', 
      onClick: () => console.log('View Routes') 
    },
    { 
      icon: CurrencyDollarIcon, 
      label: 'Earnings', 
      onClick: () => console.log('View Earnings') 
    },
    { 
      icon: ClockIcon, 
      label: 'Shift History', 
      onClick: () => console.log('View Shift History') 
    },
    { 
      icon: UserIcon, 
      label: 'Profile', 
      onClick: () => console.log('View Profile') 
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
      {actions.map((action, index) => (
        <ActionButton 
          key={index} 
          icon={action.icon} 
          label={action.label} 
          onClick={action.onClick} 
        />
      ))}
    </div>
  );
};

export default DriverActions;