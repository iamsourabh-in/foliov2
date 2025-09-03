import React, { useEffect } from 'react';
const LandingPage = ({ setLayer }) => {
    useEffect(() => {
        gsap.from('.landing-content', { opacity: 0, y: 50, duration: 1 });
    }, []);

    return (
        <div className="h-screen flex items-center justify-center text-center landing-content">
            <div>
                <h2 className="text-5xl font-bold mb-4">Sourabh Rustagi</h2>
                <p className="text-2xl mb-8">Full-Stack Developer</p>
                <button onClick={() => setLayer('frontend')} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Descend the Stack</button>
            </div>
        </div>
    );
};

export default LandingPage;