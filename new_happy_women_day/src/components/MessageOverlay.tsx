import React from 'react';

export const MessageOverlay: React.FC = () => {
  return (
    <div className="z-10 absolute inset-0 flex flex-col justify-center items-center pointer-events-none">
      <div className="mt-32 text-center">
        <h2 className="bg-white/50 shadow-lg backdrop-blur-sm mb-4 p-4 rounded-lg text-purple-900 text-2xl md:text-3xl animate-pulse">
          Happy Women's Day
        </h2>

        <div className="bg-white/30 shadow-lg backdrop-blur-sm mx-auto p-5 rounded-lg max-w-md">
          <p className="text-purple-800 text-sm md:text-base leading-relaxed">
            "To all wonderful women-your beauty transcends appearance,
            <br />
            your charm lights up hearts,
            <br />
            and your presence is truly priceless."
            <br />
            You are the melody that completes the harmony of life,
            <br />
            the strength behind every dream.
            <br />
            Thank you for being you, for inspiring, for existing.
          </p>
        </div>
      </div>
    </div>
  );
};
