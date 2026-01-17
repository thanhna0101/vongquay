import React, { useState, useMemo } from 'react';
import Wheel from './components/Wheel';
import InputControls from './components/InputControls';
import WinnerModal from './components/WinnerModal';
import { WheelSegment } from './types';
import { WHEEL_COLORS, DEFAULT_SEGMENTS } from './constants';
import { Dna } from 'lucide-react';

const App: React.FC = () => {
  const [items, setItems] = useState<string[]>(DEFAULT_SEGMENTS);
  const [winner, setWinner] = useState<WheelSegment | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);

  // Transform string items to WheelSegments with colors
  const segments: WheelSegment[] = useMemo(() => {
    return items.map((text, index) => ({
      id: `seg-${index}-${Date.now()}`,
      text,
      color: WHEEL_COLORS[index % WHEEL_COLORS.length]
    }));
  }, [items]);

  const handleUpdateSegments = (newItems: string[]) => {
    // Only allow updating if not spinning
    if (!isSpinning) {
      setItems(newItems);
    }
  };

  const handleSpinEnd = (result: WheelSegment) => {
    setWinner(result);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-tr from-blue-600 to-purple-600 p-2 rounded-lg text-white">
               <Dna size={24} />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-purple-700">
              Vòng Quay May Mắn AI
            </h1>
          </div>
          <div className="text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full hidden sm:block">
            Powered by Gemini
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
          
          {/* Left Column: Wheel */}
          <div className="lg:col-span-8 flex items-center justify-center min-h-[500px] bg-white/50 rounded-3xl border border-white shadow-sm p-4 order-2 lg:order-1">
            {segments.length > 0 ? (
              <Wheel 
                segments={segments} 
                onSpinEnd={handleSpinEnd}
                isSpinning={isSpinning}
                setIsSpinning={setIsSpinning}
              />
            ) : (
              <div className="text-center text-slate-400">
                <p className="mb-2">Danh sách trống</p>
                <p className="text-sm">Vui lòng thêm dữ liệu từ bảng điều khiển</p>
              </div>
            )}
          </div>

          {/* Right Column: Controls */}
          <div className="lg:col-span-4 h-full order-1 lg:order-2">
            <InputControls 
              currentItems={items} 
              onUpdateSegments={handleUpdateSegments} 
              isSpinning={isSpinning}
            />
          </div>
        </div>
      </main>

      <WinnerModal 
        winner={winner} 
        onClose={() => setWinner(null)} 
      />
      
      {/* Footer */}
      <footer className="text-center py-6 text-slate-400 text-sm">
        <p>© {new Date().getFullYear()} Lucky Wheel App. Built with React, Tailwind & Gemini.</p>
      </footer>
    </div>
  );
};

export default App;