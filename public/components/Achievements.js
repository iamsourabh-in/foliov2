import React, { useState, useEffect } from 'react';
const Achievements = ({ achievements }) => {
    return (
        <div className="fixed bottom-4 left-4 bg-gray-800 rounded-lg shadow-lg p-4 w-80">
            <h3 className="text-lg font-bold mb-2">Achievements</h3>
            <ul>
                {achievements.map((ach, index) => (
                    <li key={index} className="flex items-center mb-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        {ach.name}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Achievements;