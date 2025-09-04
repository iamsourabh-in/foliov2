const { useState, useEffect } = React;

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
