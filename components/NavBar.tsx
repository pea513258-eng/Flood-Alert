import React from 'react';
import { LifeBuoy } from 'lucide-react';

export const NavBar: React.FC = () => {
  return (
    <nav className="bg-red-600 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <LifeBuoy className="w-6 h-6 animate-pulse" />
          <span className="font-bold text-lg tracking-wide">FloodRescueTH</span>
        </div>
        <div className="text-xs font-light bg-red-700 px-2 py-1 rounded">
          แจ้งเหตุฉุกเฉิน 24ชม.
        </div>
      </div>
    </nav>
  );
};