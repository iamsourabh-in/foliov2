import React, { useState, useEffect } from 'react';
const LiveTerminal = ({ toggleTerminal }) => {
    const [output, setOutput] = useState([]);
    const [input, setInput] = useState('');
    const files = {
        'about.md': 'Sourabh Rustagi is a Full-Stack Developer with over 12 years of experience.',
        'skills.md': 'React, Node.js, AWS, Kubernetes, Go, Python, and more.',
        'projects.md': 'Check out the projects section for more details.',
    };

    const handleInputChange = (e) => {
        setInput(e.target.value);
    };

    const handleInputKeyDown = (e) => {
        if (e.key === 'Enter') {
            const command = input.trim();
            setOutput(prev => [...prev, { type: 'command', message: `> ${command}` }]);
            executeCommand(command);
            setInput('');
        }
    };

    const executeCommand = (command) => {
        const [cmd, ...args] = command.split(' ');
        switch (cmd) {
            case 'help':
                setOutput(prev => [...prev, { type: 'info', message: 'Available commands: help, ls, cat, clear' }]);
                break;
            case 'ls':
                setOutput(prev => [...prev, { type: 'info', message: Object.keys(files).join(' ') }]);
                break;
            case 'cat':
                const fileName = args[0];
                if (fileName && files[fileName]) {
                    setOutput(prev => [...prev, { type: 'info', message: files[fileName] }]);
                } else {
                    setOutput(prev => [...prev, { type: 'error', message: `File not found: ${fileName}` }]);
                }
                break;
            case 'clear':
                setOutput([]);
                break;
            default:
                setOutput(prev => [...prev, { type: 'error', message: `Command not found: ${command}` }]);
        }
    };

    return (
        <div className="fixed top-0 left-0 w-full h-full bg-gray-900 bg-opacity-95 flex items-center justify-center z-20">
            <button onClick={toggleTerminal} className="absolute top-4 right-4 text-white text-2xl">&times;</button>
            <div className="terminal w-full max-w-4xl h-3/4 mx-auto">
                <div className="terminal-output h-full overflow-y-auto">
                    {output.map((line, index) => (
                        <div key={index}>
                            <span className={`${line.type === 'info' ? 'text-green-400' : line.type === 'error' ? 'text-red-400' : 'text-white'}`}>
                                {line.message}
                            </span>
                        </div>
                    ))}
                </div>
                <div className="flex p-2">
                    <span className="text-green-400 mr-2">&gt;</span>
                    <input
                        type="text"
                        value={input}
                        onChange={handleInputChange}
                        onKeyDown={handleInputKeyDown}
                        className="bg-transparent text-white border-none focus:outline-none w-full"
                        autoFocus
                    />
                </div>
            </div>
        </div>
    );
};

export default LiveTerminal;