import React from 'react';
import { AdminPanel } from './AdminPanel';

export const DLCAdminPanel: React.FC = () => {
  return (
    <div>
      <div className="mb-4">
        <h1 className="text-4xl font-bold text-forest-deep">DLC Admin Panel</h1>
        <p className="text-forest-medium">District Level Committee</p>
      </div>
      <AdminPanel />
    </div>
  );
};

export default DLCAdminPanel;

