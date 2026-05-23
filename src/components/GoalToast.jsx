import React from 'react';
import { useApp } from '../context/AppContext.jsx';

export default function GoalToast() {
  const { goalToast } = useApp();

  if (!goalToast) return null;

  return (
    <div className="absolute top-[35%] left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-4 duration-300 pointer-events-none">
      <div className="bg-surface border border-accent-primary rounded-2xl py-12 px-12 flex justify-center shadow-toast">
        <div className="relative z-10 flex flex-col items-center">
          <h2 className="text-7xl">🥳</h2>
          <h2 className="text-3xl mt-3 font-black text-transparent bg-clip-text bg-gradient-to-r from-accent-primary to-accent-tertiary-alt text-center">
            Task Complete!
          </h2>
          <p className="text-secondary mt-3 font-bold text-center">Way to go!</p>
        </div>
      </div>
    </div>
  );
}
