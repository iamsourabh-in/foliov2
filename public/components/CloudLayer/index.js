const { useEffect } = React;

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
