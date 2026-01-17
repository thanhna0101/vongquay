import React, { useEffect } from 'react';
import { WheelSegment } from '../types';
import { X, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';

interface WinnerModalProps {
  winner: WheelSegment | null;
  onClose: () => void;
}

const WinnerModal: React.FC<WinnerModalProps> = ({ winner, onClose }) => {
  useEffect(() => {
    if (winner) {
      // Fire confetti
      const duration = 3000;
      const end = Date.now() + duration;

      (function frame() {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#EF476F', '#FFD166', '#06D6A0', '#118AB2']
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
           colors: ['#EF476F', '#FFD166', '#06D6A0', '#118AB2']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      }());
    }
  }, [winner]);

  if (!winner) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 relative transform scale-100 animate-in zoom-in-95 duration-300">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors bg-slate-100 p-2 rounded-full"
        >
          <X size={20} />
        </button>

        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-100 rounded-full mb-6">
            <Trophy className="w-10 h-10 text-yellow-600" />
          </div>
          
          <h3 className="text-2xl font-bold text-slate-800 mb-2">Chúc Mừng!</h3>
          <p className="text-slate-500 mb-6">Kết quả vòng quay là:</p>
          
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-3xl font-bold py-6 px-4 rounded-xl shadow-lg break-words">
            {winner.text}
          </div>

          <button
            onClick={onClose}
            className="mt-8 w-full bg-slate-900 text-white py-3 rounded-xl font-medium hover:bg-slate-800 transition-colors"
          >
            Tiếp tục quay
          </button>
        </div>
      </div>
    </div>
  );
};

export default WinnerModal;