const { useState, useEffect } = React;

// Header Component
const Header = ({ setLayer, toggleTheme, theme, toggleMindMap, toggleTerminal }) => {
    return (
        <header className="fixed top-0 left-0 right-0 z-10 flex justify-between items-center p-4 bg-opacity-50 bg-gray-900 backdrop-blur-md">
            <h1 className="text-2xl font-bold">Journey Through the Stack</h1>
            <nav>
                <button onClick={() => setLayer('landing')} className="mr-4">Home</button>
                <button onClick={() => setLayer('frontend')} className="mr-4">Frontend</button>
                <button onClick={() => setLayer('backend')} className="mr-4">Backend</button>
                <button onClick={() => setLayer('cloud')} className="mr-4">Cloud</button>
                <button onClick={() => setLayer('kubernetes')} className="mr-4">Kubernetes</button>
                <button onClick={toggleMindMap} className="mr-4">Developer's Mind</button>
                <button onClick={toggleTerminal} className="mr-4">Live Terminal</button>
                <button onClick={toggleTheme}>{theme === 'dark' ? 'Light' : 'Dark'} Mode</button>
            </nav>
        </header>
    );
};

// Landing Page Component
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

// Frontend Layer Component
const FrontendLayer = ({ unlockAchievement }) => {
    const [components, setComponents] = useState([
        { id: 1, type: 'Input', text: 'Input Field' },
        { id: 2, type: 'Button', text: 'Click Me' },
        { id: 3, type: 'TextArea', text: 'Text Area' },
    ]);
    const [droppedComponents, setDroppedComponents] = useState([]);

    const handleDragStart = (e, component) => {
        e.dataTransfer.setData('component', JSON.stringify(component));
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const component = JSON.parse(e.dataTransfer.getData('component'));
        setDroppedComponents([...droppedComponents, component]);
    };

    useEffect(() => {
        if (droppedComponents.length === components.length) {
            unlockAchievement({ id: 1, name: 'Frontend Novice' });
        }
    }, [droppedComponents]);

    useEffect(() => {
        gsap.from('.frontend-layer', { opacity: 0, scale: 0.9, duration: 0.5 });
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center frontend-layer">
            <div className="text-center">
                <h2 className="text-4xl font-bold mb-8">Frontend Layer</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h3 className="text-2xl font-bold mb-4">Mini-Game: Build a UI</h3>
                        <div className="flex justify-center space-x-4 mb-4">
                            {components.map((component) => (
                                <div
                                    key={component.id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, component)}
                                    className="p-4 bg-gray-700 rounded-lg cursor-pointer"
                                >
                                    {component.text}
                                </div>
                            ))}
                        </div>
                        <div
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                            className="p-8 bg-gray-800 rounded-lg min-h-[200px]"
                        >
                            {droppedComponents.map((component, index) => (
                                <div key={index} className="p-2 bg-gray-600 rounded-lg mb-2">
                                    {component.text}
                                </div>
                            ))}
                            {droppedComponents.length === 0 && <p>Drop components here</p>}
                        </div>
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold mb-4">Skills</h3>
                        <ul>
                            <li>React</li>
                            <li>Tailwind CSS</li>
                            <li>JavaScript</li>
                            <li>GSAP</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Backend Layer Component
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

// Cloud Layer Component
const CloudLayer = () => {
    useEffect(() => {
        const tl = gsap.timeline({ repeat: -1, yoyo: true });
        tl.to("#user", { opacity: 1, duration: 0.5 })
          .to("#load-balancer", { opacity: 1, duration: 0.5 })
          .to(".ec2-instance", { opacity: 1, stagger: 0.3, duration: 0.5 })
          .to("#database", { opacity: 1, duration: 0.5 });
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <h2 className="text-4xl font-bold mb-8">Cloud Layer</h2>
                <svg width="600" height="400" viewBox="0 0 600 400">
                    <defs>
                        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" style={{ stopColor: 'rgb(255,255,0)', stopOpacity: 1 }} />
                            <stop offset="100%" style={{ stopColor: 'rgb(255,165,0)', stopOpacity: 1 }} />
                        </linearGradient>
                    </defs>
                    <rect x="0" y="0" width="600" height="400" fill="#1a202c" />

                    {/* User */}
                    <g id="user" opacity="0.2">
                        <circle cx="50" cy="200" r="20" fill="#4299e1" />
                        <text x="40" y="230" fill="white">User</text>
                    </g>

                    {/* Load Balancer */}
                    <g id="load-balancer" opacity="0.2">
                        <rect x="150" y="180" width="80" height="40" fill="#48bb78" />
                        <text x="160" y="205" fill="white">Load Balancer</text>
                    </g>

                    {/* EC2 Instances */}
                    <g className="ec2-instance" opacity="0.2">
                        <rect x="300" y="100" width="60" height="40" fill="#f56565" />
                        <text x="310" y="125" fill="white">EC2</text>
                    </g>
                    <g className="ec2-instance" opacity="0.2">
                        <rect x="300" y="180" width="60" height="40" fill="#f56565" />
                        <text x="310" y="205" fill="white">EC2</text>
                    </g>
                    <g className="ec2-instance" opacity="0.2">
                        <rect x="300" y="260" width="60" height="40" fill="#f56565" />
                        <text x="310" y="285" fill="white">EC2</text>
                    </g>

                    {/* Database */}
                    <g id="database" opacity="0.2">
                        <ellipse cx="450" cy="200" rx="40" ry="20" fill="#9f7aea" />
                        <text x="430" y="205" fill="white">Database</text>
                    </g>

                    {/* Arrows */}
                    <path d="M 70 200 L 150 200" stroke="white" strokeWidth="2" />
                    <path d="M 230 200 L 300 120" stroke="white" strokeWidth="2" />
                    <path d="M 230 200 L 300 200" stroke="white" strokeWidth="2" />
                    <path d="M 230 200 L 300 280" stroke="white" strokeWidth="2" />
                    <path d="M 360 120 L 410 180" stroke="white" strokeWidth="2" />
                    <path d="M 360 200 L 410 200" stroke="white" strokeWidth="2" />
                    <path d="M 360 280 L 410 220" stroke="white" strokeWidth="2" />
                </svg>
            </div>
        </div>
    );
};

// Kubernetes Layer Component
const KubernetesLayer = () => {
    const [pods, setPods] = useState([
        { name: 'portfolio-deployment-a8sde', status: 'Running' },
        { name: 'portfolio-deployment-8adj3', status: 'Running' },
        { name: 'portfolio-deployment-k2ksj', status: 'Pending' },
    ]);

    const scaleUp = () => {
        const newPod = {
            name: `portfolio-deployment-${Math.random().toString(36).substring(5)}`,
            status: 'Pending',
        };
        setPods(prev => [...prev, newPod]);
    };

    useEffect(() => {
        const interval = setInterval(() => {
            setPods(prevPods => {
                return prevPods.map(pod => {
                    if (pod.status === 'Pending') {
                        return { ...pod, status: 'Running' };
                    }
                    if (Math.random() < 0.1) {
                        return { ...pod, status: 'Succeeded' };
                    }
                    return pod;
                });
            });
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Running':
                return 'text-green-400';
            case 'Pending':
                return 'text-yellow-400';
            case 'Succeeded':
                return 'text-blue-400';
            default:
                return 'text-gray-400';
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <h2 className="text-4xl font-bold mb-8">Kubernetes Layer</h2>
                <div className="bg-gray-800 p-8 rounded-lg w-full max-w-2xl mx-auto">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-2xl font-bold">Pod Deployments</h3>
                        <button onClick={scaleUp} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Scale Up</button>
                    </div>
                    <table className="w-full text-left">
                        <thead>
                            <tr>
                                <th className="p-2">Name</th>
                                <th className="p-2">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pods.map((pod, index) => (
                                <tr key={index}>
                                    <td className="p-2">{pod.name}</td>
                                    <td className={`p-2 ${getStatusColor(pod.status)}`}>{pod.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// Chatbot Component
const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');

    const toggleChat = () => {
        setIsOpen(!isOpen);
    };

    const handleInputChange = (e) => {
        setInput(e.target.value);
    };

    const handleSendMessage = async () => {
        if (input.trim() === '') return;

        const newMessages = [...messages, { sender: 'user', text: input }];
        setMessages(newMessages);
        setInput('');

        const response = await fetch('/api/chatbot', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: input }),
        });

        const data = await response.json();
        setMessages([...newMessages, { sender: 'bot', text: data.reply }]);
    };

    return (
        <div className="fixed bottom-4 right-4">
            {isOpen ? (
                <div className="bg-gray-800 rounded-lg shadow-lg w-80 h-96 flex flex-col">
                    <div className="p-4 border-b border-gray-700">
                        <h3 className="text-lg font-bold">AI Chatbot</h3>
                    </div>
                    <div className="flex-1 p-4 overflow-y-auto">
                        {messages.map((msg, index) => (
                            <div key={index} className={`mb-2 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                                <span className={`inline-block p-2 rounded-lg ${msg.sender === 'user' ? 'bg-blue-500' : 'bg-gray-700'}`}>
                                    {msg.text}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className="p-4 border-t border-gray-700">
                        <div className="flex">
                            <input
                                type="text"
                                value={input}
                                onChange={handleInputChange}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                className="flex-1 bg-gray-700 rounded-l-lg p-2 focus:outline-none"
                            />
                            <button onClick={handleSendMessage} className="bg-blue-500 rounded-r-lg px-4">Send</button>
                        </div>
                    </div>
                </div>
            ) : (
                <button onClick={toggleChat} className="bg-blue-500 rounded-full w-16 h-16 flex items-center justify-center shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.962 8.962 0 01-4.331-.976a5.962 5.962 0 01-2.287-2.287A8.962 8.962 0 011 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM4.22 14.22a7.002 7.002 0 0011.56 0A7.002 7.002 0 004.22 14.22zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                </button>
            )}
        </div>
    );
};

// Achievements Component
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

// MindMap Component
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

// LiveTerminal Component
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


// Main App Component
const App = () => {
    const [layer, setLayer] = useState('landing');
    const [theme, setTheme] = useState('dark');
    const [achievements, setAchievements] = useState([]);
    const [showMindMap, setShowMindMap] = useState(false);
    const [showTerminal, setShowTerminal] = useState(false);

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        document.body.className = newTheme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-black';
    };

    const toggleMindMap = () => {
        setShowMindMap(!showMindMap);
    };

    const toggleTerminal = () => {
        setShowTerminal(!showTerminal);
    };

    const unlockAchievement = (achievement) => {
        if (!achievements.find(a => a.id === achievement.id)) {
            setAchievements(prev => [...prev, achievement]);
        }
    };

    const renderLayer = () => {
        switch (layer) {
            case 'frontend':
                return <FrontendLayer unlockAchievement={unlockAchievement} />;
            case 'backend':
                return <BackendLayer />;
            case 'cloud':
                return <CloudLayer />;
            case 'kubernetes':
                return <KubernetesLayer />;
            default:
                return <LandingPage setLayer={setLayer} />;
        }
    };

    return (
        <div>
            <Header setLayer={setLayer} toggleTheme={toggleTheme} theme={theme} toggleMindMap={toggleMindMap} toggleTerminal={toggleTerminal} />
            {renderLayer()}
            {showMindMap && <MindMap toggleMindMap={toggleMindMap} />}
            {showTerminal && <LiveTerminal toggleTerminal={toggleTerminal} />}
            <Chatbot />
            <Achievements achievements={achievements} />
        </div>
    );
};

ReactDOM.render(<App />, document.getElementById('root'));