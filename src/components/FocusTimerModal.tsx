import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, RotateCcw, Bell, Sparkles, BookOpen, Volume2, CheckCircle2 } from 'lucide-react';
import { playIslamicChime } from '../utils/audio';
import { triggerConfetti } from '../utils/confetti';

interface FocusTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCompleteSession?: (minutes: number) => void;
}

const TIMER_PRESETS = [
  { label: '١٥ دقيقة (ورد قرآني)', minutes: 15 },
  { label: '٢٥ دقيقة (جلسة تركيز)', minutes: 25 },
  { label: '١٠ دقائق (أذكار وتسبيح)', minutes: 10 },
  { label: '٥ دقائق (استغفار ودعاء)', minutes: 5 },
  { label: '٣٠ دقيقة (مدارسة علم)', minutes: 30 },
];

export const FocusTimerModal: React.FC<FocusTimerModalProps> = ({
  isOpen,
  onClose,
  onCompleteSession,
}) => {
  const [selectedMinutes, setSelectedMinutes] = useState(15);
  const [secondsLeft, setSecondsLeft] = useState(15 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (isRunning && secondsLeft > 0) {
      timerRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsRunning(false);
            setIsFinished(true);
            playIslamicChime();
            try {
              triggerConfetti();
            } catch {}
            if (onCompleteSession) {
              onCompleteSession(selectedMinutes);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, secondsLeft, selectedMinutes, onCompleteSession]);

  if (!isOpen) return null;

  const handleSelectPreset = (minutes: number) => {
    setIsRunning(false);
    setIsFinished(false);
    setSelectedMinutes(minutes);
    setSecondsLeft(minutes * 60);
  };

  const handleTogglePlay = () => {
    if (isFinished) {
      setSecondsLeft(selectedMinutes * 60);
      setIsFinished(false);
      setIsRunning(true);
      return;
    }
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsFinished(false);
    setSecondsLeft(selectedMinutes * 60);
  };

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const totalSeconds = selectedMinutes * 60;
  const progressRatio = totalSeconds > 0 ? (totalSeconds - secondsLeft) / totalSeconds : 0;
  const strokeDashoffset = 283 - 283 * progressRatio;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-stone-900 text-stone-100 rounded-3xl p-6 sm:p-7 shadow-2xl border border-stone-800 text-center animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <div className="flex items-center gap-2 text-amber-400">
            <BookOpen className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-stone-100 font-cairo">مؤقت التركيز الإيماني</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-100 hover:bg-stone-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Presets */}
        <div className="my-4">
          <span className="text-[11px] text-stone-400 block mb-2 font-cairo text-right">
            اختر مدة الجلسة (ورد قرآني / أذكار / ذكر):
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {TIMER_PRESETS.map((preset) => (
              <button
                key={preset.minutes}
                onClick={() => handleSelectPreset(preset.minutes)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-colors shrink-0 ${
                  selectedMinutes === preset.minutes
                    ? 'bg-emerald-800 text-amber-300 shadow-sm'
                    : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Big Circular Countdown Display */}
        <div className="my-6 relative w-56 h-56 mx-auto flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="44"
              className="stroke-stone-800"
              strokeWidth="6"
              fill="none"
            />
            <circle
              cx="50"
              cy="50"
              r="44"
              className="stroke-emerald-500 transition-all duration-300 ease-linear"
              strokeWidth="6"
              strokeDasharray="276"
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="none"
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {isFinished ? (
              <div className="flex flex-col items-center text-emerald-400 animate-in zoom-in duration-300">
                <CheckCircle2 className="w-12 h-12 mb-1 text-emerald-400" />
                <span className="text-sm font-bold font-cairo">تم الإنجاز بنجاح!</span>
                <span className="text-[11px] text-stone-300 mt-0.5">تقبّل الله طاعتك</span>
              </div>
            ) : (
              <>
                <span className="text-5xl font-extrabold font-cairo text-stone-100 tabular-nums tracking-tight">
                  {formatTime(secondsLeft)}
                </span>
                <span className="text-xs text-stone-400 mt-1 font-cairo">
                  {isRunning ? 'جلسة تركيز جارية...' : 'جاهز للبدء'}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-center gap-4 my-2">
          <button
            onClick={handleReset}
            className="p-3 text-stone-400 hover:text-stone-100 bg-stone-800 hover:bg-stone-700 rounded-full transition-colors"
            title="إعادة الضبط"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={handleTogglePlay}
            className="flex items-center justify-center w-16 h-16 rounded-full bg-emerald-800 hover:bg-emerald-700 text-amber-300 shadow-lg shadow-emerald-900/30 active:scale-95 transition-all"
            title={isRunning ? 'إيقاف مؤقت' : 'بدء'}
          >
            {isRunning ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 mr-0.5" />}
          </button>

          <button
            onClick={playIslamicChime}
            className="p-3 text-stone-400 hover:text-amber-300 bg-stone-800 hover:bg-stone-700 rounded-full transition-colors"
            title="اختبار نغمة التنبيه الهادئة"
          >
            <Volume2 className="w-5 h-5" />
          </button>
        </div>

        <p className="text-[11px] text-stone-400 mt-4 font-cairo">
          يصدر المؤقت نغمة هادئة تنبهك فور انتهاء الوقت المحدد
        </p>
      </div>
    </div>
  );
};
