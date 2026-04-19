import React, { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

const LOADING_STEPS = [
  { label: 'Connecting to API...', delay: 0 },
  { label: 'Parsing your query...', delay: 800 },
  { label: 'Running LLM inference...', delay: 1800 },
  { label: 'Calling data sources...', delay: 3000 },
  { label: 'Processing API response...', delay: 4400 },
  { label: 'Parsing output...', delay: 5600 },
  { label: 'Generating final summary...', delay: 6800 },
];

const LoadingMessage: React.FC = () => {
  const [visibleSteps, setVisibleSteps] = useState<number[]>([]);
  const [activeDot, setActiveDot] = useState(0);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    LOADING_STEPS.forEach((step, i) => {
      const t = setTimeout(() => {
        setVisibleSteps(prev => [...prev, i]);
      }, step.delay);
      timers.push(t);
    });

    const dotInterval = setInterval(() => {
      setActiveDot(d => (d + 1) % 3);
    }, 500);

    return () => {
      timers.forEach(clearTimeout);
      clearInterval(dotInterval);
    };
  }, []);

  return (
    <div className="flex gap-4 md:gap-6 max-w-5xl mx-auto py-6 animate-fade-in">
      <div className="flex-shrink-0">
        <div className="w-10 h-10 bg-brand-light flex items-center justify-center text-brand rounded-xl border border-brand/20">
          <Sparkles className="w-5 h-5 animate-pulse" />
        </div>
      </div>

      <div className="flex-1">
        <div className="modern-card space-y-3 py-5 px-6">
          {LOADING_STEPS.map((step, i) => {
            const isVisible = visibleSteps.includes(i);
            const isLast = i === visibleSteps.length - 1;
            return (
              <div
                key={i}
                className={`flex items-center gap-3 transition-all duration-500 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                }`}
              >
                {isLast ? (
                  <span className="flex gap-[3px] items-center w-4">
                    {[0, 1, 2].map(dot => (
                      <span
                        key={dot}
                        className={`w-1 h-1 rounded-full transition-colors duration-200 ${
                          activeDot === dot ? 'bg-brand' : 'bg-border'
                        }`}
                      />
                    ))}
                  </span>
                ) : (
                  <span className="w-4 flex items-center justify-center">
                    <span className="w-1.5 h-1.5 bg-brand/40 rounded-full" />
                  </span>
                )}
                <p className={`text-sm font-medium transition-colors duration-300 ${isLast ? 'text-brand' : 'text-muted'}`}>
                  {step.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LoadingMessage;
