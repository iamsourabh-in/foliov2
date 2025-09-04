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
                {/* <button onClick={toggleTheme}>{theme === 'dark' ? 'Light' : 'Dark'} Mode</button> */}
            </nav>
        </header>
    );
};
