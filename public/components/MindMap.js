import React, { useEffect } from 'react';
const MindMap = ({ toggleMindMap }) => {
    useEffect(() => {
        gsap.from('.mind-map-node', { opacity: 0, scale: 0.5, duration: 0.5, stagger: 0.2 });
    }, []);

    return (
        <div className="fixed top-0 left-0 w-full h-full bg-gray-900 bg-opacity-95 flex items-center justify-center z-20">
            <button onClick={toggleMindMap} className="absolute top-4 right-4 text-white text-2xl">&times;</button>
            <svg width="800" height="600" viewBox="0 0 800 600">
                <rect x="0" y="0" width="800" height="600" fill="#1a202c" />

                {/* Center Node */}
                <g className="mind-map-node">
                    <circle cx="400" cy="300" r="50" fill="#4299e1" />
                    <text x="360" y="305" fill="white">Developer's Mind</text>
                </g>

                {/* Skill Nodes */}
                <g className="mind-map-node">
                    <circle cx="200" cy="200" r="40" fill="#48bb78" />
                    <text x="180" y="205" fill="white">Skills</text>
                </g>
                <path d="M 350 280 L 240 220" stroke="white" strokeWidth="2" />

                {/* Project Nodes */}
                <g className="mind-map-node">
                    <circle cx="600" cy="200" r="40" fill="#f56565" />
                    <text x="575" y="205" fill="white">Projects</text>
                </g>
                <path d="M 450 280 L 560 220" stroke="white" strokeWidth="2" />

                {/* Philosophy Nodes */}
                <g className="mind-map-node">
                    <circle cx="400" cy="500" r="40" fill="#9f7aea" />
                    <text x="365" y="505" fill="white">Philosophy</text>
                </g>
                <path d="M 400 350 L 400 460" stroke="white" strokeWidth="2" />
            </svg>
        </div>
    );
};

export default MindMap;