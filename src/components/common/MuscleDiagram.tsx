import React, { useId, useState } from 'react';
import { MUSCLE_LABELS, tLabel } from '../../i18n/translations';
import { Language, MovementPattern, MuscleGroup } from '../../types/ironlog';
import { ANATOMY_MUSCLES, explainMuscleRole } from '../../data/anatomyMuscles';

interface MuscleDiagramProps {
  primaryMuscles: MuscleGroup[];
  secondaryMuscles: MuscleGroup[];
  stabilizerMuscles?: MuscleGroup[];
  movementPattern?: MovementPattern;
  language: Language;
  compact?: boolean;
  showInspector?: boolean;
  activeMuscle?: MuscleGroup | null;
  onHoverMuscle?: (muscle: MuscleGroup | null) => void;
}

type ViewMode = 'both' | 'front' | 'side' | 'back';

export const MuscleDiagram: React.FC<MuscleDiagramProps> = ({
  primaryMuscles,
  secondaryMuscles,
  stabilizerMuscles = [],
  movementPattern,
  language,
  compact = false,
  showInspector = true,
  activeMuscle = null,
  onHoverMuscle,
}) => {
  const uid = useId().replace(/:/g, '');
  const [internalHovered, setInternalHovered] = useState<MuscleGroup | null>(null);
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('both');

  const focused = activeMuscle ?? internalHovered ?? selectedMuscle;

  const handleHover = (m: MuscleGroup | null) => {
    setInternalHovered(m);
    onHoverMuscle?.(m);
  };

  const handleSelect = (m: MuscleGroup) => {
    const next = selectedMuscle === m ? null : m;
    setSelectedMuscle(next);
    onHoverMuscle?.(next);
  };

  const getRole = (muscle: MuscleGroup): 'primary' | 'secondary' | 'stabilizer' | 'neutral' => {
    if (primaryMuscles.includes(muscle)) return 'primary';
    if (secondaryMuscles.includes(muscle)) return 'secondary';
    if (stabilizerMuscles.includes(muscle)) return 'stabilizer';
    return 'neutral';
  };

  const muscleProps = (muscle: MuscleGroup) => {
    const role = getRole(muscle);
    const isFocused = focused === muscle;
    const isDimmed = focused !== null && focused !== muscle && role === 'neutral';

    let fill = `url(#${uid}-neutral)`;
    let stroke = 'currentColor';
    let fillOpacity = isFocused ? 0.65 : isDimmed ? 0.22 : 0.42;
    let strokeOpacity = isFocused ? 0.85 : 0.32;
    let strokeWidth = isFocused ? 1.35 : 0.72;
    let filter: string | undefined;

    if (role === 'primary') {
      fill = `url(#${uid}-primary)`;
      stroke = isFocused ? '#BBF7D0' : '#4ADE80';
      fillOpacity = isFocused ? 1 : 0.96;
      strokeOpacity = isFocused ? 1 : 0.9;
      strokeWidth = isFocused ? 1.7 : 1.05;
      filter = isFocused ? `url(#${uid}-glow-primary-strong)` : `url(#${uid}-glow-primary)`;
    } else if (role === 'secondary') {
      fill = `url(#${uid}-secondary)`;
      stroke = isFocused ? '#FEF08A' : '#FBBF24';
      fillOpacity = isFocused ? 1 : 0.9;
      strokeOpacity = isFocused ? 1 : 0.85;
      strokeWidth = isFocused ? 1.55 : 0.95;
      filter = isFocused ? `url(#${uid}-glow-secondary)` : undefined;
    } else if (role === 'stabilizer') {
      fill = `url(#${uid}-stabilizer)`;
      stroke = isFocused ? '#E0F2FE' : '#7DD3FC';
      fillOpacity = isFocused ? 0.98 : 0.84;
      strokeOpacity = isFocused ? 1 : 0.8;
      strokeWidth = isFocused ? 1.45 : 0.88;
      filter = isFocused ? `url(#${uid}-glow-stabilizer)` : undefined;
    }

    return {
      fill,
      fillOpacity,
      stroke,
      strokeOpacity,
      strokeWidth,
      strokeLinejoin: 'round' as const,
      strokeLinecap: 'round' as const,
      filter,
      className: 'transition-all duration-150 cursor-pointer',
      onMouseEnter: () => handleHover(muscle),
      onMouseLeave: () => handleHover(null),
      onClick: () => handleSelect(muscle),
    };
  };

  const striationProps = (muscle: MuscleGroup) => {
    const role = getRole(muscle);
    const active = role !== 'neutral';
    return {
      fill: 'none',
      stroke: active ? '#FFFFFF' : 'currentColor',
      strokeOpacity: active ? 0.24 : 0.14,
      strokeWidth: active ? 0.68 : 0.55,
      strokeLinecap: 'round' as const,
      className: 'pointer-events-none',
    };
  };

  const landmarkProps = {
    fill: 'none',
    stroke: 'currentColor',
    strokeOpacity: 0.24,
    strokeWidth: 0.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className: 'pointer-events-none',
  };

  const frontTitle = language === 'ar' ? 'الواجهة الأمامية' : 'Anterior (Front)';
  const sideTitle = language === 'ar' ? 'الواجهة الجانبية' : 'Lateral (Side)';
  const backTitle = language === 'ar' ? 'الواجهة الخلفية' : 'Posterior (Back)';
  const primaryLabel = language === 'ar' ? 'أساسية' : 'Primary';
  const secondaryLabel = language === 'ar' ? 'مساعدة' : 'Assisting';
  const stabilizerLabel = language === 'ar' ? 'مثبّتة' : 'Stabilizer';

  const svgHeightClass =
    viewMode === 'both'
      ? compact
        ? 'h-56 sm:h-64'
        : 'h-72 sm:h-84'
      : compact
        ? 'h-72'
        : 'h-88 sm:h-[400px]';

  const inspectorMuscle = focused ?? primaryMuscles[0] ?? null;
  const inspectorRole = inspectorMuscle ? getRole(inspectorMuscle) : 'neutral';
  const inspectorInfo = inspectorMuscle ? ANATOMY_MUSCLES[inspectorMuscle] : null;

  const sharedDefs = (
    <defs>
      <linearGradient id={`${uid}-primary`} x1="15%" y1="0%" x2="85%" y2="100%">
        <stop offset="0%" stopColor="#86EFAC" />
        <stop offset="35%" stopColor="#22C55E" />
        <stop offset="78%" stopColor="#16A34A" />
        <stop offset="100%" stopColor="#14532D" />
      </linearGradient>
      <linearGradient id={`${uid}-secondary`} x1="15%" y1="0%" x2="85%" y2="100%">
        <stop offset="0%" stopColor="#FDE68A" />
        <stop offset="38%" stopColor="#F59E0B" />
        <stop offset="80%" stopColor="#D97706" />
        <stop offset="100%" stopColor="#78350F" />
      </linearGradient>
      <linearGradient id={`${uid}-stabilizer`} x1="15%" y1="0%" x2="85%" y2="100%">
        <stop offset="0%" stopColor="#BAE6FD" />
        <stop offset="38%" stopColor="#38BDF8" />
        <stop offset="80%" stopColor="#0284C7" />
        <stop offset="100%" stopColor="#0C4A6E" />
      </linearGradient>
      <linearGradient id={`${uid}-neutral`} x1="15%" y1="0%" x2="85%" y2="100%">
        <stop offset="0%" stopColor="currentColor" stopOpacity="0.6" />
        <stop offset="55%" stopColor="currentColor" stopOpacity="0.33" />
        <stop offset="100%" stopColor="currentColor" stopOpacity="0.18" />
      </linearGradient>
      <linearGradient id={`${uid}-body`} x1="20%" y1="0%" x2="80%" y2="100%">
        <stop offset="0%" stopColor="currentColor" stopOpacity="0.16" />
        <stop offset="50%" stopColor="currentColor" stopOpacity="0.09" />
        <stop offset="100%" stopColor="currentColor" stopOpacity="0.05" />
      </linearGradient>
      <radialGradient id={`${uid}-ground`} cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="currentColor" stopOpacity="0.22" />
        <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
      </radialGradient>
      <filter id={`${uid}-glow-primary`} x="-25%" y="-25%" width="150%" height="150%">
        <feDropShadow dx="0" dy="0" stdDeviation="2.2" floodColor="#22C55E" floodOpacity="0.42" />
      </filter>
      <filter id={`${uid}-glow-primary-strong`} x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow dx="0" dy="0" stdDeviation="4.2" floodColor="#4ADE80" floodOpacity="0.7" />
      </filter>
      <filter id={`${uid}-glow-secondary`} x="-25%" y="-25%" width="150%" height="150%">
        <feDropShadow dx="0" dy="0" stdDeviation="3.4" floodColor="#F59E0B" floodOpacity="0.6" />
      </filter>
      <filter id={`${uid}-glow-stabilizer`} x="-25%" y="-25%" width="150%" height="150%">
        <feDropShadow dx="0" dy="0" stdDeviation="3.4" floodColor="#38BDF8" floodOpacity="0.6" />
      </filter>
    </defs>
  );

  return (
    <div className="relative flex flex-col gap-3">
      <svg width="0" height="0" aria-hidden="true" className="absolute pointer-events-none overflow-hidden">
        {sharedDefs}
      </svg>
      {/* Atlas View Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            {language === 'ar' ? 'الأطلس التشريحي 2D' : '2D Anatomical Atlas'}
          </span>
          {focused && (
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 truncate">
              · {tLabel(MUSCLE_LABELS[focused], language)}
            </span>
          )}
        </div>
        <div
          className="inline-flex rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-100/80 dark:bg-[#090A0B] p-0.5 text-[11px] font-medium"
          role="group"
          aria-label={language === 'ar' ? 'عرض التشريح' : 'Anatomy view'}
        >
          {(
            [
              { id: 'both', en: 'Front & Back', ar: 'أمام + خلف' },
              { id: 'front', en: 'Front', ar: 'الأمام' },
              { id: 'side', en: 'Side', ar: 'الجانب' },
              { id: 'back', en: 'Back', ar: 'الخلف' },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setViewMode(item.id)}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                viewMode === item.id
                  ? 'bg-white dark:bg-[#1A1D22] text-neutral-900 dark:text-neutral-100 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
            >
              {language === 'ar' ? item.ar : item.en}
            </button>
          ))}
        </div>
      </div>

      {/* Sculpted Anatomical Figures Grid */}
      <div
        className={`grid ${
          viewMode === 'both' ? 'grid-cols-2' : 'grid-cols-1'
        } ${compact ? 'gap-2' : 'gap-3.5'} items-stretch justify-items-center`}
      >
        {/* ==================== ANTERIOR (FRONT) ==================== */}
        {(viewMode === 'both' || viewMode === 'front') && (
          <div className="flex flex-col items-center w-full rounded-xl border border-neutral-200/80 dark:border-neutral-800/90 bg-gradient-to-b from-neutral-100/70 via-white to-neutral-100/40 dark:from-[#0E1116] dark:via-[#090A0D] dark:to-[#0E1116] p-2.5 sm:p-3">
            <span className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-300 mb-1">
              {frontTitle}
            </span>
            <svg
              viewBox="0 0 280 570"
              className={`${svgHeightClass} w-auto max-w-full text-slate-600 dark:text-slate-400 select-none`}
              role="img"
              aria-label={frontTitle}
            >

              {/* Subtle Clinical Reference Grid & Ground Shadow */}
              <line x1="140" y1="14" x2="140" y2="548" stroke="currentColor" strokeOpacity="0.06" strokeWidth="0.7" strokeDasharray="3 5" />
              <line x1="56" y1="102" x2="224" y2="102" stroke="currentColor" strokeOpacity="0.04" strokeWidth="0.6" />
              <line x1="78" y1="262" x2="202" y2="262" stroke="currentColor" strokeOpacity="0.04" strokeWidth="0.6" />
              <ellipse cx="140" cy="548" rx="64" ry="8" fill={`url(#${uid}-ground)`} />

              {/* Head, Ears, Jawline & Face Contour */}
              <path
                d="M140 15 C125 15 117 24 118 38 C118 47 121 55 127 61 L135 67 Q140 69 145 67 L153 61 C159 55 162 47 162 38 C163 24 155 15 140 15 Z"
                fill={`url(#${uid}-body)`}
                stroke="currentColor"
                strokeOpacity="0.34"
                strokeWidth="1.05"
              />
              {/* Subtle facial brow & jaw definition */}
              <path d="M126 35 Q133 33 138 35 M142 35 Q147 33 154 35" {...landmarkProps} strokeOpacity={0.18} />
              <path d="M134 57 Q140 60 146 57" {...landmarkProps} strokeOpacity={0.2} />
              <path d="M118 35 C114 35 114 43 118 47" fill="none" stroke="currentColor" strokeOpacity="0.28" strokeWidth="0.95" />
              <path d="M162 35 C166 35 166 43 162 47" fill="none" stroke="currentColor" strokeOpacity="0.28" strokeWidth="0.95" />

              {/* Athletic Full Body Silhouette (Shoulders, Tapered Waist, Quad Sweep, Tapered Ankles & Hands) */}
              <path
                d="M128 62 C127 72 123 79 113 84 C96 90 81 94 71 105 C64 114 62 130 62 146 C57 164 53 182 51 199 C45 220 40 242 37 265 C33 277 29 286 26 294 C24 300 27 305 31 304 C34 303 36 296 38 292 C38 302 37 312 41 314 C44 315 47 306 50 296 C52 287 53 278 53 269 C60 247 68 224 75 201 C78 185 82 169 86 155 C88 172 91 186 95 201 C99 216 97 232 92 251 C86 274 84 298 86 326 C87 354 91 380 97 402 C95 411 95 420 97 429 C91 452 93 476 99 500 C101 510 100 520 96 529 C91 537 87 544 90 547 C94 551 108 551 114 545 C119 540 118 529 117 519 C119 500 124 479 126 458 C128 439 127 423 125 409 C129 389 133 358 135 330 C137 308 138 292 140 286 C142 292 143 308 145 330 C147 358 151 389 155 409 C153 423 152 439 154 458 C156 479 161 500 163 519 C162 529 161 540 166 545 C172 551 186 551 190 547 C193 544 189 537 184 529 C180 520 179 510 181 500 C187 476 189 452 183 429 C185 420 185 411 183 402 C189 380 193 354 194 326 C196 298 194 274 188 251 C183 232 181 216 185 201 C189 186 192 172 194 155 C198 169 202 185 205 201 C212 224 220 247 227 269 C227 278 228 287 230 296 C233 306 236 315 239 314 C243 312 242 302 242 292 C244 296 246 303 249 304 C253 305 256 300 254 294 C251 286 247 277 243 265 C240 242 235 220 229 199 C227 182 223 164 218 146 C218 130 216 114 209 105 C199 94 184 90 167 84 C157 79 153 72 152 62"
                fill={`url(#${uid}-body)`}
                stroke="currentColor"
                strokeOpacity="0.34"
                strokeWidth="1.05"
                strokeLinejoin="round"
              />

              {/* Neck Sternocleidomastoid & Clavicles (Collarbones) */}
              <path d="M128 65 L137 92 M152 65 L143 92" {...landmarkProps} />
              <path d="M136 93 Q118 96 96 97 M144 93 Q162 96 184 97" {...landmarkProps} strokeOpacity={0.3} strokeWidth={1.05} />
              <path d="M137 92 Q140 95 143 92" {...landmarkProps} />

              {/* Upper Trapezius (Back) */}
              <path d="M127 72 C122 82 110 88 96 95 C106 96 121 95 135 93 C131 86 129 79 127 72 Z" {...muscleProps('back')} />
              <path d="M153 72 C158 82 170 88 184 95 C174 96 159 95 145 93 C149 86 151 79 153 72 Z" {...muscleProps('back')} />
              <path d="M124 80 L108 92 M156 80 L172 92" {...striationProps('back')} />

              {/* Anterior & Lateral Deltoids (Shoulders) */}
              <path d="M95 96 C80 98 67 109 65 125 C64 134 68 142 74 145 C82 138 88 127 91 115 C93 107 94 101 95 96 Z" {...muscleProps('shoulders')} />
              <path d="M185 96 C200 98 213 109 215 125 C216 134 212 142 206 145 C198 138 192 127 189 115 C187 107 186 101 185 96 Z" {...muscleProps('shoulders')} />
              <path d="M89 102 Q77 116 74 137 M82 106 Q72 118 69 132 M191 102 Q203 116 206 137 M198 106 Q208 118 211 132" {...striationProps('shoulders')} />

              {/* Pectoralis Major (Chest) */}
              <path d="M138 100 C123 97 105 98 94 104 C89 115 88 129 86 141 C95 153 117 157 135 151 C138 148 139 139 139 122 Z" {...muscleProps('chest')} />
              <path d="M142 100 C157 97 175 98 186 104 C191 115 192 129 194 141 C185 153 163 157 145 151 C142 148 141 139 141 122 Z" {...muscleProps('chest')} />
              <path
                d="M137 110 Q114 114 91 123 M137 124 Q114 128 90 137 M136 139 Q115 143 95 147 M143 110 Q166 114 189 123 M143 124 Q166 128 190 137 M144 139 Q165 143 185 147"
                {...striationProps('chest')}
              />

              {/* Subtle Latissimus Wing Edge & Serratus Anterior Ribs */}
              <path d="M88 153 C89 168 92 183 96 196 L101 185 C97 172 93 160 88 153 Z" {...muscleProps('back')} />
              <path d="M192 153 C191 168 188 183 184 196 L179 185 C183 172 187 160 192 153 Z" {...muscleProps('back')} />
              <path d="M97 162 L106 167 M98 171 L107 176 M183 162 L174 167 M182 171 L173 176" {...landmarkProps} />

              {/* Biceps Brachii (Short & Long Heads) */}
              <path d="M72 146 C64 156 59 173 59 189 C60 198 64 204 69 204 C75 202 80 191 83 176 C85 163 83 152 78 145 Z" {...muscleProps('biceps')} />
              <path d="M208 146 C216 156 221 173 221 189 C220 198 216 204 211 204 C205 202 200 191 197 176 C195 163 197 152 202 145 Z" {...muscleProps('biceps')} />
              <path d="M73 154 Q71 174 68 195 M207 154 Q209 174 212 195" {...striationProps('biceps')} />

              {/* Forearms (Brachioradialis & Flexors) */}
              <path d="M58 206 C51 221 46 244 41 267 L50 269 C57 251 64 230 68 209 C66 205 62 204 58 206 Z" {...muscleProps('forearms')} />
              <path d="M222 206 C229 221 234 244 239 267 L230 269 C223 251 216 230 212 209 C214 205 218 204 222 206 Z" {...muscleProps('forearms')} />
              <path d="M59 214 Q52 237 46 260 M221 214 Q228 237 234 260" {...striationProps('forearms')} />

              {/* External Obliques & 8-Section Rectus Abdominis */}
              <path d="M93 167 C94 185 98 203 102 221 C104 234 108 247 115 258 C118 247 119 231 118 212 C116 193 112 176 106 160 Z" {...muscleProps('abdominals')} />
              <path d="M187 167 C186 185 182 203 178 221 C176 234 172 247 165 258 C162 247 161 231 162 212 C164 193 168 176 174 160 Z" {...muscleProps('abdominals')} />
              <path d="M101 186 L112 193 M103 205 L114 212 M106 225 L115 231 M179 186 L168 193 M177 205 L166 212 M174 225 L165 231" {...striationProps('abdominals')} />
              {/* Abs Upper Pair */}
              <path d="M122 155 C128 153 135 154 138 158 L138 176 C133 179 124 178 120 174 C118 167 119 160 122 155 Z" {...muscleProps('abdominals')} />
              <path d="M158 155 C152 153 145 154 142 158 L142 176 C147 179 156 178 160 174 C162 167 161 160 158 155 Z" {...muscleProps('abdominals')} />
              {/* Abs Mid Pair */}
              <path d="M120 180 C126 179 134 180 138 183 L138 202 C133 204 124 203 120 199 C118 192 118 185 120 180 Z" {...muscleProps('abdominals')} />
              <path d="M160 180 C154 179 146 180 142 183 L142 202 C147 204 156 203 160 199 C162 192 162 185 160 180 Z" {...muscleProps('abdominals')} />
              {/* Abs Lower Pair */}
              <path d="M121 206 C127 205 134 206 138 209 L138 228 C133 230 125 229 122 224 C120 218 119 211 121 206 Z" {...muscleProps('abdominals')} />
              <path d="M159 206 C153 205 146 206 142 209 L142 228 C147 230 155 229 158 224 C160 218 161 211 159 206 Z" {...muscleProps('abdominals')} />
              {/* Lower V-Taper */}
              <path d="M123 232 C129 231 135 232 138 235 L139 266 C132 261 125 249 123 232 Z" {...muscleProps('abdominals')} />
              <path d="M157 232 C151 231 145 232 142 235 L141 266 C148 261 155 249 157 232 Z" {...muscleProps('abdominals')} />
              {/* Iliac V-line / Pelvic Crest */}
              <path d="M98 252 Q118 268 136 277 M182 252 Q162 268 144 277" {...landmarkProps} strokeOpacity={0.28} />

              {/* Quadriceps: Vastus Lateralis, Rectus Femoris & VMO Teardrop */}
              <path d="M97 265 C88 290 88 326 92 360 C95 377 100 389 106 396 C111 387 113 367 111 336 C109 308 104 283 97 265 Z" {...muscleProps('quadriceps')} />
              <path d="M104 269 C112 287 116 314 118 346 C118 369 116 385 112 394 C121 389 127 371 129 344 C131 316 128 290 122 273 C115 269 109 268 104 269 Z" {...muscleProps('quadriceps')} />
              <path d="M127 349 C121 366 118 380 120 394 C125 397 130 392 132 380 C133 368 131 357 127 349 Z" {...muscleProps('quadriceps')} />
              <path d="M183 265 C192 290 192 326 188 360 C185 377 180 389 174 396 C169 387 167 367 169 336 C171 308 176 283 183 265 Z" {...muscleProps('quadriceps')} />
              <path d="M176 269 C168 287 164 314 162 346 C162 369 164 385 168 394 C159 389 153 371 151 344 C149 316 152 290 158 273 C165 269 171 268 176 269 Z" {...muscleProps('quadriceps')} />
              <path d="M153 349 C159 366 162 380 160 394 C155 397 150 392 148 380 C147 368 149 357 153 349 Z" {...muscleProps('quadriceps')} />
              {/* Quad Fiber Striations & Knee Patella */}
              <path
                d="M113 288 Q115 322 114 358 M99 294 Q99 330 103 366 M167 288 Q165 322 166 358 M181 294 Q181 330 177 366"
                {...striationProps('quadriceps')}
              />
              <ellipse cx="111" cy="409" rx="7" ry="9" {...landmarkProps} strokeOpacity={0.28} />
              <ellipse cx="169" cy="409" rx="7" ry="9" {...landmarkProps} strokeOpacity={0.28} />
              <path d="M111 418 L111 430 M169 418 L169 430" {...landmarkProps} />

              {/* Anterior Calves / Tibialis & Gastrocnemius Flare */}
              <path d="M98 430 C94 450 95 475 101 500 L109 502 C108 477 108 452 106 432 Z" {...muscleProps('calves')} />
              <path d="M119 431 C125 446 125 466 119 485 C115 467 115 448 119 431 Z" {...muscleProps('calves')} />
              <path d="M182 430 C186 450 185 475 179 500 L171 502 C172 477 172 452 174 432 Z" {...muscleProps('calves')} />
              <path d="M161 431 C155 446 155 466 161 485 C165 467 165 448 161 431 Z" {...muscleProps('calves')} />
              {/* Tibial shin bone & ankle malleolus */}
              <path d="M112 434 L111 516 M168 434 L169 516" {...landmarkProps} strokeOpacity={0.22} />
            </svg>
          </div>
        )}

        {/* ==================== LATERAL (SIDE PROFILE) ==================== */}
        {viewMode === 'side' && (
          <div className="flex flex-col items-center w-full rounded-xl border border-neutral-200/80 dark:border-neutral-800/90 bg-gradient-to-b from-neutral-100/70 via-white to-neutral-100/40 dark:from-[#0E1116] dark:via-[#090A0D] dark:to-[#0E1116] p-2.5 sm:p-3">
            <span className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-300 mb-1">
              {sideTitle}
            </span>
            <svg
              viewBox="0 0 220 570"
              className={`${svgHeightClass} w-auto max-w-full text-slate-600 dark:text-slate-400 select-none`}
              role="img"
              aria-label={sideTitle}
            >

              <line x1="108" y1="14" x2="108" y2="548" stroke="currentColor" strokeOpacity="0.06" strokeWidth="0.7" strokeDasharray="3 5" />
              <ellipse cx="114" cy="549" rx="48" ry="8" fill={`url(#${uid}-ground)`} />

              {/* Side Profile Body Silhouette (Facing Right) */}
              <path
                d="M108 15 C126 15 135 27 135 41 C135 46 139 50 139 54 C139 58 132 61 128 64 L127 78 C139 87 151 98 153 116 C155 130 151 146 144 162 C139 175 138 190 140 207 C142 225 140 243 135 259 C143 277 146 303 144 333 C142 361 136 385 131 408 C134 426 134 449 128 477 C124 495 123 513 125 528 C135 533 149 536 151 542 C152 547 125 548 102 546 C94 545 92 537 96 525 C99 505 97 479 90 451 C85 430 88 411 94 397 C86 371 80 342 78 310 C75 285 73 266 79 246 C84 226 83 203 77 179 C72 154 71 127 76 104 C81 88 91 80 94 67 C91 58 87 48 88 37 C89 24 96 15 108 15 Z"
                fill={`url(#${uid}-body)`}
                stroke="currentColor"
                strokeOpacity="0.34"
                strokeWidth="1.05"
                strokeLinejoin="round"
              />
              {/* Ear & Neck SCM */}
              <path d="M107 38 C103 38 103 47 107 49" {...landmarkProps} />
              <path d="M111 54 L123 78" {...landmarkProps} />

              {/* Pectoral Side Sweep */}
              <path d="M126 101 C141 106 151 120 148 139 C144 150 132 153 122 146 C118 131 120 115 126 101 Z" {...muscleProps('chest')} />
              <path d="M124 118 Q137 121 146 130 M124 132 Q135 135 144 142" {...striationProps('chest')} />

              {/* Lateral Trapezius & Latissimus */}
              <path d="M97 76 C84 86 78 103 78 124 L94 128 C98 109 102 91 97 76 Z" {...muscleProps('back')} />
              <path d="M78 134 C76 157 79 183 88 214 L106 206 C103 180 102 156 97 134 Z" {...muscleProps('back')} />
              <path d="M84 154 Q93 175 99 197" {...striationProps('back')} />

              {/* Obliques, Serratus & Abs Profile */}
              <path d="M111 153 C124 154 134 166 135 190 C136 212 135 236 128 256 L109 250 C106 225 106 186 111 153 Z" {...muscleProps('abdominals')} />
              <path d="M114 165 L127 171 M113 181 L128 188 M113 198 L129 205 M114 216 L128 222" {...striationProps('abdominals')} />

              {/* Gluteus Maximus & Medius */}
              <path d="M84 244 C73 257 72 280 78 302 C88 309 102 308 109 294 C112 276 105 256 84 244 Z" {...muscleProps('glutes')} />
              <path d="M82 265 Q95 275 105 286" {...striationProps('glutes')} />

              {/* Quadriceps Sweep & IT-Band Seam */}
              <path d="M115 268 C132 280 142 309 140 347 C138 372 132 390 123 396 C113 386 110 345 111 304 C111 289 112 277 115 268 Z" {...muscleProps('quadriceps')} />
              <path d="M123 288 Q131 325 126 374" {...striationProps('quadriceps')} />
              <path d="M109 298 L109 396" {...landmarkProps} />

              {/* Hamstrings Posterior Sweep */}
              <path d="M84 307 C79 332 82 365 94 396 L108 394 C109 365 109 334 106 306 Z" {...muscleProps('hamstrings')} />
              <path d="M92 324 Q94 358 100 388" {...striationProps('hamstrings')} />

              {/* Lateral Calf & Achilles Tendon */}
              <path d="M96 420 C86 439 87 466 96 490 L108 494 C110 470 112 444 109 422 Z" {...muscleProps('calves')} />
              <path d="M97 438 Q101 462 101 482" {...striationProps('calves')} />
              <path d="M99 492 L101 530" {...landmarkProps} strokeWidth={1.1} />

              {/* 3-Head Lateral Deltoid Cap */}
              <path d="M107 93 C95 95 88 108 89 124 C91 135 101 142 112 140 C121 136 126 122 124 108 C121 98 115 93 107 93 Z" {...muscleProps('shoulders')} />
              <path d="M107 99 Q106 118 107 136 M115 103 Q118 118 115 133 M97 104 Q94 118 98 133" {...striationProps('shoulders')} />

              {/* Lateral Bicep & Tricep Horseshoe */}
              <path d="M108 143 C117 148 122 164 121 183 C120 194 114 202 108 202 L106 144 Z" {...muscleProps('biceps')} />
              <path d="M93 144 C86 154 84 172 87 190 C90 199 98 203 105 202 L105 144 Z" {...muscleProps('triceps')} />
              <path d="M95 154 Q91 174 96 193" {...striationProps('triceps')} />

              {/* Lateral Forearm */}
              <path d="M95 207 C94 226 98 249 103 271 L115 269 C117 249 116 227 113 207 Z" {...muscleProps('forearms')} />
              <path d="M106 215 Q107 242 108 264" {...striationProps('forearms')} />
            </svg>
          </div>
        )}

        {/* ==================== POSTERIOR (BACK) ==================== */}
        {(viewMode === 'both' || viewMode === 'back') && (
          <div className="flex flex-col items-center w-full rounded-xl border border-neutral-200/80 dark:border-neutral-800/90 bg-gradient-to-b from-neutral-100/70 via-white to-neutral-100/40 dark:from-[#0E1116] dark:via-[#090A0D] dark:to-[#0E1116] p-2.5 sm:p-3">
            <span className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-300 mb-1">
              {backTitle}
            </span>
            <svg
              viewBox="0 0 280 570"
              className={`${svgHeightClass} w-auto max-w-full text-slate-600 dark:text-slate-400 select-none`}
              role="img"
              aria-label={backTitle}
            >

              {/* Reference Spine Axis & Ground Shadow */}
              <line x1="140" y1="68" x2="140" y2="290" stroke="currentColor" strokeOpacity="0.14" strokeWidth="0.9" strokeDasharray="3 4" />
              <ellipse cx="140" cy="548" rx="64" ry="8" fill={`url(#${uid}-ground)`} />

              {/* Cranium & Ears */}
              <path
                d="M140 15 C124 15 117 26 119 41 C120 52 125 60 128 65 L152 65 C155 60 160 52 161 41 C163 26 156 15 140 15 Z"
                fill={`url(#${uid}-body)`}
                stroke="currentColor"
                strokeOpacity="0.34"
                strokeWidth="1.05"
              />
              <path d="M118 35 C114 35 114 43 118 47" fill="none" stroke="currentColor" strokeOpacity="0.28" strokeWidth="0.95" />
              <path d="M162 35 C166 35 166 43 162 47" fill="none" stroke="currentColor" strokeOpacity="0.28" strokeWidth="0.95" />
              <path d="M130 56 Q140 53 150 56" {...landmarkProps} />

              {/* Full Posterior Athlete Silhouette */}
              <path
                d="M128 62 C127 72 123 79 113 84 C96 90 81 94 71 105 C64 114 62 130 62 146 C57 164 53 182 51 199 C45 220 40 242 37 265 C33 277 29 286 26 294 C24 300 27 305 31 304 C34 303 36 296 38 292 C38 302 37 312 41 314 C44 315 47 306 50 296 C52 287 53 278 53 269 C60 247 68 224 75 201 C78 185 82 169 86 155 C88 172 91 186 95 201 C99 216 97 232 92 251 C86 274 84 298 86 326 C87 354 91 380 97 402 C95 411 95 420 97 429 C91 452 93 476 99 500 C101 512 102 522 100 534 C99 542 104 548 111 548 C118 548 121 541 119 531 C118 517 124 484 126 458 C128 439 127 423 125 409 C129 389 133 358 135 330 C137 312 138 300 140 298 C142 300 143 312 145 330 C147 358 151 389 155 409 C153 423 152 439 154 458 C156 484 162 517 161 531 C159 541 162 548 169 548 C176 548 181 542 180 534 C178 522 179 512 181 500 C187 476 189 452 183 429 C185 420 185 411 183 402 C189 380 193 354 194 326 C196 298 194 274 188 251 C183 232 181 216 185 201 C189 186 192 172 194 155 C198 169 202 185 205 201 C212 224 220 247 227 269 C227 278 228 287 230 296 C233 306 236 315 239 314 C243 312 242 302 242 292 C244 296 246 303 249 304 C253 305 256 300 254 294 C251 286 247 277 243 265 C240 242 235 220 229 199 C227 182 223 164 218 146 C218 130 216 114 209 105 C199 94 184 90 167 84 C157 79 153 72 152 62"
                fill={`url(#${uid}-body)`}
                stroke="currentColor"
                strokeOpacity="0.34"
                strokeWidth="1.05"
                strokeLinejoin="round"
              />

              {/* Rear Deltoids */}
              <path d="M95 96 C80 98 67 109 65 126 C65 135 69 142 76 143 C84 137 90 125 94 112 C96 105 96 99 95 96 Z" {...muscleProps('shoulders')} />
              <path d="M185 96 C200 98 213 109 215 126 C215 135 211 142 204 143 C196 137 190 125 186 112 C184 105 184 99 185 96 Z" {...muscleProps('shoulders')} />
              <path d="M89 104 Q77 118 73 135 M191 104 Q203 118 207 135" {...striationProps('shoulders')} />

              {/* Trapezius Diamond (Upper, Mid, Lower) */}
              <path d="M128 69 Q140 74 152 69 C155 81 169 89 184 96 C173 107 156 122 149 145 L140 176 L131 145 C124 122 107 107 96 96 C111 89 125 81 128 69 Z" {...muscleProps('back')} />
              <path d="M137 88 Q121 96 106 100 M143 88 Q159 96 174 100 M138 112 Q125 117 116 119 M142 112 Q155 117 164 119" {...striationProps('back')} />

              {/* Infraspinatus & Teres Major/Minor */}
              <path d="M97 104 C91 116 88 128 89 141 C97 146 112 146 125 142 C121 126 110 112 97 104 Z" {...muscleProps('back')} />
              <path d="M183 104 C189 116 192 128 191 141 C183 146 168 146 155 142 C159 126 170 112 183 104 Z" {...muscleProps('back')} />

              {/* Latissimus Dorsi Wings */}
              <path d="M88 143 C89 162 94 182 100 199 C104 211 110 222 119 230 C123 210 129 186 136 169 C130 156 116 146 88 143 Z" {...muscleProps('back')} />
              <path d="M192 143 C191 162 186 182 180 199 C176 211 170 222 161 230 C157 210 151 186 144 169 C150 156 164 146 192 143 Z" {...muscleProps('back')} />
              <path
                d="M95 156 Q109 175 123 194 M98 175 Q110 192 120 208 M185 156 Q171 175 157 194 M182 175 Q170 192 160 208"
                {...striationProps('back')}
              />

              {/* Spinal Erectors (Lower Back) */}
              <path d="M127 182 L138 182 L138 242 C132 243 124 239 121 232 C122 214 124 196 127 182 Z" {...muscleProps('back')} />
              <path d="M153 182 L142 182 L142 242 C148 243 156 239 159 232 C158 214 156 196 153 182 Z" {...muscleProps('back')} />

              {/* Triceps Brachii (Long & Lateral Heads) */}
              <path d="M73 144 C64 154 58 171 58 189 C58 198 63 204 68 204 C74 203 79 192 82 178 C84 164 83 152 78 144 Z" {...muscleProps('triceps')} />
              <path d="M207 144 C216 154 222 171 222 189 C222 198 217 204 212 204 C206 203 201 192 198 178 C196 164 197 152 202 144 Z" {...muscleProps('triceps')} />
              <path d="M71 153 Q68 172 67 191 M209 153 Q212 172 213 191" {...striationProps('triceps')} />

              {/* Posterior Forearm Extensors */}
              <path d="M57 207 C51 222 46 244 41 267 L50 269 C56 251 64 230 68 210 C65 206 61 205 57 207 Z" {...muscleProps('forearms')} />
              <path d="M223 207 C229 222 234 244 239 267 L230 269 C224 251 216 230 212 210 C215 206 219 205 223 207 Z" {...muscleProps('forearms')} />
              <path d="M57 216 Q52 238 47 260 M223 216 Q228 238 233 260" {...striationProps('forearms')} />

              {/* Gluteus Maximus & Medius */}
              <path d="M138 248 C126 244 107 244 96 255 C89 267 88 284 94 298 C103 309 122 310 135 299 C138 294 139 275 138 248 Z" {...muscleProps('glutes')} />
              <path d="M142 248 C154 244 173 244 184 255 C191 267 192 284 186 298 C177 309 158 310 145 299 C142 294 141 275 142 248 Z" {...muscleProps('glutes')} />
              <path d="M104 263 Q119 270 132 280 M176 263 Q161 270 148 280" {...striationProps('glutes')} />

              {/* Hamstrings (Biceps Femoris & Semitendinosus) + Knee Crease */}
              <path d="M93 303 C89 328 91 362 99 396 L111 397 C115 369 117 337 115 308 C108 307 100 306 93 303 Z" {...muscleProps('hamstrings')} />
              <path d="M117 308 C119 337 117 369 114 397 L126 396 C132 366 134 335 132 304 C127 307 122 308 117 308 Z" {...muscleProps('hamstrings')} />
              <path d="M187 303 C191 328 189 362 181 396 L169 397 C165 369 163 337 165 308 C172 307 180 306 187 303 Z" {...muscleProps('hamstrings')} />
              <path d="M163 308 C161 337 163 369 166 397 L154 396 C148 366 146 335 148 304 C153 307 158 308 163 308 Z" {...muscleProps('hamstrings')} />
              <path d="M102 322 Q103 356 105 385 M125 322 Q124 356 120 385 M178 322 Q177 356 175 385 M155 322 Q156 356 160 385" {...striationProps('hamstrings')} />
              <path d="M101 407 Q112 411 122 407 M158 407 Q168 411 179 407" {...landmarkProps} />

              {/* Posterior Calves (Medial/Lateral Gastrocnemius, Soleus & Achilles Tendon) */}
              <path d="M98 422 C93 438 94 460 101 478 C104 472 107 463 109 452 C112 463 115 472 119 478 C125 460 126 438 121 422 C115 415 104 415 98 422 Z" {...muscleProps('calves')} />
              <path d="M102 480 C106 490 107 501 107 512 L112 512 C112 501 113 490 117 480 C113 475 106 475 102 480 Z" {...muscleProps('calves')} />
              <path d="M182 422 C187 438 186 460 179 478 C176 472 173 463 171 452 C168 463 165 472 161 478 C155 460 154 438 159 422 C165 415 176 415 182 422 Z" {...muscleProps('calves')} />
              <path d="M178 480 C174 490 173 501 173 512 L168 512 C168 501 167 490 163 480 C167 475 174 475 178 480 Z" {...muscleProps('calves')} />
              <path d="M104 429 Q103 446 104 462 M115 429 Q116 446 115 462 M176 429 Q177 446 176 462 M165 429 Q164 446 165 462" {...striationProps('calves')} />
              <path d="M110 512 L110 538 M170 512 L170 538" {...landmarkProps} strokeWidth={1.1} />
            </svg>
          </div>
        )}
      </div>

      {/* 3-Role Legend */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-neutral-200 dark:border-neutral-800 text-xs">
        <div className="flex flex-wrap items-center gap-3.5">
          <span className="inline-flex items-center gap-1.5 text-neutral-700 dark:text-neutral-300">
            <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500 inline-block" />
            {primaryLabel}
          </span>
          <span className="inline-flex items-center gap-1.5 text-neutral-700 dark:text-neutral-300">
            <span className="w-2.5 h-2.5 rounded-xs bg-amber-500 inline-block" />
            {secondaryLabel}
          </span>
          {stabilizerMuscles.length > 0 && (
            <span className="inline-flex items-center gap-1.5 text-neutral-700 dark:text-neutral-300">
              <span className="w-2.5 h-2.5 rounded-xs bg-sky-400 inline-block" />
              {stabilizerLabel}
            </span>
          )}
        </div>
        <span className="text-[11px] text-neutral-400 dark:text-neutral-500">
          {language === 'ar' ? 'انقر أو مرّر على العضلة' : 'Tap or hover muscle'}
        </span>
      </div>

      {/* Interactive Muscle Anatomy Inspector Card */}
      {showInspector && !compact && inspectorInfo && inspectorMuscle && (
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#0D0F12] p-3.5 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                {tLabel(MUSCLE_LABELS[inspectorMuscle], language)}{' '}
                <span className="text-neutral-400 font-normal">
                  ({language === 'ar' ? inspectorInfo.anatomicalAr : inspectorInfo.anatomicalEn})
                </span>
              </div>
              <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                {language === 'ar' ? inspectorInfo.locationAr : inspectorInfo.locationEn}
              </div>
            </div>
            <span
              className={`text-[11px] font-semibold ${
                inspectorRole === 'primary'
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : inspectorRole === 'secondary'
                    ? 'text-amber-600 dark:text-amber-400'
                    : inspectorRole === 'stabilizer'
                      ? 'text-sky-600 dark:text-sky-400'
                      : 'text-neutral-500 dark:text-neutral-400'
              }`}
            >
              {inspectorRole === 'primary'
                ? primaryLabel
                : inspectorRole === 'secondary'
                  ? secondaryLabel
                  : inspectorRole === 'stabilizer'
                    ? stabilizerLabel
                    : language === 'ar'
                      ? 'تشريح عام'
                      : 'Reference'}
            </span>
          </div>
          <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">
              {language === 'ar' ? 'الوظيفة الحيوية: ' : 'Joint Action: '}
            </span>
            {language === 'ar' ? inspectorInfo.functionAr : inspectorInfo.functionEn}
          </p>
          <p className="text-xs text-emerald-700 dark:text-emerald-400 leading-relaxed">
            {explainMuscleRole(inspectorMuscle, inspectorRole, movementPattern ?? 'bench_press', language)}
          </p>
        </div>
      )}
    </div>
  );
};
