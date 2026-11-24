import {
  DifficultyLevel,
  EquipmentType,
  ProgramDaySchedule,
  SplitType,
  TrainingGoal,
  TrainingPhilosophy,
  WorkoutExerciseItem,
} from '../types/ironlog';
import { BUILTIN_EXERCISES } from './exercises';

export type EvidenceTier = 'supported' | 'nuanced' | 'individual';

export interface ModernSciencePrinciple {
  id: string;
  titleEn: string;
  titleAr: string;
  evidenceTier: EvidenceTier;
  summaryEn: string;
  summaryAr: string;
  researchSupportsEn: string;
  researchSupportsAr: string;
  uncertaintyOrLimitsEn: string;
  uncertaintyOrLimitsAr: string;
  practicalApplicationEn: string;
  practicalApplicationAr: string;
}

export interface OldSchoolPrinciple {
  id: string;
  titleEn: string;
  titleAr: string;
  historicalContextEn: string;
  historicalContextAr: string;
  corePracticeEn: string;
  corePracticeAr: string;
  modernPerspectiveEn: string;
  modernPerspectiveAr: string;
  safeExecutionEn: string;
  safeExecutionAr: string;
}

export interface HistoricalApproachReference {
  id: string;
  eraOrApproachEn: string;
  eraOrApproachAr: string;
  notableFiguresEn: string;
  notableFiguresAr: string;
  characteristicsEn: string;
  characteristicsAr: string;
  evidenceNoteEn: string;
  evidenceNoteAr: string;
}

export interface PhilosophyComparisonRow {
  dimensionEn: string;
  dimensionAr: string;
  modernEn: string;
  modernAr: string;
  oldSchoolEn: string;
  oldSchoolAr: string;
  bridgeEn: string;
  bridgeAr: string;
}

export const MODERN_SCIENCE_PRINCIPLES: ModernSciencePrinciple[] = [
  {
    id: 'progressive-overload',
    titleEn: 'Progressive Overload',
    titleAr: 'التدرج في الحمل التدريبي (Progressive Overload)',
    evidenceTier: 'supported',
    summaryEn: 'Gradually increasing mechanical challenge over time so muscles and nervous system keep adapting.',
    summaryAr: 'زيادة التحدي الميكانيكي تدريجياً بمرور الوقت حتى يستمر الجهاز العصبي والعضلات في التكيف.',
    researchSupportsEn: 'Adding reps, adding weight when top rep targets are met, or improving clean range of motion drives sustained strength and hypertrophy adaptations.',
    researchSupportsAr: 'تشير الأبحاث إلى أن زيادة التكرارات، ثم رفع الوزن عند إتقان النطاق المطلوب، أو تحسين جودة المدى الحركي يقود إلى تطور مستمر في القوة والكتلة.',
    uncertaintyOrLimitsEn: 'Progress is nonlinear after the novice stage; forcing weight increases every single week often degrades technique rather than increasing stimulus.',
    uncertaintyOrLimitsAr: 'التطور لا يسير بخط مستقيم بعد مرحلة المبتدئ؛ إجبار النفس على زيادة الوزن أسبوعياً قد يفسد الأداء بدلاً من تحسين التحفيز.',
    practicalApplicationEn: 'Use double progression (e.g., hit 3×10 cleanly at RPE 8 before adding 2.5 kg and restarting at 3×8).',
    practicalApplicationAr: 'طبّق التدرج المزدوج: أكمل الجولات بالحد الأعلى للتكرارات بتحكم كامل قبل زيادة الوزن بنسبة صغيرة.',
  },
  {
    id: 'volume-weekly-sets',
    titleEn: 'Weekly Training Volume',
    titleAr: 'الحجم التدريبي الأسبوعي (عدد الجولات الفعالة)',
    evidenceTier: 'supported',
    summaryEn: 'Total hard working sets performed per muscle group per week near challenging effort.',
    summaryAr: 'مجموع الجولات الجادة المؤداة لكل مجموعة عضلية أسبوعياً بمستوى جهد فعّال.',
    researchSupportsEn: 'Meta-analyses consistently show a dose-response relationship between hard sets per muscle per week (~10–20 sets/week for most trained adults) and hypertrophy.',
    researchSupportsAr: 'تؤكد التحليلات العلمية وجود علاقة طردية بين عدد الجولات الصعبة أسبوعياً (غالباً 10–20 جولة للبالغين المتدربين) ونمو العضلات.',
    uncertaintyOrLimitsEn: 'Exact upper thresholds vary widely; very high set counts can accumulate fatigue without added growth if recovery or set quality drops.',
    uncertaintyOrLimitsAr: 'الحد الأقصى يختلف من شخص لآخر؛ الإكثار المفرط من الجولات قد يرفع الإرهاق دون فائدة إضافية إذا تراجعت جودة الأداء أو الاستشفاء.',
    practicalApplicationEn: 'Start near 8–12 quality sets per muscle weekly, monitor soreness and strength trend, and add sets only when progressing stalls despite good sleep/nutrition.',
    practicalApplicationAr: 'ابدأ بنحو 8–12 جولة عالية الجودة أسبوعياً لكل عضلة، وارفع الحجم تدريجياً فقط إذا ثبت الأداء واستقر الاستشفاء.',
  },
  {
    id: 'frequency',
    titleEn: 'Training Frequency',
    titleAr: 'التكرار الأسبوعي للعضلة (Frequency)',
    evidenceTier: 'nuanced',
    summaryEn: 'How often a muscle group or movement pattern is trained across a 7-day microcycle.',
    summaryAr: 'عدد المرات التي تتمرن فيها العضلة أو النمط الحركي خلال الأسبوع.',
    researchSupportsEn: 'When weekly sets are matched, training a muscle 2×/week provides a convenient structure to distribute high-quality sets without excessive per-session fatigue.',
    researchSupportsAr: 'عند تساوي إجمالي الجولات الأسبوعية، يتيح تدريب العضلة مرتين أسبوعياً توزيع الجولات بجودة أعلى وتقليل إجهاد الجلسة الواحدة.',
    uncertaintyOrLimitsEn: 'When volume is held equal, 1× vs 2× vs 3× frequency differences for hypertrophy are small; frequency acts mainly as a tool to manage session quality and skill practice.',
    uncertaintyOrLimitsAr: 'عند تثبيت الحجم الأسبوعي، الفروقات المباشرة بين مرة أو مرتين أو ثلاث قد تكون صغيرة، ويكمن دور التكرار أساساً في تحسين جودة الجلسة وإتقان المهارة.',
    practicalApplicationEn: 'Split >10 weekly muscle sets across 2+ days (Upper/Lower or PPL); lower-volume lifters can still progress well on 1–2 sessions.',
    practicalApplicationAr: 'إذا تجاوزت 10 جولات أسبوعية للعضلة فوزعها على جلستين فأكثر، بينما يمكن للأحجام المعتدلة التطور على مرة أو مرتين.',
  },
  {
    id: 'proximity-to-failure',
    titleEn: 'Intensity & Proximity to Failure',
    titleAr: 'الشدة والقرب من الفشل العضلي',
    evidenceTier: 'nuanced',
    summaryEn: 'How close a working set gets to momentary concentric failure versus leaving reps in reserve.',
    summaryAr: 'مدى اقتراب الجولة من عدم القدرة على إتمام تكرار إضافي بأداء سليم.',
    researchSupportsEn: 'Hypertrophy requires recruiting high-threshold motor units through sufficiently heavy loads or approaching failure within ~0–4 RIR.',
    researchSupportsAr: 'يتطلب التضخيم تجنيد الوحدات الحركية الكبرى عبر أوزان كافية أو الاقتراب من الفشل العضلي (غالباً 0–4 تكرارات احتياط).',
    uncertaintyOrLimitsEn: 'Training to true muscular failure on every set raises systemic and soreness recovery cost more than it adds hypertrophy on heavy multi-joint lifts.',
    uncertaintyOrLimitsAr: 'الوصول للفشل التام في كل جولة، خصوصاً في التمارين المركبة الثقيلة، يرفع تكلفة الاستشفاء أكثر مما يضيف من نمو عضلي مقارنة بالإبقاء على 1–2 تكرار احتياط.',
    practicalApplicationEn: 'Keep multi-joint bar lifts around 1–3 RIR (RPE 7–9); push safe single-joint isolations closer to 0–1 RIR when technique stays tight.',
    practicalApplicationAr: 'احتفظ بـ 1–3 تكرارات احتياط في التمارين المركبة الثقيلة، واقترب أكثر (0–1 RIR) في تمارين العزل الآمنة.',
  },
  {
    id: 'rpe-rir',
    titleEn: 'RPE & RIR Autoregulation',
    titleAr: 'مؤشرات الجهد المدرك (RPE) والتكرارات المتبقية (RIR)',
    evidenceTier: 'supported',
    summaryEn: 'Practical perceptual scales that link daily readiness with objective load management.',
    summaryAr: 'مقاييس عملية تربط الجاهزية اليومية بضبط الوزن والتكرارات بواقعية.',
    researchSupportsEn: 'RIR-based RPE correlates well with bar velocity loss and helps prevent overreaching when readiness fluctuates.',
    researchSupportsAr: 'يرتبط مقياس RIR/RPE بدقة مقبولة مع سرعة البار ويساعد في تعديل الحمل اليومي وتجنب الإرهاق المفرط.',
    uncertaintyOrLimitsEn: 'Novices often misestimate RIR by 2+ reps; high-rep sets (>15 reps) also blur the difference between muscular failure and cardiovascular discomfort.',
    uncertaintyOrLimitsAr: 'غالباً ما يخطئ المبتدئون في تقدير RIR، كما تصبح التقديرات أقل دقة في الجولات عالية التكرار (>15 تكراراً).',
    practicalApplicationEn: 'Track both weight/reps and RPE/RIR side-by-side over time rather than guessing blindly.',
    practicalApplicationAr: 'سجّل الأوزان والتكرارات مع RPE/RIR معاً عبر الجلسات لتحسين دقة التقدير الذاتي تدريجياً.',
  },
  {
    id: 'exercise-selection-biomechanics',
    titleEn: 'Exercise Selection & Biomechanics',
    titleAr: 'اختيار التمارين والميكانيكا الحيوية',
    evidenceTier: 'supported',
    summaryEn: 'Matching external resistance profiles, stability, and joint angles to target muscle anatomy.',
    summaryAr: 'مواءمة خط المقاومة والثبات وزوايا المفاصل مع المسار التشريحي للعضلة المستهدفة.',
    researchSupportsEn: 'Joint-angle variation (e.g., flat vs incline pressing, overhead vs pushdown triceps, seated vs lying hamstring curl) emphasizes complementary muscle regions.',
    researchSupportsAr: 'تنويع الزوايا (كالميلان في الدفع أو وضع الورك في الكيرل الخلفي) يستهدف أجزاء ورؤوساً عضلية مكملة بفعالية أكبر.',
    uncertaintyOrLimitsEn: 'There is no single "mandatory" exercise for hypertrophy; machines, cables, and free weights all produce strong hypertrophy when tension and progression match.',
    uncertaintyOrLimitsAr: 'لا يوجد تمرين واحد "إلزامي" للتضخيم؛ الحديد الحر والأجهزة والكابلات كلها فعالة عند تطبيق التوتر والتدرج الصحيح.',
    practicalApplicationEn: 'Anchor each pattern with stable, trackable lifts you can load safely across your specific limb lengths and mobility.',
    practicalApplicationAr: 'اختر تمارين تناسب أبعاد جسمك ومرونتك ويمكنك التدرج فيها بأمان واستمرارية.',
  },
  {
    id: 'range-of-motion',
    titleEn: 'Range of Motion & Lengthened Tension',
    titleAr: 'المدى الحركي الكامل والتوتر عند الاستطالة',
    evidenceTier: 'nuanced',
    summaryEn: 'Training muscles across full anatomical joint motion, paying respect to controlled stretched positions.',
    summaryAr: 'تمرين العضلة عبر المدى الحركي الكامل مع تحكم دقيق في نقطة التمدد.',
    researchSupportsEn: 'Full ROM generally produces equal or greater hypertrophy than shortened partials, and several recent trials show benefits from emphasizing loaded muscle stretch.',
    researchSupportsAr: 'يُظهر المدى الحركي الكامل نتائج مساوية أو أفضل مقارنة بالتكرارات القصيرة، وتشير دراسات حديثة إلى فائدة التحميل المتحكم به في وضعية الاستطالة.',
    uncertaintyOrLimitsEn: 'Extreme bouncing or overstretching into painful joint end-ranges increases injury risk without superior adaptation.',
    uncertaintyOrLimitsAr: 'الارتداد العنيف أو المبالغة في الإطالة داخل نطاق مؤلم للمفصل يرفع خطر الإصابة دون فائدة إضافية.',
    practicalApplicationEn: 'Pause cleanly for a split second at a comfortable, tensioned stretch before driving through the concentric phase.',
    practicalApplicationAr: 'توقف لحظة قصيرة بتحكم في نهاية النزول عند تمدد العضلة قبل البدء بالدفع.',
  },
  {
    id: 'recovery-fatigue',
    titleEn: 'Recovery & Fatigue Management',
    titleAr: 'الاستشفاء وإدارة الإرهاق التراكمي',
    evidenceTier: 'supported',
    summaryEn: 'Balancing training stress with sleep, nutrition, stress management, and periodic lighter weeks.',
    summaryAr: 'موازنة الضغط التدريبي مع النوم والتغذية وجودة التعافي وتخفيف الحمل الدوري.',
    researchSupportsEn: 'Sleep restriction, acute workload spikes (>30% above baseline), and chronic high failure training impair strength performance and tissue readiness.',
    researchSupportsAr: 'قلة النوم، والقفزات الحادة في الحمل التدريبي، والتدريب المستمر للفشل تُضعف الأداء وقدرة الأنسجة على التعافي.',
    uncertaintyOrLimitsEn: 'Scheduled deloads every 4 weeks are not strictly required if autoregulation or natural life breaks already dissipate fatigue.',
    uncertaintyOrLimitsAr: 'أسبوع التخفيف الثابت كل 4 أسابيع ليس إلزامياً إذا كان ضبط الشدة الذاتي أو أيام الراحة تمنع تراكم الإجهاد.',
    practicalApplicationEn: 'Watch rep performance, soreness persistence, and sleep; deploy a 1-week deload (cut sets by ~40%) when systemic fatigue lingers.',
    practicalApplicationAr: 'راقب تراجع الأداء أو إرهاق المفاصل المستمر، وطبق أسبوع تخفيف (تقليل الجولات ~40٪) عند تراكم التعب.',
  },
  {
    id: 'periodization',
    titleEn: 'Periodization & Structured Phases',
    titleAr: 'تخطيط المراحل التدريبية (Periodization)',
    evidenceTier: 'nuanced',
    summaryEn: 'Organizing training blocks over weeks and months across volume, intensity, and specificity.',
    summaryAr: 'تنظيم الفترات التدريبية عبر الأسابيع والأشهر من حيث الحجم والشدة والتخصص.',
    researchSupportsEn: 'Structured periodized plans produce superior maximal strength gains over non-varied training when total work progresses cleanly.',
    researchSupportsAr: 'تتفوق الخطط المنظمة في بناء القوة القصوى على التدريب العشوائي بفضل تنسيق الحجم والشدة عبر الأسابيع.',
    uncertaintyOrLimitsEn: 'For pure muscle hypertrophy, simple linear vs undulating models yield very similar growth when weekly hard volume and effort match.',
    uncertaintyOrLimitsAr: 'لأهداف التضخيم، تتقارب نتائج الأنظمة الخطية والتموجية طالما تساوى الحجم الأسبوعي والجهد التدريبي.',
    practicalApplicationEn: 'Run 6–12 week focused blocks before rotating secondary accessories or rep-range emphasis.',
    practicalApplicationAr: 'التزم بكتلة تدريبية مدتها 6–12 أسبوعاً قبل تغيير التمارين المساعدة أو نطاق التكرارات.',
  },
  {
    id: 'specificity',
    titleEn: 'Training Specificity (SAID Principle)',
    titleAr: 'مبدأ التخصص التدريبي (Specificity)',
    evidenceTier: 'supported',
    summaryEn: 'Adaptations align closely with the demands placed on joints, rep ranges, and speeds practiced.',
    summaryAr: 'تتكيف العضلات والجهاز العصبي مع نوع المقاومة ونطاق التكرارات والسرعة الممارسة.',
    researchSupportsEn: 'Heavy 1–5 rep sets optimize maximal neural strength (1RM); 6–30 rep sets near failure build similar hypertrophy across fibers with differing fatigue profiles.',
    researchSupportsAr: 'التكرارات المنخفضة الثقيلة (1–5) تعزز القوة العصبية القصوى، بينما تبني التكرارات (6–30) قرب الفشل كتلة عضلية متقاربة باختلاف كلفة الإجهاد.',
    uncertaintyOrLimitsEn: 'Very light sets (>25 reps) cause disproportionately high metabolic discomfort and harder RIR estimation.',
    uncertaintyOrLimitsAr: 'الأوزان الخفيفة جداً (>25 تكراراً) تسبب إرهاقاً استقلابياً مزعجاً وتصعّب تقدير الجهد الدقيق.',
    practicalApplicationEn: 'Use 3–6 reps on main strength lifts, 6–15 reps on core hypertrophy compounds/isolations, and 12–20 for small joint accessories.',
    practicalApplicationAr: 'استخدم 3–6 تكرارات لتمارين القوة، 6–15 للتضخيم الأساسي، و12–20 للعزل الآمن.',
  },
  {
    id: 'individual-differences',
    titleEn: 'Individual Differences & Adaptation',
    titleAr: 'الفروق الفردية والاستجابة الشخصية',
    evidenceTier: 'individual',
    summaryEn: 'Genetics, limb leverages, recovery capacity, stress, and training history shape response.',
    summaryAr: 'الجينات، أطوال العظام، القدرة الاستشفائية، ونمط الحياة تحدد الاستجابة الخاصة بكل رياضي.',
    researchSupportsEn: 'Controlled trials show wide inter-individual variability in muscle growth and strength even under identical supervised protocols.',
    researchSupportsAr: 'تُظهر الدراسات تبايناً واسعاً بين الأفراد في سرعة اكتساب القوة والكتلة حتى عند تطبيق نفس البرنامج حرفياً.',
    uncertaintyOrLimitsEn: 'No generic study average guarantees how an athlete responds to a specific volume or split; tracking real personal logs is mandatory.',
    uncertaintyOrLimitsAr: 'لا يعكس متوسط الدراسات بالضرورة استجابتك الفردية؛ توثيق سجلاتك الشخصية هو الحكم العملي الحقيقي.',
    practicalApplicationEn: 'Treat every scientific guideline as an educated starting point, then adjust using your logged APEX trends.',
    practicalApplicationAr: 'تعامل مع القواعد العلمية كنقطة انطلاق ذكية، ثم طوّعها استناداً إلى سجلات أدائك الفعلية.',
  },
];

export const OLD_SCHOOL_PRINCIPLES: OldSchoolPrinciple[] = [
  {
    id: 'heavy-compounds-foundation',
    titleEn: 'Heavy Compound Foundations First',
    titleAr: 'أولوية التمارين المركبة الأساسية',
    historicalContextEn: 'Before modern selectorized machines dominated commercial gyms, lifters built dense physiques around barbell presses, rows, squats, deadlifts, overhead presses, and weighted dips/chins.',
    historicalContextAr: 'قبل انتشار الأجهزة الحديثة، اعتمدت الصالات التقليدية على الحديد الحر لبناء القاعدة العضلية عبر البنش برس، السكوات، الديدلفت، التجديف، الضغط العلوي، والعقلة والغطس.',
    corePracticeEn: 'Place 1–2 multi-joint movements at the start of each workout when focus and neural drive are highest, striving to beat last month’s numbers cleanly.',
    corePracticeAr: 'توضع الحركات المركبة الكبرى في بداية الحصة عندما يكون التركيز والطاقة في ذروتهما، مع السعي المستمر لتجاوز أرقام الأشهر السابقة.',
    modernPerspectiveEn: 'Modern biomechanics confirms multi-joint lifts provide efficient systemic loading, though machines and cables can equal them for hypertrophy when stability helps target tissue.',
    modernPerspectiveAr: 'تؤكد الميكانيكا الحديثة كفاءة التمارين المركبة في تحميل عدة مجموعات معاً، مع إدراك أن الأجهزة والكابلات تحقق تضخيماً ممتازاً أيضاً عند توفير ثبات أكبر.',
    safeExecutionEn: 'Never turn heavy lifts into reckless ego-lifting; treat progressive weight increases with intact spinal posture and crisp bar path.',
    safeExecutionAr: 'لا تعني الأوزان الثقيلة التضحية باستقامة الظهر أو القفز العشوائي في الوزن؛ التقدم يكون بضبط المسار والأمان.',
  },
  {
    id: 'discipline-logs',
    titleEn: 'Written Training Logs & Multi-Year Patience',
    titleAr: 'تدوين الجلسات والانضباط طويل الأمد',
    historicalContextEn: 'Classic strength and bodybuilding pioneers kept dog-eared paper notebooks recording every pound and rep over years—long before digital trackers.',
    historicalContextAr: 'حرص رواد كمال الأجسام والقوة على حمل دفتر تسجيل يدوي يوثق كل كيلو وتكرار عبر سنوات متواصلة، قبل ظهور التطبيقات الرقمية.',
    corePracticeEn: 'Never enter the gym wondering what you lifted last session; track small wins consistently across 52 weeks instead of chasing novelty workouts every week.',
    corePracticeAr: 'لا تدخل الجلسة دون معرفة أرقام الجلسة السابقة؛ استثمر في التحسن التراكمي على مدار العام بدلاً من تغيير الجدول كل أسبوع.',
    modernPerspectiveEn: 'Strongly aligned with exercise psychology and progressive overload science: feedback loops reinforce adherence and measurable progression.',
    modernPerspectiveAr: 'يتوافق تماماً مع العلم الحديث: المراقبة الذاتية والبيانات التاريخية تعززان الالتزام والتدرج الفعلي.',
    safeExecutionEn: 'Compare yourself against your own past logbook, not dangerous extremes seen on social media.',
    safeExecutionAr: 'قارن تقدمك بسجلك الشخصي السابق، وليس بأوزان غير آمنة أو مقارنات استعراضية.',
  },
  {
    id: 'mind-muscle-controlled-reps',
    titleEn: 'Mind-Muscle Connection & Controlled Reps',
    titleAr: 'الاتصال الذهني العضلي والتحكم في التكرار',
    historicalContextEn: 'Golden Era bodybuilders emphasized "feeling the muscle work" through deliberate eccentrics, flexing at peak contraction, and refusing sloppy momentum.',
    historicalContextAr: 'ركّز لاعبو العصر الذهبي على الشعور بانقباض العضلة المستهدفة في كل تكرار، وتجنب المرجحة والسرعة العشوائية.',
    corePracticeEn: 'Treat weight as a tool to stimulate tension inside the target muscle rather than moving iron from point A to point B by any means.',
    corePracticeAr: 'اعتبر الوزن وسيلة لخلق التوتر داخل العضلة المستهدفة، لا مجرد نقل الحديد من نقطة إلى أخرى بأي ثمن.',
    modernPerspectiveEn: 'Studies indicate internal attentional focus can modestly enhance regional activation in moderate-load hypertrophy work, while external focus works better for maximal 1RM strength.',
    modernPerspectiveAr: 'تشير الدراسات إلى أن التركيز الداخلي على العضلة يفيد في تمارين التضخيم المتوسطة، بينما يفضل التركيز الخارجي (تحريك البار) لرفع أقصى وزن.',
    safeExecutionEn: 'Use smooth 2–3 second lowering phases without pausing painfully under heavy joint compression.',
    safeExecutionAr: 'استخدم إنزالاً متحكماً لثانيتين أو ثلاث دون إجهاد المفاصل بأوزان تفوق السيطرة.',
  },
  {
    id: 'classic-splits-physique',
    titleEn: 'Structured Splits & Complete Physique Balance',
    titleAr: 'التقسيمات المنظمة وتوازن القوام الكامل',
    historicalContextEn: 'Traditional bodybuilding culture prized symmetry—matching upper chest with back thickness, rear delts with front delts, and calves/hamstrings with quads.',
    historicalContextAr: 'اهتمت فلسفة كمال الأجسام الكلاسيكية بالتناسق الجمالي الشامل: توازن الصدر العلوي مع سمك الظهر، والأكتاف الخلفية مع الأمامية، والفخذ الخلفي والسمانة مع الأمامي.',
    corePracticeEn: 'Design focused 45–60 minute sessions with clear exercise purpose—avoid endless junk exercises while leaving room for lagging weak points.',
    corePracticeAr: 'صمّم حصصاً مركزة (45–60 دقيقة) بتمارين واضحة الغاية لتغطية نقاط الضعف دون حشو عشوائي.',
    modernPerspectiveEn: 'Evidence cautions that classic 1×/week bodypart splits can pack too much per-session junk volume unless volume is capped cleanly; splitting weak points 2×/week often improves quality.',
    modernPerspectiveAr: 'يوضح العلم الحديث أن تمرين العضلة مرة أسبوعياً بجولات ضخمة جداً قد يقلل جودة الجولات الأخيرة، لذا يُستفاد من توزيع نقاط الضعف مرتين.',
    safeExecutionEn: 'Respect joint recovery between pressing days and heavy spinal loading days; never glorify training through sharp joint pain.',
    safeExecutionAr: 'احترم استشفاء المفاصل والعمود الفقري، وتجنب تماماً ثقافة "التمرين رغم الألم الحاد".',
  },
];

export const HISTORICAL_APPROACHES: HistoricalApproachReference[] = [
  {
    id: 'silver-bronze-fullbody',
    eraOrApproachEn: 'Pre-1960s Classic Full-Body Tradition (3×/Week)',
    eraOrApproachAr: 'مدرسة الجسم الكامل الكلاسيكية (حقبة الخمسينيات وما قبلها)',
    notableFiguresEn: 'Reg Park, John Grimek, Steve Reeves era foundational templates',
    notableFiguresAr: 'حقبة ريج بارك وجون غريميك وستيف ريفز',
    characteristicsEn: 'Three non-consecutive full-body workouts weekly centering on squats, overhead presses, bench presses, rows, and curls/calves in 5×5 or 3×8–12 formats.',
    characteristicsAr: 'ثلاث جلسات أسبوعية غير متتالية للجسم بالكامل ترتكز على السكوات، الضغط العلوي، البنش، التجديف، والتمارين الأساسية بأسلوب 5×5 أو 3×8–12.',
    evidenceNoteEn: 'Surprisingly modern in frequency (3×/week per muscle) and high effort-to-recovery efficiency—remains one of the best templates for natural lifters.',
    evidenceNoteAr: 'تتوافق بشكل مدهش مع العلم الحديث من حيث التكرار الأسبوعي (3 مرات للعضلة) وكفاءة الاستشفاء، وتظل ممتازة للمتدرب الطبيعي.',
  },
  {
    id: 'golden-era-volume',
    eraOrApproachEn: '1960s–1970s Golden Era Split Bodybuilding',
    eraOrApproachAr: 'تقسيمة العصر الذهبي لكمال الأجسام (الستينيات والسبعينيات)',
    notableFiguresEn: 'Larry Scott, Sergio Oliva, Arnold Schwarzenegger, Franco Columbu era gyms',
    notableFiguresAr: 'حقبة لاري سكوت وسيرجيو أوليفا وأرنولد شوارزنيجر وفرانكو كولومبو',
    characteristicsEn: 'Antagonist pairing (Chest/Back, Arms supersets), high exercise variety, deliberate pump work, and high total weekly set volume often performed 5–6 days per week.',
    characteristicsAr: 'دمج العضلات المتقابلة (صدر مع ظهر)، السوبر ست للذراعين، وتنويع الزوايا مع حجم تدريبي عالٍ على 5–6 أيام أسبوعياً.',
    evidenceNoteEn: 'Notice the limitation: extreme double-split volume practiced by genetically gifted or assisted pros often causes burnout in recreational lifters—scale weekly sets moderately (12–18/muscle).',
    evidenceNoteAr: 'ملاحظة علمية مهمة: الأحجام المبالغ فيها التي طبّقها المحترفون آنذاك قد تسبب إجهاقاً للمتدرب العادي؛ يُنصح بتكييفها إلى 12–18 جولة متقنة أسبوعياً.',
  },
  {
    id: 'heavy-duty-hit',
    eraOrApproachEn: 'High-Intensity Low-Volume Consolidation (HIT Era)',
    eraOrApproachAr: 'مدرسة الشدة العالية والحجم المنخفض (HIT / Heavy Duty)',
    notableFiguresEn: 'Arthur Jones (Nautilus era) & Mike Mentzer, later adapted by Dorian Yates ("Blood & Guts" style)',
    notableFiguresAr: 'أرثر جونز ومايك منتزر، ولاحقاً أسلوب دوريان ييتس ذي الجولات المحدودة القوية',
    characteristicsEn: 'Very few all-out working sets per exercise (1–2 top sets after warm-ups) performed with strict tempo and longer rest days between sessions.',
    characteristicsAr: 'الاعتماد على جولة أو جولتين أساسيتين فقط بعد الإحماء بأداء بطيء صارم وفترات راحة أطول بين الحصص.',
    evidenceNoteEn: 'Shows that even 3–6 intense sets/week can maintain or slowly build muscle, though modern meta-analyses typically find moderate multi-set volume (10–16 sets/wk) produces greater average hypertrophy without forcing risky forced reps.',
    evidenceNoteAr: 'تؤكد الدراسات أن الحجم المنخفض الشديد يبني قدراً جيداً من القوة والحجم، لكن الأحجام المتوسطة (10–16 جولة أسبوعياً) تتفوق عادةً في التضخيم دون الحاجة لتكرارات إجبارية مجهدة.',
  },
];

export const PHILOSOPHY_COMPARISON_MATRIX: PhilosophyComparisonRow[] = [
  {
    dimensionEn: 'Training Philosophy',
    dimensionAr: 'الفلسفة العامة',
    modernEn: 'Hypothesis-tested hypertrophy & strength variables (tension, weekly sets, RIR, fatigue ratio).',
    modernAr: 'ضبط المتغيرات القابلة للقياس (التوتر الميكانيكي، الجولات الأسبوعية، RIR، ونسبة الإجهاد للعائد).',
    oldSchoolEn: 'Effort, intuition, foundational compound mastery, consistency, and complete visual physique balance.',
    oldSchoolAr: 'الانضباط، إتقان التمارين الحرة الأساسية، الروح القتالية الهادفة، وتناسق الجسم الشامل.',
    bridgeEn: 'Combine Old School consistency and compound grit with Modern volume/fatigue limits.',
    bridgeAr: 'اجمع بين انضباط المدرسة القديمة وحب التمارين الأساسية مع حدود الحجم والاستشفاء العلمية.',
  },
  {
    dimensionEn: 'Exercise Selection',
    dimensionAr: 'اختيار التمارين',
    modernEn: 'Chosen by stability, resistance profile match, joint comfort, and lengthened-tension bias.',
    modernAr: 'يُختار حسب الثبات المفصلي، توافق خط المقاومة، والتركيز على التمدد الآمن للعضلة.',
    oldSchoolEn: 'Barbells, dumbbells, bodyweight dips/pull-ups, and classic cable/plate-loaded movements.',
    oldSchoolAr: 'البار، الدامبل، المتوازي، العقلة، مع لمسات الكابل والأجهزة الكلاسيكية.',
    bridgeEn: 'Start sessions with classic free-weight compounds, finish with stable machines/cables.',
    bridgeAr: 'ابدأ بحركة مركبة كلاسيكية بالبار أو الدامبل وأتمم بأجهزة وكابلات ثابتة لعزل العضلة.',
  },
  {
    dimensionEn: 'Weekly Frequency',
    dimensionAr: 'التكرار الأسبوعي',
    modernEn: 'Usually 2×–3× per muscle group weekly to keep set quality high across the week.',
    modernAr: 'غالباً مرتان إلى ثلاث أسبوعياً لكل عضلة لضمان جودة الجولات.',
    oldSchoolEn: 'Either 3× Full Body (Silver Era) or 1×/week dedicated bodypart Bro Splits (1980s–90s).',
    oldSchoolAr: 'إما 3 أيام جسم كامل (الخمسينيات) أو تقسيمة عضلة واحدة أسبوعياً (الثمانينيات).',
    bridgeEn: 'Upper/Lower 4× or PPL 5–6× captures traditional bodybuilding focus at ~2×/week frequency.',
    bridgeAr: 'تقسيمة علوي/سفلي (4 أيام) أو دفع/سحب/أرجل توفر تركيز المدرسة القديمة بتكرار علمي مثالي.',
  },
  {
    dimensionEn: 'Weekly Volume',
    dimensionAr: 'الحجم التدريبي',
    modernEn: '10–20 hard sets per muscle weekly scaled conservatively to individual recovery.',
    modernAr: '10–20 جولة فعالة أسبوعياً لكل عضلة تُرفع أو تُخفض حسب التعافي.',
    oldSchoolEn: 'Ranges from ultra-low (1–2 top sets in HIT) to marathon 25+ sets in Golden Era splits.',
    oldSchoolAr: 'يتراوح بين منخفض جداً (جولتان في HIT) ومرتفع جداً (20+ جولة في بعض أنظمة السبعينيات).',
    bridgeEn: 'Track effective working sets explicitly rather than counting sloppy warm-ups.',
    bridgeAr: 'احسب الجولات الفعالة بدقة وتجنب التطرف في الكثرة المرهقة أو القلة الشديدة.',
  },
  {
    dimensionEn: 'Intensity & Failure',
    dimensionAr: 'الشدة والفشل العضلي',
    modernEn: 'Most work at 1–3 RIR (RPE 7.5–9); failure reserved mainly for safe isolation movements.',
    modernAr: 'أغلب الجولات عند RIR 1–3؛ ويُقتصر القرب الشديد من الفشل على العزل الآمن.',
    oldSchoolEn: 'Emphasizes pushing hard on "top sets"; some approaches (HIT) take every working set to failure.',
    oldSchoolAr: 'يعظّم الجهد في الجولات الرئيسية، وبعض مدارسه تدفع كل جولة لأقصى طاقة.',
    bridgeEn: 'Keep compounds at 1–2 RIR for safety/velocity; apply hard top-set grit on final isolation sets.',
    bridgeAr: 'أبقِ تكراراً أو اثنين احتياطاً في السكوات والديدلفت، وأخرج جهدك الكامل في الجولات الأخيرة الآمنة.',
  },
  {
    dimensionEn: 'Progression & Periodization',
    dimensionAr: 'التدرج وتخطيط الأسابيع',
    modernEn: 'Double progression, percentage waves, undulating blocks, and planned deloads.',
    modernAr: 'التدرج المزدوج، الموجات النسبية، التخطيط التموجي، وأسابيع التخفيف المنظمة.',
    oldSchoolEn: 'Linear weight addition when hitting target reps, intuitive heavy/light days, steady logbook grind.',
    oldSchoolAr: 'زيادة الوزن تدريجياً عند إكمال التكرارات مع الاعتماد على سجل التدريب المستمر.',
    bridgeEn: 'Use clear double-progression targets on every lift plus fatigue alerts from logged sessions.',
    bridgeAr: 'التزم بأهداف التدرج المزدوج مع الاستفادة من تنبيهات الإرهاق الرقمية.',
  },
  {
    dimensionEn: 'Strength vs Hypertrophy',
    dimensionAr: 'القوة مقابل التضخيم',
    modernEn: 'Separates neural heavy strength blocks (1–5 reps) from hypertrophy volume blocks (6–15+ reps).',
    modernAr: 'يميز بوضوح بين كتل القوة العصبية (1–5 تكرارات) وكتل التضخيم (6–15 تكراراً).',
    oldSchoolEn: '"Powerbuilding" spirit: chase heavy 5–8 reps on primary barbell lifts, pump 10–15 reps after.',
    oldSchoolAr: 'الجمع العملي: أوزان ثقيلة (5–8 تكرارات) في البداية ثم تكرارات أعلى (10–15) للضخ والضغط العضلي.',
    bridgeEn: 'Powerbuilding Hybrid blends low-rep main lifts with higher-rep scientific volume accessories.',
    bridgeAr: 'النظام الهجين يبدأ برفعة قوة مركبة ثم يبني الحجم العضلي بتمارين مساعدة دقيقة.',
  },
  {
    dimensionEn: 'Advantages & Limitations',
    dimensionAr: 'المزايا والقيود',
    modernEn: 'Pros: injury-conscious, quantifiable, sustainable. Limit: easy to over-analyze minor details.',
    modernAr: 'الميزة: مستدام وأكثر أماناً وقابل للقياس. القيد: قد ينشغل البعض بالتفاصيل على حساب الجهد.',
    oldSchoolEn: 'Pros: intense focus, mental toughness, zero wasted motion. Limit: risk of excessive failure/fatigue.',
    oldSchoolAr: 'الميزة: تركيز عالٍ وبساطة مباشرة. القيد: خطر الإفراط في الفشل أو تقليد أحجام غير مناسبة.',
    bridgeEn: 'Science prevents wasted fatigue; Old School spirit ensures you actually train hard when it counts.',
    bridgeAr: 'العلم يمنع الإجهاد الضائع، وروح المدرسة القديمة تضمن أنك تبذل جهداً حقيقياً داخل الصالة.',
  },
];

export interface HybridBuilderInput {
  philosophy: TrainingPhilosophy;
  goal: TrainingGoal;
  level: DifficultyLevel;
  daysPerWeek: number;
  equipment: EquipmentType[];
  ageGroup: 'adult' | 'youth';
  language: 'en' | 'ar';
}

export interface HybridBuilderOutput {
  programName: string;
  splitType: SplitType;
  durationWeeks: number;
  weeklyFrequency: number;
  intensityGuidance: string;
  progressionApproach: string;
  deloadGuidance: string;
  rationalePoints: string[];
  workouts: {
    dayIndex: number;
    name: string;
    description: string;
    exercises: Omit<WorkoutExerciseItem, 'itemId'>[];
  }[];
  scheduledDays: ProgramDaySchedule[];
}

const WEEKDAY_NAMES_EN = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function pickAvailableExercise(preferredIds: string[], availableEquip: Set<EquipmentType>) {
  for (const id of preferredIds) {
    const found = BUILTIN_EXERCISES.find((e) => e.id === id && availableEquip.has(e.equipment));
    if (found) return found;
  }
  for (const id of preferredIds) {
    const found = BUILTIN_EXERCISES.find((e) => e.id === id);
    if (found) return found;
  }
  return BUILTIN_EXERCISES[0];
}

export function buildSystemProgram(input: HybridBuilderInput): HybridBuilderOutput {
  const { philosophy, goal, level, daysPerWeek, equipment, ageGroup, language } = input;
  const isAr = language === 'ar';
  const freq = Math.max(2, Math.min(6, daysPerWeek));
  const equipSet = new Set<EquipmentType>(equipment.length ? equipment : ['barbell', 'dumbbell', 'cable', 'machine', 'bodyweight']);

  const splitType: SplitType =
    freq <= 3
      ? 'full_body'
      : freq === 4
        ? 'upper_lower'
        : philosophy === 'old_school'
          ? 'bro_split'
          : 'push_pull_legs';

  const isStrength = goal === 'strength';
  const isYouthOrBeginner = ageGroup === 'youth' || level === 'beginner';

  const mainSets = philosophy === 'old_school' ? 4 : isStrength ? 4 : 3;
  const accSets = philosophy === 'old_school' ? (isYouthOrBeginner ? 2 : 3) : 3;

  const mainReps: [number, number] =
    isStrength
      ? [4, 6]
      : philosophy === 'old_school'
        ? [6, 10]
        : philosophy === 'hybrid'
          ? [5, 8]
          : [8, 12];

  const accReps: [number, number] =
    philosophy === 'old_school' ? [10, 15] : isStrength ? [8, 12] : [10, 14];

  const mainRpe = isYouthOrBeginner ? 7.5 : philosophy === 'old_school' ? 8.5 : 8;
  const accRpe = isYouthOrBeginner ? 7.5 : philosophy === 'modern' ? 8.5 : 9;

  const makeItem = (
    candidates: string[],
    sets: number,
    repsMin: number,
    repsMax: number,
    rpe: number,
    rest: number,
    noteEn: string,
    noteAr: string
  ): Omit<WorkoutExerciseItem, 'itemId'> => {
    const ex = pickAvailableExercise(candidates, equipSet);
    return {
      exerciseId: ex.id,
      exerciseNameEn: ex.nameEn,
      exerciseNameAr: ex.nameAr,
      sets,
      warmupSets: ex.category === 'compound' ? (isYouthOrBeginner ? 1 : 2) : 0,
      targetRepsMin: repsMin,
      targetRepsMax: repsMax,
      targetRpe: rpe,
      targetRir: Math.max(0, Math.round((10 - rpe) * 10) / 10),
      restSeconds: rest,
      technique: 'standard',
      notes: isAr ? noteAr : noteEn,
    };
  };

  // Pre-build reusable blocks respecting chosen school + available equipment
  const buildPushDay = (variant: 'A' | 'B') => ({
    name: isAr ? (variant === 'A' ? 'الدفع أ (التركيز الثقيل)' : 'الدفع ب (التضخيم والحجم)') : variant === 'A' ? 'Push A (Foundational Strength)' : 'Push B (Hypertrophy Focus)',
    description: isAr ? 'صدر، أكتاف أمامية وجانبية، وترايسبس بتدرج متوازن.' : 'Balanced chest, anterior/lateral deltoid, and triceps development.',
    exercises: [
      makeItem(
        variant === 'A'
          ? ['barbell-bench-press', 'chest-press-machine', 'push-ups']
          : ['incline-dumbbell-press', 'incline-barbell-press', 'push-ups'],
        mainSets,
        mainReps[0],
        mainReps[1],
        mainRpe,
        150,
        'Primary horizontal/incline press — control the stretch for 2s.',
        'تمرين الدفع الرئيسي — تحكم في النزول لمدة ثانيتين.'
      ),
      makeItem(
        ['overhead-barbell-press', 'seated-dumbbell-shoulder-press', 'smith-overhead-press', 'resistance-band-chest-press'],
        mainSets,
        mainReps[0] + 1,
        mainReps[1] + 2,
        mainRpe,
        120,
        'Overhead press with tight core bracing.',
        'دفع علوي للكتف مع شد الجذع ومنع تقوّس الظهر.'
      ),
      makeItem(
        ['cable-chest-fly', 'incline-dumbbell-press', 'chest-dips', 'push-ups'],
        accSets,
        accReps[0],
        accReps[1],
        accRpe,
        75,
        'Controlled pectoral sweep/stretch without shoulder roll.',
        'تركيز على تمدد وانقباض عضلة الصدر دون إجهاد الكتف.'
      ),
      makeItem(
        ['dumbbell-lateral-raise', 'cable-lateral-raise', 'machine-lateral-raise'],
        accSets,
        12,
        16,
        accRpe,
        60,
        'Lead with elbows in the scapular plane.',
        'ارفع من المرفقين في مستوى لوح الكتف دون هز الجسم.'
      ),
      makeItem(
        ['cable-tricep-pushdown', 'overhead-cable-tricep-extension', 'ez-bar-skullcrusher', 'bench-dips'],
        accSets,
        accReps[0],
        accReps[1],
        accRpe,
        60,
        'Keep elbows pinned to emphasize triceps.',
        'ثبّت المرفقين لعزل الترايسبس بكفاءة.'
      ),
    ],
  });

  const buildPullDay = (variant: 'A' | 'B') => ({
    name: isAr ? (variant === 'A' ? 'السحب أ (السمك والقوة)' : 'السحب ب (العرض والعزل)') : variant === 'A' ? 'Pull A (Back Thickness)' : 'Pull B (Lat Width & Arms)',
    description: isAr ? 'عضلات الظهر، الكتف الخلفي، البايسبس، والساعد.' : 'Back width/thickness, rear delts, biceps, and grip.',
    exercises: [
      makeItem(
        variant === 'A'
          ? ['barbell-bent-over-row', 'chest-supported-row-machine', 'single-arm-dumbbell-row', 'resistance-band-row']
          : ['lat-pulldown', 'pull-ups', 'chin-ups', 'resistance-band-row'],
        mainSets,
        mainReps[0] + 1,
        mainReps[1] + 2,
        mainRpe,
        120,
        'Lead pull with elbows; pause cleanly at contraction.',
        'اسحب بالمرفقين للخلف وثبّت لحظة عند الانقباض.'
      ),
      makeItem(
        variant === 'A'
          ? ['pull-ups', 'lat-pulldown', 'chin-ups', 'resistance-band-row']
          : ['seated-cable-row', 'single-arm-dumbbell-row', 'chest-supported-row-machine'],
        mainSets,
        8,
        12,
        mainRpe,
        90,
        'Full scapular depression/retraction each rep.',
        'مد كامل للوح الكتف ثم سحب متحكم به.'
      ),
      makeItem(
        ['cable-face-pull', 'rear-delt-machine-fly', 'resistance-band-row'],
        accSets,
        12,
        16,
        accRpe,
        60,
        'External rotation finish for rear delts and scapular health.',
        'استهداف الكتف الخلفي وتوازن مفصل الكتف.'
      ),
      makeItem(
        ['barbell-bicep-curl', 'incline-dumbbell-curl', 'cable-bicep-curl', 'hammer-curl'],
        accSets,
        accReps[0],
        accReps[1],
        accRpe,
        60,
        'Keep elbows anchored; avoid back swing.',
        'ثبّت المرفقين وتجنب مرجحة الجذع.'
      ),
    ],
  });

  const buildLegsDay = (variant: 'A' | 'B') => ({
    name: isAr ? (variant === 'A' ? 'الأرجل أ (تركيز القرفصاء والأمامي)' : 'الأرجل ب (السلسلة الخلفية)') : variant === 'A' ? 'Legs A (Quad & Squat Focus)' : 'Legs B (Posterior Chain & Hinge)',
    description: isAr ? 'الفخذ الأمامي، الفخذ الخلفي، الألوية، السمانة، والبطن.' : 'Balanced quad, hamstring, glute, calf, and core work.',
    exercises: [
      makeItem(
        variant === 'A'
          ? ['barbell-back-squat', 'leg-press-machine', 'smith-squat', 'dumbbell-goblet-squat']
          : ['romanian-deadlift', 'conventional-deadlift', 'dumbbell-rdl', 'barbell-hip-thrust'],
        mainSets,
        mainReps[0],
        mainReps[1],
        mainRpe,
        150,
        'Brace torso 360°; hit clean repeatable depth.',
        'شد الجذع بالكامل وحافظ على عمق ثابت ومنضبط.'
      ),
      makeItem(
        variant === 'A'
          ? ['romanian-deadlift', 'lying-leg-curl', 'dumbbell-rdl']
          : ['bodyweight-bulgarian-split-squat', 'leg-press-machine', 'dumbbell-goblet-squat'],
        mainSets,
        8,
        12,
        mainRpe,
        120,
        'Controlled eccentric tension.',
        'نزول بطيء متحكم به لاستهداف الأنسجة الخلفية.'
      ),
      makeItem(
        ['leg-extension-machine', 'leg-curl', 'lying-leg-curl', 'bodyweight-bulgarian-split-squat'].filter(
          (id) => id !== 'leg-curl'
        ),
        accSets,
        10,
        15,
        accRpe,
        75,
        'Smooth controlled isolation rep cadence.',
        'أداء بطيء ومتحكم به بدون ارتداد.'
      ),
      makeItem(
        ['standing-calf-raise-machine', 'smith-standing-calf-raise', 'seated-calf-raise'],
        accSets,
        12,
        18,
        accRpe,
        60,
        'Pause 1–2s in the bottom stretch.',
        'توقف ثانية في الأسفل لإلغاء الارتداد.'
      ),
      makeItem(
        ['cable-crunch', 'hanging-leg-raise', 'plank-hold', 'resistance-band-pallof-press'],
        accSets,
        10,
        15,
        8,
        60,
        'Strict spinal flexion / rigid core bracing.',
        'ثني مركز للبطن مع تثبيت الحوض.'
      ),
    ],
  });

  const buildFullBodyDay = (label: 'A' | 'B' | 'C') => {
    const map = {
      A: {
        name: isAr ? 'جسم كامل أ (القوة الأساسية)' : 'Full Body A (Primary Foundations)',
        desc: isAr ? 'سكوات + بنش + تجديف + رفرفة + بطن.' : 'Squat, bench press, row, lateral raise, and core.',
        ex: [
          makeItem(['barbell-back-squat', 'leg-press-machine', 'dumbbell-goblet-squat'], mainSets, mainReps[0], mainReps[1], mainRpe, 150, 'Primary lower compound.', 'حركة سفلية أساسية.'),
          makeItem(['barbell-bench-press', 'chest-press-machine', 'push-ups'], mainSets, mainReps[0], mainReps[1], mainRpe, 120, 'Primary horizontal press.', 'دفع أفقي رئيسي.'),
          makeItem(['barbell-bent-over-row', 'seated-cable-row', 'single-arm-dumbbell-row', 'resistance-band-row'], mainSets, 8, 12, mainRpe, 120, 'Horizontal back pull.', 'سحب أفقي للظهر.'),
          makeItem(['dumbbell-lateral-raise', 'cable-lateral-raise'], accSets, 12, 16, accRpe, 60, 'Lateral delts.', 'أكتاف جانبية.'),
          makeItem(['plank-hold', 'cable-crunch', 'resistance-band-pallof-press'], accSets, 10, 15, 8, 60, 'Core bracing.', 'ثبات الجذع.'),
        ],
      },
      B: {
        name: isAr ? 'جسم كامل ب (الورك والدفع العلوي)' : 'Full Body B (Hinge & Overhead)',
        desc: isAr ? 'ديدلفت روماني + ضغط علوي + سحب عالي + ذراعين.' : 'RDL, overhead press, pulldown/pull-up, and arm accessories.',
        ex: [
          makeItem(['romanian-deadlift', 'dumbbell-rdl', 'lying-leg-curl'], mainSets, mainReps[0] + 1, mainReps[1] + 2, mainRpe, 150, 'Primary hip hinge.', 'حركة ورك رئيسية.'),
          makeItem(['overhead-barbell-press', 'seated-dumbbell-shoulder-press', 'smith-overhead-press', 'push-ups'], mainSets, mainReps[0] + 1, mainReps[1] + 2, mainRpe, 120, 'Vertical overhead press.', 'دفع عمودي للأكتاف.'),
          makeItem(['lat-pulldown', 'pull-ups', 'resistance-band-row'], mainSets, 8, 12, mainRpe, 90, 'Vertical lat pull.', 'سحب عمودي للظهر.'),
          makeItem(['barbell-bicep-curl', 'hammer-curl'], accSets, accReps[0], accReps[1], accRpe, 60, 'Biceps isolation.', 'بايسبس.'),
          makeItem(['cable-tricep-pushdown', 'bench-dips'], accSets, accReps[0], accReps[1], accRpe, 60, 'Triceps isolation.', 'ترايسبس.'),
        ],
      },
      C: {
        name: isAr ? 'جسم كامل ج (تكميلي متوازن)' : 'Full Body C (Unilateral & Volume)',
        desc: isAr ? 'سكوات بلغاري + صدر مائل + سحب كابل + سمانة.' : 'Split squat, incline press, cable row, calves, and rear delts.',
        ex: [
          makeItem(['bodyweight-bulgarian-split-squat', 'leg-extension-machine', 'dumbbell-goblet-squat'], mainSets, 8, 12, mainRpe, 120, 'Unilateral leg balance & quads.', 'توازن الفخذ والألوية.'),
          makeItem(['incline-dumbbell-press', 'incline-barbell-press', 'push-ups'], mainSets, 8, 12, mainRpe, 120, 'Clavicular chest emphasis.', 'ألياف الصدر العلوية.'),
          makeItem(['chest-supported-row-machine', 'single-arm-dumbbell-row', 'seated-cable-row', 'resistance-band-row'], mainSets, 10, 14, mainRpe, 90, 'Mid-back control.', 'تجديف متحكم به.'),
          makeItem(['cable-face-pull', 'rear-delt-machine-fly'], accSets, 12, 16, accRpe, 60, 'Rear delts.', 'أكتاف خلفية.'),
          makeItem(['standing-calf-raise-machine', 'smith-standing-calf-raise', 'seated-calf-raise'], accSets, 12, 18, accRpe, 60, 'Calves.', 'سمانة.'),
        ],
      },
    };
    return {
      name: map[label].name,
      description: map[label].desc,
      exercises: map[label].ex,
    };
  };

  let workouts: HybridBuilderOutput['workouts'] = [];
  if (splitType === 'full_body') {
    const daySlots = freq === 2 ? [0, 3] : [0, 2, 4];
    const labels: ('A' | 'B' | 'C')[] = freq === 2 ? ['A', 'B'] : ['A', 'B', 'C'];
    workouts = daySlots.map((dayIndex, idx) => ({
      dayIndex,
      ...buildFullBodyDay(labels[idx]),
    }));
  } else if (splitType === 'upper_lower') {
    workouts = [
      {
        dayIndex: 0,
        name: isAr ? 'الجزء العلوي أ (قوة ودفع/سحب)' : 'Upper Body A (Strength & Balanced)',
        description: isAr ? 'صدر، ظهر، أكتاف، وذراعان بتركيز مركب.' : 'Compound horizontal press, row, overhead press, and pulldown.',
        exercises: [
          ...buildPushDay('A').exercises.slice(0, 2),
          ...buildPullDay('A').exercises.slice(0, 2),
          makeItem(['cable-tricep-pushdown', 'bench-dips'], 2, 10, 14, accRpe, 60, 'Arm finisher.', 'تكميلي للذراع.'),
        ],
      },
      { dayIndex: 1, ...buildLegsDay('A') },
      {
        dayIndex: 3,
        name: isAr ? 'الجزء العلوي ب (حجم وعزل متوازن)' : 'Upper Body B (Hypertrophy & Detail)',
        description: isAr ? 'صدر علوي، سحب عريض، رفرفة، وذراعان.' : 'Incline press, cable row, lateral raises, rear delts, and arms.',
        exercises: [
          ...buildPushDay('B').exercises.slice(0, 1),
          ...buildPullDay('B').exercises.slice(1, 3),
          makeItem(['dumbbell-lateral-raise', 'cable-lateral-raise'], accSets, 12, 16, accRpe, 60, 'Medial delts.', 'أكتاف جانبية.'),
          makeItem(['incline-dumbbell-curl', 'hammer-curl'], accSets, 10, 14, accRpe, 60, 'Biceps.', 'بايسبس.'),
        ],
      },
      { dayIndex: 4, ...buildLegsDay('B') },
    ];
  } else if (splitType === 'bro_split') {
    workouts = [
      {
        dayIndex: 0,
        name: isAr ? 'يوم الصدر الكلاسيكي' : 'Classic Chest Focus',
        description: isAr ? 'دفع مستوي، دفع مائل، وتفتيح بتوتر مستمر.' : 'Flat press, incline press, and controlled chest flyes.',
        exercises: [
          buildPushDay('A').exercises[0],
          buildPushDay('B').exercises[0],
          buildPushDay('A').exercises[2],
        ],
      },
      { dayIndex: 1, ...buildPullDay('A') },
      {
        dayIndex: 2,
        name: isAr ? 'يوم الأكتاف والترابيس' : 'Classic Shoulders Focus',
        description: isAr ? 'ضغط علوي، رفرفة جانبية، وكتف خلفي.' : 'Overhead pressing paired with lateral and rear deltoid isolation.',
        exercises: [
          buildPushDay('A').exercises[1],
          buildPushDay('A').exercises[3],
          buildPullDay('A').exercises[2],
        ],
      },
      { dayIndex: 3, ...buildLegsDay('A') },
      {
        dayIndex: 4,
        name: isAr ? 'يوم الذراعين (بايسبس وترايسبس)' : 'Classic Arms Focus',
        description: isAr ? 'بناء متوازن للبايسبس والترايسبس والساعد.' : 'Targeted biceps, brachialis, and triceps long/lateral head work.',
        exercises: [
          makeItem(['barbell-bicep-curl', 'cable-bicep-curl'], accSets, 8, 12, accRpe, 75, 'Barbell biceps mass.', 'بايسبس أساسي.'),
          makeItem(['ez-bar-skullcrusher', 'overhead-cable-tricep-extension'], accSets, 8, 12, accRpe, 75, 'Long head triceps.', 'ترايسبس علوي.'),
          makeItem(['hammer-curl', 'incline-dumbbell-curl'], accSets, 10, 14, accRpe, 60, 'Brachialis & forearms.', 'هامر وسواعد.'),
          makeItem(['cable-tricep-pushdown', 'bench-dips'], accSets, 10, 15, accRpe, 60, 'Lockout tension.', 'بوش داون.'),
        ],
      },
    ];
    if (freq === 6) {
      workouts.push({ dayIndex: 5, ...buildLegsDay('B') });
    }
  } else {
    // PPL 5 or 6 days
    const base = [
      { dayIndex: 0, ...buildPushDay('A') },
      { dayIndex: 1, ...buildPullDay('A') },
      { dayIndex: 2, ...buildLegsDay('A') },
      { dayIndex: 4, ...buildPushDay('B') },
      { dayIndex: 5, ...buildPullDay('B') },
    ];
    if (freq >= 6) {
      base.push({ dayIndex: 3, ...buildLegsDay('B') });
      // adjust cleanly: Mon PushA, Tue PullA, Wed LegsA, Thu PushB, Fri PullB, Sat LegsB
      workouts = [
        { dayIndex: 0, ...buildPushDay('A') },
        { dayIndex: 1, ...buildPullDay('A') },
        { dayIndex: 2, ...buildLegsDay('A') },
        { dayIndex: 3, ...buildPushDay('B') },
        { dayIndex: 4, ...buildPullDay('B') },
        { dayIndex: 5, ...buildLegsDay('B') },
      ];
    } else {
      workouts = base;
    }
  }

  const scheduledDays: ProgramDaySchedule[] = WEEKDAY_NAMES_EN.map((label, dayIndex) => {
    const w = workouts.find((item) => item.dayIndex === dayIndex);
    return {
      dayIndex,
      label,
      isRestDay: !w,
      workoutId: '',
      workoutName: w ? w.name : '',
    };
  });

  const schoolTag =
    philosophy === 'modern'
      ? isAr
        ? 'العلمي الحديث'
        : 'Modern Science'
      : philosophy === 'old_school'
        ? isAr
          ? 'المدرسة الكلاسيكية'
          : 'Old School'
        : isAr
          ? 'النظام الهجين'
          : 'Hybrid System';

  const programName = isAr ? `برنامج ${schoolTag} (${freq} أيام)` : `APEX ${schoolTag} ${freq}-Day`;

  const rationalePoints = isAr
    ? [
        `تم اختيار تقسيمة "${splitType === 'full_body' ? 'الجسم الكامل' : splitType === 'upper_lower' ? 'علوي / سفلي' : splitType === 'bro_split' ? 'عضلة يومياً' : 'دفع / سحب / أرجل'}" لتناسب تدريب ${freq} أيام أسبوعياً مع مراعاة الاستشفاء بين الحصص.`,
        philosophy === 'hybrid'
          ? 'الفلسفة الهجينة تبدأ كل حصة بتمرين مركب كلاسيكي بنطاق تكرارات منخفض/متوسط لبناء القوة الأساسية، ثم تنتقل لتمارين عزل وكابلات مضبوطة الحجم والتوتر.'
          : philosophy === 'old_school'
            ? 'الفلسفة الكلاسيكية تمنح الأولوية للتمارين المركبة بالبار والدامبل والتركيز الذهني العضلي مع تدوين دقيق للأوزان دون مبالغة خطيرة في الجولات.'
            : 'الفلسفة العلمية تضبط الحجم الفعّال لكل عضلة مع الإبقاء على 1–3 تكرارات احتياط (RIR) لتحفيز التضخيم مع تقليل الإجهاد التراكمي.',
        isYouthOrBeginner
          ? 'نظراً لمستوى المبتدئ أو الفئة الناشئة، تم ضبط الشدة عند RPE 7.5 ومضاعفة التركيز على إتقان التكنيك قبل زيادة الحمل.'
          : 'يُطبّق التدرج المزدوج: أكمل أعلى نطاق للتكرارات بتحكم كامل عبر جميع الجولات قبل إضافة وزن إضافي في الجلسة التالية.',
      ]
    : [
        `Selected ${splitType.replace(/_/g, ' ')} architecture to align cleanly with your ${freq}-day schedule and recovery window.`,
        philosophy === 'hybrid'
          ? 'Hybrid blend anchors each day with a heavy foundational barbell/compound lift (Old School progressive resistance) followed by controlled biomechanical isolation work calibrated via RIR.'
          : philosophy === 'old_school'
            ? 'Old School structure emphasizes barbell/dumbbell multi-joint staples, strict mind-muscle control, and steady logbook progression without junk volume.'
            : 'Modern Science structure balances weekly working sets across muscles with 1–3 RIR effort control for high stimulus-to-fatigue efficiency.',
        isYouthOrBeginner
          ? 'Because beginner or youth status is active, target RPE is moderated (~7.5) to prioritize form consistency and joint adaptation.'
          : 'Follow double progression: master the top of the rep range across all working sets with steady tempo before adding load.',
      ];

  return {
    programName,
    splitType,
    durationWeeks: level === 'beginner' ? 8 : 10,
    weeklyFrequency: freq,
    intensityGuidance: isAr
      ? `شدة رئيسية ${mainRpe} RPE وتمارين مساعدة ${accRpe} RPE مع الحفاظ على ثبات المسار الحركي.`
      : `Primary compounds around RPE ${mainRpe} (${Math.max(1, Math.round(10 - mainRpe))} RIR); accessories near RPE ${accRpe}.`,
    progressionApproach: isAr
      ? 'التدرج المزدوج: ارفع التكرارات إلى الحد الأعلى في كل الجولات قبل زيادة 2.5–5 كجم.'
      : 'Double progression: hit the upper rep limit across all working sets with clean control before increasing load.',
    deloadGuidance: isAr
      ? 'كل 5–6 أسابيع أو عند الشعور بتراجع الأداء: خفض الجولات 40٪ مع إبقاء نفس الأوزان بتحكم.'
      : 'Every 5–6 weeks (or if fatigue accumulates), trim working sets by ~40% for 1 recovery week.',
    rationalePoints,
    workouts,
    scheduledDays,
  };
}
