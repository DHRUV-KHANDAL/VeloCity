import React from 'react';

const DriverStats = ({ rides, earnings, rating, onlineTime }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* Rides Stat Card */}
      <div className="bg-card p-4 rounded-lg">
        <div className="text-text-secondary text-sm mb-2">Rides</div>
        <div className="text-text-primary text-2xl font-bold">{rides}</div>
        <div className="text-success text-xs">+{rides > 0 ? 15 : 0}%</div>
      </div>

      {/* Earnings Stat Card */}
      <div className="bg-card p-4 rounded-lg">
        <div className="text-text-secondary text-sm mb-2">Earnings</div>
        <div className="text-text-primary text-2xl font-bold">
          ${earnings.toFixed(2)}
        </div>
        <div className="text-success text-xs">+{earnings > 0 ? 10 : 0}%</div>
      </div>

      {/* Rating Stat Card */}
      <div className="bg-card p-4 rounded-lg">
        <div className="text-text-secondary text-sm mb-2">Rating</div>
        <div className="text-text-primary text-2xl font-bold">
          {rating.toFixed(1)}★
        </div>
      </div>

      {/* Online Time Stat Card */}
      <div className="bg-card p-4 rounded-lg">
        <div className="text-text-secondary text-sm mb-2">Online Time</div>
        <div className="text-text-primary text-2xl font-bold">
          {Math.floor(onlineTime / 60)}h {onlineTime % 60}m
        </div>
      </div>
    </div>
  );
};

export default DriverStats;