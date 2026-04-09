import React, { useState, useRef, useEffect } from 'react';
import {
  FlaskConical,
  Play,
  Pause,
  RefreshCw,
  Sliders
} from 'lucide-react';

// RGB Color Mixer Simulation
const RGBColorMixer: React.FC = () => {
  const [r, setR] = useState(128);
  const [g, setG] = useState(128);
  const [b, setB] = useState(128);

  return (
    <div className="space-y-6">
      <div
        className="h-48 rounded-xl border-4 border-white shadow-lg transition-colors duration-200"
        style={{ backgroundColor: `rgb(${r}, ${g}, ${b})` }}
      />
      <div className="space-y-4">
        <div>
          <div className="flex justify-between mb-1">
            <label className="text-sm font-medium text-red-600">Red</label>
            <span className="text-sm text-gray-500">{r}</span>
          </div>
          <input
            type="range"
            min="0"
            max="255"
            value={r}
            onChange={(e) => setR(parseInt(e.target.value))}
            className="w-full h-2 bg-red-200 rounded-lg appearance-none cursor-pointer"
            style={{ accentColor: '#ef4444' }}
          />
        </div>
        <div>
          <div className="flex justify-between mb-1">
            <label className="text-sm font-medium text-green-600">Green</label>
            <span className="text-sm text-gray-500">{g}</span>
          </div>
          <input
            type="range"
            min="0"
            max="255"
            value={g}
            onChange={(e) => setG(parseInt(e.target.value))}
            className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer"
            style={{ accentColor: '#22c55e' }}
          />
        </div>
        <div>
          <div className="flex justify-between mb-1">
            <label className="text-sm font-medium text-blue-600">Blue</label>
            <span className="text-sm text-gray-500">{b}</span>
          </div>
          <input
            type="range"
            min="0"
            max="255"
            value={b}
            onChange={(e) => setB(parseInt(e.target.value))}
            className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
            style={{ accentColor: '#3b82f6' }}
          />
        </div>
      </div>
      <div className="p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">
          <strong>RGB Value:</strong> rgb({r}, {g}, {b})
        </p>
        <p className="text-sm text-gray-600 mt-1">
          <strong>Hex:</strong> #{r.toString(16).padStart(2, '0')}{g.toString(16).padStart(2, '0')}{b.toString(16).padStart(2, '0')}
        </p>
      </div>
    </div>
  );
};

// Audio Waveform Visualizer Simulation
const AudioVisualizer: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const bars = 50;
      const barWidth = canvas.width / bars;

      for (let i = 0; i < bars; i++) {
        const height = isPlaying
          ? Math.random() * canvas.height * 0.8
          : Math.sin(i * 0.2) * 20 + canvas.height / 4;

        const hue = (i / bars) * 360;
        ctx.fillStyle = `hsl(${hue}, 70%, 50%)`;
        ctx.fillRect(
          i * barWidth,
          canvas.height - height,
          barWidth - 2,
          height
        );
      }

      if (isPlaying) {
        animationRef.current = requestAnimationFrame(draw);
      }
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying]);

  return (
    <div className="space-y-4">
      <canvas
        ref={canvasRef}
        width={600}
        height={200}
        className="w-full rounded-xl"
      />
      <div className="flex justify-center gap-4">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
            isPlaying
              ? 'bg-red-100 text-red-700 hover:bg-red-200'
              : 'bg-green-100 text-green-700 hover:bg-green-200'
          }`}
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <button
          onClick={() => setIsPlaying(false)}
          className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
        >
          <RefreshCw className="w-5 h-5" />
          Reset
        </button>
      </div>
      <div className="p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">
          This simulation demonstrates how audio waveforms are visualized. 
          The height of each bar represents the amplitude of the audio signal at different frequencies.
        </p>
      </div>
    </div>
  );
};

// Image Compression Simulator
const ImageCompressionSimulator: React.FC = () => {
  const [quality, setQuality] = useState(80);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw a sample image with gradients and shapes
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add noise based on quality
    const noiseAmount = (100 - quality) * 2;
    for (let i = 0; i < 1000; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const size = Math.random() * 20 + 5;
      
      ctx.fillStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, ${noiseAmount / 200})`;
      ctx.fillRect(x, y, size, size);
    }

    // Draw gradient
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, `rgba(59, 130, 246, ${quality / 100})`);
    gradient.addColorStop(1, `rgba(147, 51, 234, ${quality / 100})`);
    ctx.fillStyle = gradient;
    ctx.fillRect(50, 50, canvas.width - 100, canvas.height - 100);

    // Draw text
    ctx.fillStyle = `rgba(0, 0, 0, ${quality / 100})`;
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText('Sample Image', 60, 80);

  }, [quality]);

  return (
    <div className="space-y-6">
      <canvas
        ref={canvasRef}
        width={400}
        height={300}
        className="w-full max-w-md mx-auto rounded-xl border border-gray-200"
      />
      <div>
        <div className="flex justify-between mb-2">
          <label className="text-sm font-medium text-gray-700">Compression Quality</label>
          <span className="text-sm text-gray-500">{quality}%</span>
        </div>
        <input
          type="range"
          min="1"
          max="100"
          value={quality}
          onChange={(e) => setQuality(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          style={{ accentColor: '#3b82f6' }}
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>High Compression (Low Quality)</span>
          <span>Low Compression (High Quality)</span>
        </div>
      </div>
      <div className="p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">
          <strong>File Size Estimate:</strong> ~{Math.round(100 - quality + 10)} KB
        </p>
        <p className="text-sm text-gray-600 mt-1">
          Lower quality = smaller file size but more artifacts and noise.
        </p>
      </div>
    </div>
  );
};

// Frame Rate Demo
const FrameRateDemo: React.FC = () => {
  const [fps, setFps] = useState(30);
  const [isPlaying, setIsPlaying] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const positionRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTime = 0;
    const frameInterval = 1000 / fps;

    const animate = (currentTime: number) => {
      const deltaTime = currentTime - lastTime;

      if (deltaTime >= frameInterval) {
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw moving ball
        positionRef.current = (positionRef.current + 5) % (canvas.width + 50);
        
        ctx.beginPath();
        ctx.arc(positionRef.current - 25, canvas.height / 2, 20, 0, Math.PI * 2);
        ctx.fillStyle = '#3b82f6';
        ctx.fill();

        // Draw FPS indicator
        ctx.fillStyle = '#fff';
        ctx.font = '16px sans-serif';
        ctx.fillText(`${fps} FPS`, 10, 30);

        lastTime = currentTime;
      }

      if (isPlaying) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    if (isPlaying) {
      animationRef.current = requestAnimationFrame(animate);
    } else {
      // Draw static frame
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      ctx.arc(positionRef.current - 25, canvas.height / 2, 20, 0, Math.PI * 2);
      ctx.fillStyle = '#3b82f6';
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = '16px sans-serif';
      ctx.fillText(`${fps} FPS (Paused)`, 10, 30);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [fps, isPlaying]);

  return (
    <div className="space-y-4">
      <canvas
        ref={canvasRef}
        width={600}
        height={150}
        className="w-full rounded-xl"
      />
      <div className="flex justify-center gap-2">
        {[12, 24, 30, 60].map((rate) => (
          <button
            key={rate}
            onClick={() => setFps(rate)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              fps === rate
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {rate} FPS
          </button>
        ))}
      </div>
      <div className="flex justify-center">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
            isPlaying
              ? 'bg-red-100 text-red-700 hover:bg-red-200'
              : 'bg-green-100 text-green-700 hover:bg-green-200'
          }`}
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          {isPlaying ? 'Pause' : 'Play'}
        </button>
      </div>
      <div className="p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">
          Higher frame rates create smoother motion but require more processing power and bandwidth.
          Standard video is typically 24-30 FPS, while gaming often uses 60+ FPS.
        </p>
      </div>
    </div>
  );
};

const Simulations: React.FC = () => {
  const [activeSim, setActiveSim] = useState<string>('color_model');

  const simulations = [
    {
      id: 'color_model',
      title: 'RGB Color Mixer',
      description: 'Explore how RGB colors combine to create different hues',
      component: <RGBColorMixer />,
      icon: <Sliders className="w-5 h-5" />
    },
    {
      id: 'audio_visualization',
      title: 'Audio Visualizer',
      description: 'Visualize audio frequencies in real-time',
      component: <AudioVisualizer />,
      icon: <Play className="w-5 h-5" />
    },
    {
      id: 'image_processing',
      title: 'Image Compression',
      description: 'See how compression affects image quality',
      component: <ImageCompressionSimulator />,
      icon: <RefreshCw className="w-5 h-5" />
    },
    {
      id: 'video_encoding',
      title: 'Frame Rate Demo',
      description: 'Compare different frame rates and their smoothness',
      component: <FrameRateDemo />,
      icon: <FlaskConical className="w-5 h-5" />
    }
  ];

  const currentSim = simulations.find(s => s.id === activeSim);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Interactive Simulations</h1>
        <p className="text-gray-500 mt-1">Experience multimedia concepts hands-on</p>
      </div>

      {/* Simulation Selector */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {simulations.map((sim) => (
          <button
            key={sim.id}
            onClick={() => setActiveSim(sim.id)}
            className={`p-4 rounded-xl border-2 text-left transition-all ${
              activeSim === sim.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-2 ${
              activeSim === sim.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
            }`}>
              {sim.icon}
            </div>
            <h3 className={`font-medium text-sm ${activeSim === sim.id ? 'text-blue-900' : 'text-gray-900'}`}>
              {sim.title}
            </h3>
          </button>
        ))}
      </div>

      {/* Active Simulation */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900">{currentSim?.title}</h2>
          <p className="text-gray-500">{currentSim?.description}</p>
        </div>
        {currentSim?.component}
      </div>
    </div>
  );
};

export default Simulations;
