import React, { useState, useEffect } from 'react';
const BackendLayer = () => {
    const [output, setOutput] = useState([]);
    const [input, setInput] = useState('');

    useEffect(() => {
        const ws = new WebSocket('ws://localhost:8080');

        ws.onopen = () => {
            setOutput(prev => [...prev, { type: 'info', message: 'Connected to WebSocket' }]);
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                setOutput(prev => [...prev, data]);
            } catch (error) {
                setOutput(prev => [...prev, { type: 'info', message: event.data }]);
            }
        };

        ws.onclose = () => {
            setOutput(prev => [...prev, { type: 'info', message: 'Disconnected from WebSocket' }]);
        };

        return () => {
            ws.close();
        };
    }, []);

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
        switch (command) {
            case 'help':
                setOutput(prev => [...prev, { type: 'info', message: 'Available commands: help, clear' }]);
                break;
            case 'clear':
                setOutput([]);
                break;
            default:
                setOutput(prev => [...prev, { type: 'error', message: `Command not found: ${command}` }]);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <h2 className="text-4xl font-bold mb-8">Backend Layer</h2>
                <div className="terminal w-full max-w-2xl mx-auto">
                    <div className="terminal-output h-64 overflow-y-auto">
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
        </div>
    );
};

export default BackendLayer;