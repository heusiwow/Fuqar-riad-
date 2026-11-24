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
    const isDimmedByFocus = focused !== null && focused !== muscle && role === 'neutral';

    let fill = `url(#${uid}-neutral)`;
    let stroke = 'currentColor';
    let fillOpacity = isFocused ? 0.58 : isDimmedByFocus ? 0.14 : 0.24;
    let strokeOpacity = isFocused ? 0.9 : 0.34;
    let strokeWidth = isFocused ? 1.45 : 0.85;

    if (role === 'primary') {
      fill = `url(#${uid}-primary)`;
      stroke = isFocused ? '#4ADE80' : '#22C55E';
      fillOpacity = isFocused ? 1 : 0.92;
      strokeOpacity = isFocused ? 1 : 0.85;
      strokeWidth = isFocused ? 1.75 : 1.15;
    } else if (role === 'secondary') {
      fill = `url(#${uid}-secondary)`;
      stroke = isFocused ? '#FBBF24' : '#F59E0B';
      fillOpacity = isFocused ? 0.98 : 0.82;
      strokeOpacity = isFocused ? 1 : 0.8;
      strokeWidth = isFocused ? 1.55 : 1.05;
    } else if (role === 'stabilizer') {
      fill = `url(#${uid}-stabilizer)`;
      stroke = isFocused ? '#7DD3FC' : '#38BDF8';
      fillOpacity = isFocused ? 0.96 : 0.78;
      strokeOpacity = isFocused ? 1 : 0.78;
      strokeWidth = isFocused ? 1.45 : 1.0;
    }

    return {
      fill,
      fillOpacity,
      stroke,
      strokeOpacity,
      strokeWidth,
      strokeLinejoin: 'round' as const,
      filter: isFocused && role !== 'neutral' ? `url(#${uid}-glow)` : undefined,
      className: 'transition-all duration-150 cursor-pointer',
      onMouseEnter: () => handleHover(muscle),
      onMouseLeave: () => handleHover(null),
      onClick: () => handleSelect(muscle),
    };
  };

  const fiberProps = {
    fill: 'none',
    stroke: 'currentColor',
    strokeOpacity: 0.16,
    strokeWidth: 0.7,
    strokeLinecap: 'round' as const,
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
        : 'h-72 sm:h-80'
      : compact
        ? 'h-72'
        : 'h-88 sm:h-96';

  const inspectorMuscle = focused ?? primaryMuscles[0] ?? null;
  const inspectorRole = inspectorMuscle ? getRole(inspectorMuscle) : 'neutral';
  const inspectorInfo = inspectorMuscle ? ANATOMY_MUSCLES[inspectorMuscle] : null;

  return (
    <div className="flex flex-col gap-3">
      {/* Atlas View Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-[11px] font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
          {language === 'ar' ? 'الأطلس التشريحي' : 'Anatomical Atlas'}
        </span>
        <div
          className="inline-flex rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-100/70 dark:bg-[#090A0B] p-0.5 text-[11px] font-medium"
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

      {/* Figures Grid */}
      <div
        className={`grid ${
          viewMode === 'both' ? 'grid-cols-2' : 'grid-cols-1'
        } ${compact ? 'gap-2' : 'gap-4'} items-start justify-items-center`}
      >
        {/* ==================== ANTERIOR (FRONT) ==================== */}
        {(viewMode === 'both' || viewMode === 'front') && (
          <div className="flex flex-col items-center w-full">
            <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 mb-1">
              {frontTitle}
            </span>
            <svg
              viewBox="0 0 280 560"
              className={`${svgHeightClass} w-auto max-w-full text-neutral-500 dark:text-neutral-400 select-none`}
              role="img"
              aria-label={frontTitle}
            >
              <defs>
                <linearGradient id={`${uid}-primary`} x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#4ADE80" />
                  <stop offset="55%" stopColor="#22C55E" />
                  <stop offset="100%" stopColor="#15803D" />
                </linearGradient>
                <linearGradient id={`${uid}-secondary`} x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FBBF24" />
                  <stop offset="55%" stopColor="#F59E0B" />
                  <stop offset="100%" stopColor="#B45309" />
                </linearGradient>
                <linearGradient id={`${uid}-stabilizer`} x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#7DD3FC" />
                  <stop offset="55%" stopColor="#38BDF8" />
                  <stop offset="100%" stopColor="#0284C7" />
                </linearGradient>
                <linearGradient id={`${uid}-neutral`} x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="currentColor" stopOpacity="0.48" />
                  <stop offset="100%" stopColor="currentColor" stopOpacity="0.22" />
                </linearGradient>
                <linearGradient id={`${uid}-body`} x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="currentColor" stopOpacity="0.11" />
                  <stop offset="100%" stopColor="currentColor" stopOpacity="0.06" />
                </linearGradient>
                <filter id={`${uid}-glow`} x="-25%" y="-25%" width="150%" height="150%">
                  <feDropShadow dx="0" dy="0" stdDeviation="3.5" floodColor="#22C55E" floodOpacity="0.45" />
                </filter>
              </defs>

              <line x1="140" y1="78" x2="140" y2="275" stroke="currentColor" strokeOpacity="0.08" strokeWidth="0.8" strokeDasharray="3 4" />
              <path d="M140 16 C125 16 119 27 120 40 C120 51 125 60 133 66 Q140 70 147 66 C155 60 160 51 160 40 C161 27 155 16 140 16 Z" fill={`url(#${uid}-body)`} stroke="currentColor" strokeOpacity="0.28" strokeWidth="1.05" />
              <path d="M119 37 C116 37 115 43 118 47" fill="none" stroke="currentColor" strokeOpacity="0.24" strokeWidth="1" />
              <path d="M161 37 C164 37 165 43 162 47" fill="none" stroke="currentColor" strokeOpacity="0.24" strokeWidth="1" />

              <path
                d="M128 63 C127 72 124 79 114 84 C98 90 83 93 74 103 C67 112 65 128 65 144 C61 162 56 179 54 196 C49 216 44 238 41 262 C38 273 34 281 31 289 C29 294 31 299 35 299 C38 299 40 293 41 289 C41 298 40 307 43 309 C46 310 49 301 51 293 C53 283 54 275 54 266 C61 245 69 221 75 198 C78 182 81 166 85 151 C87 167 91 182 95 196 C99 211 98 228 94 246 C89 266 86 289 87 316 C88 344 92 372 97 396 C95 406 95 415 97 424 C92 446 93 470 99 494 C101 504 101 514 98 523 C95 531 90 538 92 542 C95 546 108 546 114 541 C119 536 118 525 117 516 C118 498 123 476 125 454 C127 436 126 420 125 406 C128 386 132 356 134 328 C136 306 138 290 140 284 C142 290 144 306 146 328 C148 356 152 386 155 406 C154 420 153 436 155 454 C157 476 162 498 163 516 C162 525 161 536 166 541 C172 546 185 546 188 542 C190 538 185 531 182 523 C179 514 179 504 181 494 C187 470 188 446 183 424 C185 415 185 406 183 396 C188 372 192 344 193 316 C194 289 191 266 186 246 C182 228 181 211 185 196 C189 182 193 167 195 151 C199 166 202 182 205 198 C211 221 219 245 226 266 C226 275 227 283 229 293 C231 301 234 310 237 309 C240 307 239 298 239 289 C240 293 242 299 245 299 C249 299 251 294 249 289 C246 281 242 273 239 262 C236 238 231 216 226 196 C224 179 219 162 215 144 C215 128 213 112 206 103 C197 93 182 90 166 84 C156 79 153 72 152 63"
                fill={`url(#${uid}-body)`}
                stroke="currentColor"
                strokeOpacity="0.28"
                strokeWidth="1.05"
                strokeLinejoin="round"
              />

              <path d="M126 74 C122 83 110 89 96 95 C106 96 120 96 134 94 C131 87 128 80 126 74 Z" {...muscleProps('back')} />
              <path d="M154 74 C158 83 170 89 184 95 C174 96 160 96 146 94 C149 87 152 80 154 74 Z" {...muscleProps('back')} />

              <path d="M95 96 C80 98 69 108 67 124 C66 132 69 139 75 142 C82 135 87 126 90 115 C92 108 94 101 95 96 Z" {...muscleProps('shoulders')} />
              <path d="M185 96 C200 98 211 108 213 124 C214 132 211 139 205 142 C198 135 193 126 190 115 C188 108 186 101 185 96 Z" {...muscleProps('shoulders')} />

              <path d="M138 101 C124 98 106 99 95 104 C91 114 89 128 87 139 C95 151 116 155 135 150 C138 148 139 140 139 124 Z" {...muscleProps('chest')} />
              <path d="M142 101 C156 98 174 99 185 104 C189 114 191 128 193 139 C185 151 164 155 145 150 C142 148 141 140 141 124 Z" {...muscleProps('chest')} />
              <path d="M136 114 Q115 117 94 128 M144 114 Q165 117 186 128" {...fiberProps} />

              <path d="M73 144 C66 154 61 171 61 187 C61 196 65 202 70 202 C75 201 80 190 83 176 C85 163 83 151 79 144 Z" {...muscleProps('biceps')} />
              <path d="M207 144 C214 154 219 171 219 187 C219 196 215 202 210 202 C205 201 200 190 197 176 C195 163 197 151 201 144 Z" {...muscleProps('biceps')} />

              <path d="M59 204 C53 219 48 242 44 265 L52 267 C58 250 65 229 69 208 C67 204 63 203 59 204 Z" {...muscleProps('forearms')} />
              <path d="M221 204 C227 219 232 242 236 265 L228 267 C222 250 215 229 211 208 C213 204 217 203 221 204 Z" {...muscleProps('forearms')} />

              <path d="M92 162 C93 181 97 199 101 218 C103 231 107 244 114 254 C117 244 118 228 117 210 C116 191 112 174 106 158 Z" {...muscleProps('abdominals')} />
              <path d="M188 162 C187 181 183 199 179 218 C177 231 173 244 166 254 C163 244 162 228 163 210 C164 191 168 174 174 158 Z" {...muscleProps('abdominals')} />
              <path d="M122 155 C128 153 135 154 138 158 L138 176 C133 179 124 178 120 174 C118 167 119 160 122 155 Z" {...muscleProps('abdominals')} />
              <path d="M158 155 C152 153 145 154 142 158 L142 176 C147 179 156 178 160 174 C162 167 161 160 158 155 Z" {...muscleProps('abdominals')} />
              <path d="M120 180 C126 179 134 180 138 183 L138 202 C133 204 124 203 120 199 C118 192 118 185 120 180 Z" {...muscleProps('abdominals')} />
              <path d="M160 180 C154 179 146 180 142 183 L142 202 C147 204 156 203 160 199 C162 192 162 185 160 180 Z" {...muscleProps('abdominals')} />
              <path d="M121 206 C127 205 134 206 138 209 L138 229 C133 231 125 230 122 225 C120 218 119 211 121 206 Z" {...muscleProps('abdominals')} />
              <path d="M159 206 C153 205 146 206 142 209 L142 229 C147 231 155 230 158 225 C160 218 161 211 159 206 Z" {...muscleProps('abdominals')} />
              <path d="M123 233 C129 232 135 233 138 236 L139 266 C133 261 126 250 123 233 Z" {...muscleProps('abdominals')} />
              <path d="M157 233 C151 232 145 233 142 236 L141 266 C147 261 154 250 157 233 Z" {...muscleProps('abdominals')} />

              <path d="M98 264 C90 288 89 322 93 356 C96 373 100 385 106 392 C111 384 113 364 111 334 C109 306 105 282 98 264 Z" {...muscleProps('quadriceps')} />
              <path d="M104 268 C111 286 116 312 117 344 C118 366 116 382 112 390 C121 386 127 368 129 342 C131 314 128 288 122 272 C115 268 109 267 104 268 Z" {...muscleProps('quadriceps')} />
              <path d="M127 348 C121 364 118 378 120 391 C124 394 129 390 131 378 C132 367 131 356 127 348 Z" {...muscleProps('quadriceps')} />
              <path d="M182 264 C190 288 191 322 187 356 C184 373 180 385 174 392 C169 384 167 364 169 334 C171 306 175 282 182 264 Z" {...muscleProps('quadriceps')} />
              <path d="M176 268 C169 286 164 312 163 344 C162 366 164 382 168 390 C159 386 153 368 151 342 C149 314 152 288 158 272 C165 268 171 267 176 268 Z" {...muscleProps('quadriceps')} />
              <path d="M153 348 C159 364 162 378 160 391 C156 394 151 390 149 378 C148 367 149 356 153 348 Z" {...muscleProps('quadriceps')} />

              <path d="M99 426 C95 446 96 471 102 496 L109 498 C108 474 108 449 107 428 Z" {...muscleProps('calves')} />
              <path d="M119 428 C125 442 125 462 119 480 C116 462 115 444 119 428 Z" {...muscleProps('calves')} />
              <path d="M181 426 C185 446 184 471 178 496 L171 498 C172 474 172 449 173 428 Z" {...muscleProps('calves')} />
              <path d="M161 428 C155 442 155 462 161 480 C164 462 165 444 161 428 Z" {...muscleProps('calves')} />
            </svg>
          </div>
        )}

        {/* ==================== LATERAL (SIDE PROFILE) ==================== */}
        {viewMode === 'side' && (
          <div className="flex flex-col items-center w-full">
            <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 mb-1">
              {sideTitle}
            </span>
            <svg
              viewBox="0 0 220 560"
              className={`${svgHeightClass} w-auto max-w-full text-neutral-500 dark:text-neutral-400 select-none`}
              role="img"
              aria-label={sideTitle}
            >
              <defs>
                <linearGradient id={`${uid}-primary`} x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#4ADE80" />
                  <stop offset="100%" stopColor="#15803D" />
                </linearGradient>
                <linearGradient id={`${uid}-secondary`} x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FBBF24" />
                  <stop offset="100%" stopColor="#B45309" />
                </linearGradient>
                <linearGradient id={`${uid}-stabilizer`} x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#7DD3FC" />
                  <stop offset="100%" stopColor="#0284C7" />
                </linearGradient>
                <linearGradient id={`${uid}-neutral`} x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="currentColor" stopOpacity="0.48" />
                  <stop offset="100%" stopColor="currentColor" stopOpacity="0.22" />
                </linearGradient>
                <linearGradient id={`${uid}-body`} x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="currentColor" stopOpacity="0.11" />
                  <stop offset="100%" stopColor="currentColor" stopOpacity="0.06" />
                </linearGradient>
              </defs>

              {/* Lateral Body Silhouette (Facing Right) */}
              <path
                d="M108 16 C126 16 135 28 135 42 C135 47 139 51 139 55 C139 59 132 62 128 65 L127 78 C139 87 151 98 153 116 C155 130 151 146 144 162 C139 175 138 190 140 207 C142 225 140 243 135 259 C143 277 146 303 144 333 C142 361 136 385 131 408 C134 426 134 449 128 477 C124 495 123 513 125 528 C135 533 149 536 151 542 C152 547 125 548 102 546 C94 545 92 537 96 525 C99 505 97 479 90 451 C85 430 88 411 94 397 C86 371 80 342 78 310 C75 285 73 266 79 246 C84 226 83 203 77 179 C72 154 71 127 76 104 C81 88 91 80 94 67 C91 58 87 48 88 37 C89 24 96 16 108 16 Z"
                fill={`url(#${uid}-body)`}
                stroke="currentColor"
                strokeOpacity="0.28"
                strokeWidth="1.05"
                strokeLinejoin="round"
              />

              {/* Pectoral Profile (Chest) */}
              <path d="M126 101 C141 106 151 120 148 139 C144 150 132 153 122 146 C118 131 120 115 126 101 Z" {...muscleProps('chest')} />

              {/* Lateral Upper Back / Trapezius / Latissimus */}
              <path d="M97 76 C84 86 78 103 78 124 L94 128 C98 109 102 91 97 76 Z" {...muscleProps('back')} />
              <path d="M78 134 C76 157 79 183 88 214 L106 206 C103 180 102 156 97 134 Z" {...muscleProps('back')} />

              {/* Lateral Abdominal & Oblique Serratus Profile */}
              <path d="M111 153 C124 154 134 166 135 190 C136 212 135 236 128 256 L109 250 C106 225 106 186 111 153 Z" {...muscleProps('abdominals')} />
              <path d="M114 168 L127 174 M113 186 L128 192 M113 205 L129 211" {...fiberProps} />

              {/* Gluteus Profile (Maximus & Medius) */}
              <path d="M84 244 C73 257 72 280 78 302 C88 309 102 308 109 294 C112 276 105 256 84 244 Z" {...muscleProps('glutes')} />

              {/* Quadriceps Anterior Sweep (Rectus Femoris / Vastus Lateralis) */}
              <path d="M115 268 C132 280 142 309 140 347 C138 372 132 390 123 396 C113 386 110 345 111 304 C111 289 112 277 115 268 Z" {...muscleProps('quadriceps')} />

              {/* Hamstrings Posterior Sweep */}
              <path d="M84 307 C79 332 82 365 94 396 L108 394 C109 365 109 334 106 306 Z" {...muscleProps('hamstrings')} />

              {/* Lateral Calf (Gastrocnemius & Soleus) */}
              <path d="M96 420 C86 439 87 466 96 490 L108 494 C110 470 112 444 109 422 Z" {...muscleProps('calves')} />

              {/* Lateral Shoulder Deltoid Cap */}
              <path d="M107 93 C95 95 88 108 89 124 C91 135 101 142 112 140 C121 136 126 122 124 108 C121 98 115 93 107 93 Z" {...muscleProps('shoulders')} />

              {/* Lateral Bicep (Anterior Arm) & Tricep (Posterior Arm) */}
              <path d="M108 143 C117 148 122 164 121 183 C120 194 114 202 108 202 L106 144 Z" {...muscleProps('biceps')} />
              <path d="M93 144 C86 154 84 172 87 190 C90 199 98 203 105 202 L105 144 Z" {...muscleProps('triceps')} />

              {/* Lateral Forearm */}
              <path d="M95 207 C94 226 98 249 103 271 L115 269 C117 249 116 227 113 207 Z" {...muscleProps('forearms')} />
            </svg>
          </div>
        )}

        {/* ==================== POSTERIOR (BACK) ==================== */}
        {(viewMode === 'both' || viewMode === 'back') && (
          <div className="flex flex-col items-center w-full">
            <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 mb-1">
              {backTitle}
            </span>
            <svg
              viewBox="0 0 280 560"
              className={`${svgHeightClass} w-auto max-w-full text-neutral-500 dark:text-neutral-400 select-none`}
              role="img"
              aria-label={backTitle}
            >
              <defs>
                <linearGradient id={`${uid}-primary`} x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#4ADE80" />
                  <stop offset="100%" stopColor="#15803D" />
                </linearGradient>
                <linearGradient id={`${uid}-secondary`} x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FBBF24" />
                  <stop offset="100%" stopColor="#B45309" />
                </linearGradient>
                <linearGradient id={`${uid}-stabilizer`} x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#7DD3FC" />
                  <stop offset="100%" stopColor="#0284C7" />
                </linearGradient>
                <linearGradient id={`${uid}-neutral`} x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="currentColor" stopOpacity="0.48" />
                  <stop offset="100%" stopColor="currentColor" stopOpacity="0.22" />
                </linearGradient>
                <linearGradient id={`${uid}-body`} x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="currentColor" stopOpacity="0.11" />
                  <stop offset="100%" stopColor="currentColor" stopOpacity="0.06" />
                </linearGradient>
              </defs>

              <line x1="140" y1="70" x2="140" y2="275" stroke="currentColor" strokeOpacity="0.1" strokeWidth="0.9" strokeDasharray="3 4" />
              <path d="M140 16 C124 16 118 28 120 42 C121 53 126 60 128 65 L152 65 C154 60 159 53 160 42 C162 28 156 16 140 16 Z" fill={`url(#${uid}-body)`} stroke="currentColor" strokeOpacity="0.28" strokeWidth="1.05" />
              <path
                d="M128 63 C127 72 124 79 114 84 C98 90 83 93 74 103 C67 112 65 128 65 144 C61 162 56 179 54 196 C49 216 44 238 41 262 C38 273 34 281 31 289 C29 294 31 299 35 299 C38 299 40 293 41 289 C41 298 40 307 43 309 C46 310 49 301 51 293 C53 283 54 275 54 266 C61 245 69 221 75 198 C78 182 81 166 85 151 C87 167 91 182 95 196 C99 211 98 228 94 246 C89 266 86 289 87 316 C88 344 92 372 97 396 C95 406 95 415 97 424 C92 446 93 470 99 494 C101 506 102 518 100 532 C99 540 104 545 111 545 C118 545 121 538 119 528 C118 514 123 482 125 454 C127 436 126 420 125 406 C128 386 132 356 134 328 C136 310 138 298 140 296 C142 298 144 310 146 328 C148 356 152 386 155 406 C154 420 153 436 155 454 C157 482 162 514 161 528 C159 538 162 545 169 545 C176 545 181 540 180 532 C178 518 179 506 181 494 C187 470 188 446 183 424 C185 415 185 406 183 396 C188 372 192 344 193 316 C194 289 191 266 186 246 C182 228 181 211 185 196 C189 182 193 167 195 151 C199 166 202 182 205 198 C211 221 219 245 226 266 C226 275 227 283 229 293 C231 301 234 310 237 309 C240 307 239 298 239 289 C240 293 242 299 245 299 C249 299 251 294 249 289 C246 281 242 273 239 262 C236 238 231 216 226 196 C224 179 219 162 215 144 C215 128 213 112 206 103 C197 93 182 90 166 84 C156 79 153 72 152 63"
                fill={`url(#${uid}-body)`}
                stroke="currentColor"
                strokeOpacity="0.28"
                strokeWidth="1.05"
                strokeLinejoin="round"
              />

              <path d="M95 96 C80 98 69 109 67 125 C67 134 71 140 77 141 C85 135 90 124 94 112 C96 104 96 99 95 96 Z" {...muscleProps('shoulders')} />
              <path d="M185 96 C200 98 211 109 213 125 C213 134 209 140 203 141 C195 135 190 124 186 112 C184 104 184 99 185 96 Z" {...muscleProps('shoulders')} />

              <path d="M128 69 Q140 74 152 69 C155 81 169 89 184 96 C173 107 156 122 149 145 L140 176 L131 145 C124 122 107 107 96 96 C111 89 125 81 128 69 Z" {...muscleProps('back')} />
              <path d="M97 104 C91 116 88 128 89 141 C97 146 112 146 125 142 C121 126 110 112 97 104 Z" {...muscleProps('back')} />
              <path d="M183 104 C189 116 192 128 191 141 C183 146 168 146 155 142 C159 126 170 112 183 104 Z" {...muscleProps('back')} />
              <path d="M88 143 C89 162 94 182 100 199 C104 211 110 222 119 230 C123 210 129 186 136 169 C130 156 116 146 88 143 Z" {...muscleProps('back')} />
              <path d="M192 143 C191 162 186 182 180 199 C176 211 170 222 161 230 C157 210 151 186 144 169 C150 156 164 146 192 143 Z" {...muscleProps('back')} />
              <path d="M127 182 L138 182 L138 242 C132 243 124 239 121 232 C122 214 124 196 127 182 Z" {...muscleProps('back')} />
              <path d="M153 182 L142 182 L142 242 C148 243 156 239 159 232 C158 214 156 196 153 182 Z" {...muscleProps('back')} />

              <path d="M74 144 C66 153 60 170 59 188 C59 197 63 203 69 203 C74 202 79 192 82 178 C84 164 83 152 79 144 Z" {...muscleProps('triceps')} />
              <path d="M206 144 C214 153 220 170 221 188 C221 197 217 203 211 203 C206 202 201 192 198 178 C196 164 197 152 201 144 Z" {...muscleProps('triceps')} />

              <path d="M58 206 C52 221 47 243 43 265 L51 267 C57 250 64 230 68 209 C66 206 62 205 58 206 Z" {...muscleProps('forearms')} />
              <path d="M222 206 C228 221 233 243 237 265 L229 267 C223 250 216 230 212 209 C214 206 218 205 222 206 Z" {...muscleProps('forearms')} />

              <path d="M138 248 C126 244 108 244 97 254 C90 266 89 283 94 297 C103 308 122 309 135 299 C138 294 139 275 138 248 Z" {...muscleProps('glutes')} />
              <path d="M142 248 C154 244 172 244 183 254 C190 266 191 283 186 297 C177 308 158 309 145 299 C142 294 141 275 142 248 Z" {...muscleProps('glutes')} />

              <path d="M93 302 C89 327 91 360 99 394 L111 395 C115 368 117 336 115 307 C108 306 100 305 93 302 Z" {...muscleProps('hamstrings')} />
              <path d="M117 307 C119 336 117 368 114 395 L126 394 C132 365 134 334 132 303 C127 306 122 307 117 307 Z" {...muscleProps('hamstrings')} />
              <path d="M187 302 C191 327 189 360 181 394 L169 395 C165 368 163 336 165 307 C172 306 180 305 187 302 Z" {...muscleProps('hamstrings')} />
              <path d="M163 307 C161 336 163 368 166 395 L154 394 C148 365 146 334 148 303 C153 306 158 307 163 307 Z" {...muscleProps('hamstrings')} />

              <path d="M98 422 C93 438 94 459 101 477 C104 471 107 462 109 452 C112 462 115 471 119 477 C125 459 126 438 121 422 C115 415 104 415 98 422 Z" {...muscleProps('calves')} />
              <path d="M102 480 C106 490 107 500 107 510 L112 510 C112 500 113 490 117 480 C113 475 106 475 102 480 Z" {...muscleProps('calves')} />
              <path d="M182 422 C187 438 186 459 179 477 C176 471 173 462 171 452 C168 462 165 471 161 477 C155 459 154 438 159 422 C165 415 176 415 182 422 Z" {...muscleProps('calves')} />
              <path d="M178 480 C174 490 173 500 173 510 L168 510 C168 500 167 490 163 480 C167 475 174 475 178 480 Z" {...muscleProps('calves')} />
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
              className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                inspectorRole === 'primary'
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                  : inspectorRole === 'secondary'
                    ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                    : inspectorRole === 'stabilizer'
                      ? 'bg-sky-500/15 text-sky-600 dark:text-sky-400'
                      : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
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
