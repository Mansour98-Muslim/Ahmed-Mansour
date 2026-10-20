import React, { useState } from 'react';
import { X, Sparkles, BookOpen, ArrowLeft, Heart, Shield } from 'lucide-react';
import { UserProfile } from '../types';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({
  isOpen,
  onClose,
  profile,
}) => {
  const [dontShowToday, setDontShowToday] = useState(false);

  if (!isOpen) return null;

  const handleStart = () => {
    if (dontShowToday) {
      try {
        const today = new Date().toISOString().split('T')[0];
        localStorage.setItem(`muhasaba_welcome_dismissed_${today}`, 'true');
      } catch {
        // safe fallback
      }
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-emerald-900/10 text-center overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Decorative Top Accent Islamic Pattern */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-700 via-amber-500 to-emerald-800" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-colors"
          aria-label="إغلاق"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Islamic Emblem Icon */}
        <div className="w-16 h-16 rounded-2xl bg-emerald-900 text-amber-300 flex items-center justify-center mx-auto mb-4 shadow-md border border-emerald-800">
          <BookOpen className="w-8 h-8" />
        </div>

        {/* Salutation with user name */}
        <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full inline-block mb-2 font-cairo border border-emerald-200">
          السلام عليكم ورحمة الله وبركاته
        </span>

        <h2 className="text-xl sm:text-2xl font-bold text-stone-900 font-cairo">
          أهلاً بك يا {profile.name}
        </h2>
        <p className="text-xs sm:text-sm text-stone-500 font-cairo mt-1">
          في يومك الجديد مع الله ومحاسبة النفس
        </p>

        {/* Highlighted Quranic Verse requested by the user */}
        <div className="my-6 p-5 sm:p-6 bg-gradient-to-b from-stone-50 to-emerald-50/40 rounded-2xl border border-emerald-200/80 shadow-xs relative">
          <div className="flex items-center justify-center gap-1.5 text-amber-700 text-xs font-semibold mb-2.5 font-cairo">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>آية اليوم وتذكرة المحاسبة</span>
          </div>

          <blockquote className="font-amiri text-lg sm:text-xl md:text-2xl text-emerald-950 font-bold leading-relaxed px-2">
            ﴿وَمَنۡ أَرَادَ ٱلۡأٓخِرَةَ وَسَعَىٰ لَهَا سَعۡيَهَا وَهُوَ مُؤۡمِنٞ فَأُوْلَٰٓئِكَ كَانَ سَعۡيُهُم مَّشۡكُورٗا﴾
          </blockquote>

          <div className="mt-3 pt-2.5 border-t border-emerald-200/60 flex items-center justify-center gap-2 text-xs font-semibold text-stone-500 font-cairo">
            <span className="text-emerald-800">سورة الإسراء</span>
            <span>·</span>
            <span>الآية ١٩</span>
          </div>
        </div>

        {/* Encouraging Reminder */}
        <p className="text-xs text-stone-600 font-cairo leading-relaxed mb-6 px-4">
          اجعل نيتك اليوم خالصة لله، وحاسب نفسك على صلواتك وأذكارك وبرك، فما تقدمه لآخرتك هو رصيدك الباقي.
        </p>

        {/* Action Button */}
        <div className="space-y-3">
          <button
            onClick={handleStart}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-6 text-sm font-bold text-white bg-emerald-800 hover:bg-emerald-900 active:scale-[0.98] rounded-xl shadow-md shadow-emerald-900/15 transition-all"
          >
            <span>بسم الله نبدأ المحاسبة</span>
            <ArrowLeft className="w-4 h-4" />
          </button>

          <label className="flex items-center justify-center gap-2 text-xs text-stone-500 cursor-pointer pt-1 select-none">
            <input
              type="checkbox"
              checked={dontShowToday}
              onChange={(e) => setDontShowToday(e.target.checked)}
              className="rounded accent-emerald-800 text-emerald-800 w-4 h-4"
            />
            <span>عدم إظهار هذه التذكرة مجدداً اليوم</span>
          </label>
        </div>
      </div>
    </div>
  );
};
