const { useState } = React;

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
