import { Exercise, ExerciseComparison, MovementPattern, MovementPhaseDetail, MuscleGroup } from '../types/ironlog';

export interface ExerciseBiomechanicsMeta {
  movementPattern: MovementPattern;
  stabilizerMuscles: MuscleGroup[];
  techniqueSummaryEn: string;
  techniqueSummaryAr: string;
  gripStanceEn: string;
  gripStanceAr: string;
  phases: MovementPhaseDetail[];
  easierAlternativeIds: string[];
  harderAlternativeIds: string[];
  variationsEn: string[];
  variationsAr: string[];
  comparisons: ExerciseComparison[];
}

const DEFAULT_PHASES_BY_PATTERN: Record<MovementPattern, MovementPhaseDetail[]> = {
  bench_press: [
    {
      phase: 'setup',
      labelEn: 'Setup & Scapular Pack',
      labelAr: 'التهيئة وتثبيت اللوحين',
      cueEn: 'Plant feet firmly, pull shoulder blades down and back into the bench, and stack wrists vertically above elbows.',
      cueAr: 'ثبّت القدمين بالأرض، اسحب لوحي الكتف للأسفل وللخلف على المقعد، واجعل المعصم عمودياً فوق المرفق.'
    },
    {
      phase: 'eccentric',
      labelEn: 'Controlled Descent (2–3s)',
      labelAr: 'النزول المتحكم به (2–3 ث)',
      cueEn: 'Lower smoothly toward mid-lower sternum while keeping elbows tucked ~45° from torso.',
      cueAr: 'أنزل الوزن بثبات نحو منتصف/أسفل الصدر مع إبقاء زاوية المرفقين قريبة من 45 درجة.'
    },
    {
      phase: 'isometric',
      labelEn: 'Brief Chest Pause',
      labelAr: 'توقف خفيف عند الصدر',
      cueEn: 'Kiss chest gently without bouncing; stay tight through lats and upper back.',
      cueAr: 'المس الصدر دون ارتداد مع الحفاظ على شد الظهر والجذع بالكامل.'
    },
    {
      phase: 'concentric',
      labelEn: 'Drive & Lockout',
      labelAr: 'الدفع والصعود بثبات',
      cueEn: 'Press explosively up and slightly back toward the shoulder line while maintaining ribcage height.',
      cueAr: 'ادفع بقوة للأعلى وللخلف قليلاً نحو خط الكتفين دون رفع الأرداف عن المقعد.'
    },
  ],
  incline_press: [
    {
      phase: 'setup',
      labelEn: '30–45° Bench Setup',
      labelAr: 'ضبط المقعد المائل 30–45°',
      cueEn: 'Keep bench angle moderate (30–45°), pin shoulder blades back, and stack load directly above clavicle.',
      cueAr: 'اضبط الميل على 30–45 درجة وثبّت اللوحين مع محاذاة الوزن فوق أعلى الصدر.'
    },
    {
      phase: 'eccentric',
      labelEn: 'Upper-Chest Stretch',
      labelAr: 'نزول وتمدد الصدر العلوي',
      cueEn: 'Lower along a slight arc to upper chest height with elbows tucked ~45°.',
      cueAr: 'أنزل بتحكم إلى مستوى أعلى الصدر أسفل الترقوة دون فتح المرفقين 90 درجة.'
    },
    {
      phase: 'isometric',
      labelEn: 'Controlled Bottom Transition',
      labelAr: 'ثبات النقطة السفلية',
      cueEn: 'Hold bottom tension for 0.5–1s so clavicular pec fibers absorb the turnaround cleanly.',
      cueAr: 'توقف لحظة في الأسفل لتحميل ألياف الصدر العلوي دون اعتماد على الارتداد.'
    },
    {
      phase: 'concentric',
      labelEn: 'Incline Press Drive',
      labelAr: 'الدفع للأعلى وللداخل',
      cueEn: 'Drive smoothly upward above the collarbone without rolling shoulders forward.',
      cueAr: 'ادفع باستقامة للأعلى فوق الترقوة مع إبقاء الكتفين مثبتين للخلف.'
    },
  ],
  chest_fly: [
    {
      phase: 'setup',
      labelEn: 'Staggered Anchor & Soft Elbows',
      labelAr: 'ثبات الوقفة وثني طفيف للمرفق',
      cueEn: 'Keep chest proud, shoulder blades drawn back, and maintain a fixed 15–20° bend at the elbows.',
      cueAr: 'ارفع الصدر وثبّت المرفقين بزاوية انثناء ثابتة نحو 15–20 درجة طوال الحركة.'
    },
    {
      phase: 'concentric',
      labelEn: 'Midline Adduction Arc',
      labelAr: 'الضم نحو خط المنتصف',
      cueEn: 'Sweep arms inward as if hugging a wide barrel, focusing on bringing biceps toward chest.',
      cueAr: 'اجمع الذراعين للداخل في قوس واسع وكأنك تعانق جذعاً كبيراً.'
    },
    {
      phase: 'isometric',
      labelEn: '1s Peak Contraction',
      labelAr: 'عصر لمدة ثانية في القمة',
      cueEn: 'Squeeze sternal pecs hard at midline before opening back up.',
      cueAr: 'اعصر عضلة الصدر بتركيز لمدة ثانية كاملة قبل العودة.'
    },
    {
      phase: 'eccentric',
      labelEn: 'Open & Load Stretch',
      labelAr: 'الفتح بتحكم ومد كامل',
      cueEn: 'Resist the pull slowly back out until a clean stretch across the outer pecs.',
      cueAr: 'قاوم السحب ببطء حتى تمدد الصدر دون تقدم الكتفين للأمام.'
    },
  ],
  row: [
    {
      phase: 'setup',
      labelEn: 'Neutral Spine & Brace',
      labelAr: 'استقامة الظهر وشد الجذع',
      cueEn: 'Set chest tall and lock hip hinge or chest pad cleanly; keep neck neutral with torso.',
      cueAr: 'حافظ على استقامة العمود الفقري تماماً مع تثبيت الجذع أو إسناد الصدر بالوسادة.'
    },
    {
      phase: 'concentric',
      labelEn: 'Elbow Drive to Hips',
      labelAr: 'سحب المرفقين نحو الحوض',
      cueEn: 'Pull elbows back toward pockets/lower ribs rather than yanking with biceps.',
      cueAr: 'اسحب بالمرفقين للخلف نحو الخصر واضغط لوحي الكتف للداخل عند النهاية.'
    },
    {
      phase: 'isometric',
      labelEn: 'Scapular Squeeze',
      labelAr: 'ثبات وضغط لوحي الكتف',
      cueEn: 'Pause 1s at peak contraction keeping shoulders depressed away from ears.',
      cueAr: 'ثبّت لثانية عند أقصى سحب مع إبقاء الكتفين منخفضين بعيداً عن الأذنين.'
    },
    {
      phase: 'eccentric',
      labelEn: 'Full Protraction Stretch',
      labelAr: 'الإطالة الكاملة بتحكم',
      cueEn: 'Control weight forward allowing shoulder blades to protract smoothly without torso collapse.',
      cueAr: 'أعد الوزن ببطء للسماح بتمدد الظهر والعضلة العريضة دون تقوّس أسفل الظهر.'
    },
  ],
  pulldown: [
    {
      phase: 'setup',
      labelEn: 'Overhead Reach & Rib Brace',
      labelAr: 'الإطالة العلوية وشد البطن',
      cueEn: 'Keep ribcage stacked over pelvis; grip shoulder-width or slightly wider without shrugging.',
      cueAr: 'ثبّت الجذع مع قبضة بعرض الكتفين أو أعرض قليلاً دون أرجحة للخلف.'
    },
    {
      phase: 'concentric',
      labelEn: 'Depress Scapula & Pull',
      labelAr: 'خفض الكتف ثم السحب',
      cueEn: 'Initiate by depressing shoulder blades down, then drive elbows vertically toward your sides.',
      cueAr: 'ابدأ بخفض لوحي الكتف للأسفل ثم اسحب المرفقين نحو الجانبين حتى أعلى الصدر.'
    },
    {
      phase: 'isometric',
      labelEn: 'Clavicle / Chest Peak Hold',
      labelAr: 'توقف لحظي عند أعلى الصدر',
      cueEn: 'Touch upper chest / bring chin over bar briefly keeping elbows tucked cleanly under wrists.',
      cueAr: 'ثبّت لحظة في القمة مع إبقاء المرفقين أسفل المعصمين وتجنب ميلان الجذع المفرط.'
    },
    {
      phase: 'eccentric',
      labelEn: 'Slow Overhead Extension',
      labelAr: 'الصعود البطيء للامتداد',
      cueEn: 'Rise steadily for 2–3s until lats fully lengthen overhead without losing shoulder control.',
      cueAr: 'اصعد بتحكم 2–3 ثوانٍ لإطالة عضلة الظهر العريضة بالكامل.'
    },
  ],
  overhead_press: [
    {
      phase: 'setup',
      labelEn: 'Stacked Ribcage & Forearms',
      labelAr: 'تراص الجذع والساعدين',
      cueEn: 'Squeeze glutes and brace abs tight so lumbar spine stays neutral; forearms vertical under load.',
      cueAr: 'اشدد الأرداف والبطن لمنع تقوّس الظهر، واجعل الساعدين عموديين تحت الوزن.'
    },
    {
      phase: 'concentric',
      labelEn: 'Vertical Press Past Chin',
      labelAr: 'دفع عمودي فوق الرأس',
      cueEn: 'Press straight up, tucking chin slightly back so bar travels cleanly over mid-foot/ears.',
      cueAr: 'ادفع باستقامة للأعلى وادخل الرأس للأمام قليلاً فور تجاوز الجبهة لتثبيت التوازن.'
    },
    {
      phase: 'isometric',
      labelEn: 'Stacked Overhead Lockout',
      labelAr: 'ثبات القفل العلوي',
      cueEn: 'Finish with weight directly over shoulder joints and head framed subtly through arms.',
      cueAr: 'ثبّت الوزن عمودياً فوق الكتفين مباشرة دون تقويس الظهر.'
    },
    {
      phase: 'eccentric',
      labelEn: 'Controlled Lower to Clavicle',
      labelAr: 'النزول بتحكم لمستوى الترقوة',
      cueEn: 'Lower slowly under control keeping elbows slightly in front of the bar/line of pull.',
      cueAr: 'أنزل بتحكم إلى مستوى أعلى الصدر مع بقاء المرفقين متقدمين قليلاً.'
    },
  ],
  lateral_raise: [
    {
      phase: 'setup',
      labelEn: 'Scapular Plane (~30° Forward)',
      labelAr: 'زاوية لوح الكتف (~30° للأمام)',
      cueEn: 'Stand tall, depress shoulders, and angle arms ~20–30° forward rather than pure 90° out.',
      cueAr: 'قف باستقامة مع خفض الكتفين وتوجيه الذراعين للأمام بنحو 20–30 درجة في مستوى لوح الكتف.'
    },
    {
      phase: 'concentric',
      labelEn: 'Sweep Out to Shoulder Height',
      labelAr: 'الرفع للخارج حتى مستوى الكتف',
      cueEn: 'Reach outward toward room walls leading with elbows/knuckles rather than shrugging traps.',
      cueAr: 'ارفع للخارج وكأنك تلامس الجدارين دون سحب الكتفين نحو الأذنين.'
    },
    {
      phase: 'isometric',
      labelEn: 'Parallel Pause',
      labelAr: 'ثبات أفقي قصير',
      cueEn: 'Pause briefly at shoulder height while keeping deltoid tension high.',
      cueAr: 'توقف لحظة عند توازي الذراعين مع الأرض قبل النزول.'
    },
    {
      phase: 'eccentric',
      labelEn: 'Resist Gravity Downward',
      labelAr: 'نزول بطيء مقاوم للجاذبية',
      cueEn: 'Lower smoothly over 2–3s stopping just short of legs so tension never disappears.',
      cueAr: 'انزل ببطء خلال 2–3 ثوانٍ دون إسناد الوزن على الفخذين.'
    },
  ],
  bicep_curl: [
    {
      phase: 'setup',
      labelEn: 'Pinned Upper Arms',
      labelAr: 'تثبيت العضد بمحاذاة الجذع',
      cueEn: 'Pin elbows gently at your sides and brace abs so lower back does not swing backward.',
      cueAr: 'ثبّت المرفقين بمحاذاة الجذع واشدد البطن لمنع أرجحة الظهر.'
    },
    {
      phase: 'concentric',
      labelEn: 'Pure Elbow Flexion',
      labelAr: 'ثني المرفق بتركيز',
      cueEn: 'Curl cleanly upward squeezing biceps through the mid-range without elbows drifting way forward.',
      cueAr: 'ارفع الوزن بثني المرفق فقط دون رفع الكتف أو دفع المرفق كثيراً للأمام.'
    },
    {
      phase: 'isometric',
      labelEn: 'Peak Squeeze',
      labelAr: 'انقباض قمي قصير',
      cueEn: 'Contract biceps firmly at top while keeping wrists straight/neutral.',
      cueAr: 'اعصر العضلة في الأعلى مع الحفاظ على استقامة المعصم.'
    },
    {
      phase: 'eccentric',
      labelEn: 'Full Lengthening Descent',
      labelAr: 'فرد كامل بتحكم 2–3 ث',
      cueEn: 'Lower all the way down until triceps engage slightly so every rep hits full length.',
      cueAr: 'أنزل الوزن حتى الفرد الكامل المتحكم به لضمان المدى الحركي الكامل.'
    },
  ],
  tricep_extension: [
    {
      phase: 'setup',
      labelEn: 'Locked Upper-Arm Hinge',
      labelAr: 'تثبيت العضد ومفصل المرفق',
      cueEn: 'Fix upper arm angle solidly (at sides or overhead); avoid shoulder drifting during the set.',
      cueAr: 'ثبّت زاوية العضد تماماً بجانب الجسم أو خلف الرأس دون تحريك الكتف.'
    },
    {
      phase: 'eccentric',
      labelEn: 'Deep Elbow Flexion Stretch',
      labelAr: 'ثني المرفق لإطالة الترايسبس',
      cueEn: 'Allow forearms to fold maximally under load to stretch lateral/long tricep heads.',
      cueAr: 'اسمح بانثناء المرفق لأقصى مدى مريح لإطالة عضلة الترايسبس بالكامل.'
    },
    {
      phase: 'isometric',
      labelEn: 'Stretched Turnaround',
      labelAr: 'توقف خفيف في أقصى تمدد',
      cueEn: 'Absorb tension smoothly without bouncing out of the elbow tendon.',
      cueAr: 'انتقل للدفع بهدوء دون ارتداد على أوتار المرفق.'
    },
    {
      phase: 'concentric',
      labelEn: 'Clean Elbow Lockout',
      labelAr: 'فرد المرفق لعصر الترايسبس',
      cueEn: 'Extend elbows cleanly to full contraction and hold briefly.',
      cueAr: 'افرد المرفقين حتى الانقباض الكامل مع ثبات قصير.'
    },
  ],
  squat: [
    {
      phase: 'setup',
      labelEn: 'Tripod Foot & 360° Brace',
      labelAr: 'توازن القدم وشد الجذع 360°',
      cueEn: 'Grip floor evenly across heel, big toe, and pinky toe; brace torso evenly around ribs and pelvis.',
      cueAr: 'وزّع الوزن بالتساوي على الكعب وأطراف القدم واشدد البطن والظهر بقوة قبل النزول.'
    },
    {
      phase: 'eccentric',
      labelEn: 'Knees Track Over Toes',
      labelAr: 'نزول متزن والركبتان نحو الأصابع',
      cueEn: 'Descend smoothly breaking at hips and knees while keeping knees aligned over 2nd–3rd toes.',
      cueAr: 'انزل بتحكم مع توجيه الركبتين بمحاذاة أصابع القدم دون ميلان للداخل.'
    },
    {
      phase: 'isometric',
      labelEn: 'Parallel / Below-Parallel Hole',
      labelAr: 'ثبات القاع بدون ارتخاء',
      cueEn: 'Keep torso angle locked and spinal neutral at bottom depth—avoid lumbar butt-wink collapse.',
      cueAr: 'حافظ على شد الجذع عند عمق الموازاة أو أسفلها قليلاً دون ارتخاء أسفل الظهر.'
    },
    {
      phase: 'concentric',
      labelEn: 'Drive Through Mid-Foot',
      labelAr: 'دفع الأرض بمنتصف القدم',
      cueEn: 'Push hips and chest upward at the same rate until standing cleanly upright.',
      cueAr: 'ادفع الأرض بمنتصف القدم واصعد بالورك والصدر بتزامن واحد.'
    },
  ],
  hinge: [
    {
      phase: 'setup',
      labelEn: 'Lats Locked & Neutral Spine',
      labelAr: 'شد الظهر العريض واستقامة العمود الفقري',
      cueEn: 'Pack shoulder blades down ("bend bar around shins") and align head/ribcage/pelvis rigidly.',
      cueAr: 'اسحب الكتفين للخلف وللأسفل وحافظ على استقامة الرأس مع الجذع والحوض.'
    },
    {
      phase: 'eccentric',
      labelEn: 'Push Hips Straight Back',
      labelAr: 'دفع الورك للخلف لا للأسفل',
      cueEn: 'Slide hips horizontally backward while keeping bar close to thighs and shins near vertical.',
      cueAr: 'ادفع الحوض أفقياً للخلف مع بقاء البار ملاصقاً للفخذين والساقين شبه عموديتين.'
    },
    {
      phase: 'isometric',
      labelEn: 'Peak Hamstring Tension',
      labelAr: 'أقصى تمدد في الفخذ الخلفي',
      cueEn: 'Stop descent when hips stop moving back (mid-shin height) so lower back never rounds.',
      cueAr: 'توقف عن النزول بمجرد توقف حركة الورك للخلف لتفادي تقوس أسفل الظهر.'
    },
    {
      phase: 'concentric',
      labelEn: 'Hip Drive Lockout',
      labelAr: 'دفع الورك للأمام للاستقامة',
      cueEn: 'Squeeze glutes and hamstrings to snap hips forward into tall standing—without leaning back.',
      cueAr: 'اشدد الأرداف والفخذ الخلفي لدفع الورك للأمام حتى الوقوف المستقيم دون إمالة الظهر للخلف.'
    },
  ],
  lunge: [
    {
      phase: 'setup',
      labelEn: 'Split Tripod Stance',
      labelAr: 'وقفة متباعدة متزنة',
      cueEn: 'Keep front heel glued down and torso subtly leaned ~10–15° over front mid-foot.',
      cueAr: 'ثبّت كعب القدم الأمامية تماماً مع ميل طفيف للجذع للأمام للحفاظ على التوازن.'
    },
    {
      phase: 'eccentric',
      labelEn: 'Vertical Drop Toward Rear Knee',
      labelAr: 'نزول عمودي للأسفل',
      cueEn: 'Lower straight down until front thigh reaches parallel or slight glute stretch below.',
      cueAr: 'انزل باستقامة للأسفل حتى يتوازى الفخذ الأمامي مع الأرض.'
    },
    {
      phase: 'isometric',
      labelEn: 'Balanced Bottom Pause',
      labelAr: 'توازن خفيف في القاع',
      cueEn: 'Maintain front-foot pressure across heel and forefoot without knee caving inward.',
      cueAr: 'حافظ على ثبات الركبة الأمامية دون انحرافها للداخل.'
    },
    {
      phase: 'concentric',
      labelEn: 'Front-Leg Drive Upward',
      labelAr: 'دفع الساق الأمامية للأعلى',
      cueEn: 'Drive forcefully through the entire front foot avoiding pushing primarily off the rear toes.',
      cueAr: 'ادفع بقوة عبر القدم الأمامية دون الاعتماد على الساق الخلفية.'
    },
  ],
  leg_extension: [
    {
      phase: 'setup',
      labelEn: 'Knee Pivot Alignment',
      labelAr: 'محاذاة محور الركبة مع الجهاز',
      cueEn: 'Align knee joint with machine pivot cam and anchor shin pad just above ankle crease.',
      cueAr: 'طابق مفصل الركبة مع نقطة ارتكاز الجهاز وضع الوسادة فوق الكاحل مباشرة.'
    },
    {
      phase: 'concentric',
      labelEn: 'Smooth Quad Lockout',
      labelAr: 'فرد الركبة وانقباض الفخذ الأمامي',
      cueEn: 'Drive shins upward cleanly until knees straighten fully without lifting hips off seat.',
      cueAr: 'ارفع الساقين بسلاسة حتى استقامة الركبتين دون ارتفاع الحوض عن المقعد.'
    },
    {
      phase: 'isometric',
      labelEn: 'Peak Quadriceps Squeeze',
      labelAr: 'ثبات ثانية في القمة',
      cueEn: 'Hold full lockout 0.5–1s squeezing rectus femoris and vastus muscles tightly.',
      cueAr: 'ثبّت ثانية في الأعلى لعصر عضلات الفخذ الأمامية.'
    },
    {
      phase: 'eccentric',
      labelEn: 'Slow Flexion Return',
      labelAr: 'النزول ببطء وتحكم',
      cueEn: 'Lower under 2–3s control right before stack touches down.',
      cueAr: 'أنزل بتحكم 2–3 ثوانٍ دون ترك الأوزان تصطدم ببعضها.'
    },
  ],
  leg_curl: [
    {
      phase: 'setup',
      labelEn: 'Anchored Pelvis & Ankle Pad',
      labelAr: 'تثبيت الحوض ووسادة الكاحل',
      cueEn: 'Press hips flat against pad (or strap down seated) so lower back does not arch.',
      cueAr: 'ألصق الحوض بالمقعد تماماً واضبط الوسادة خلف الكاحلين أسفل السمانة.'
    },
    {
      phase: 'concentric',
      labelEn: 'Drive Heels to Glutes',
      labelAr: 'سحب الكعبين نحو الأرداف',
      cueEn: 'Curl ankles forcefully toward glutes keeping feet neutral or lightly dorsiflexed.',
      cueAr: 'اسحب الكعبين بقوة نحو الأرداف دون رفع الحوض عن المقعد.'
    },
    {
      phase: 'isometric',
      labelEn: 'Hamstring Peak Hold',
      labelAr: 'ثبات انقباض الفخذ الخلفي',
      cueEn: 'Hold tightly at peak knee flexion before lowering.',
      cueAr: 'ثبّت لحظة عند أقصى انقباض للعضلة الخلفية.'
    },
    {
      phase: 'eccentric',
      labelEn: 'Full Controlled Extension',
      labelAr: 'فرد بطيء لإطالة الخلفي',
      cueEn: 'Extend knees slowly over 2–3s stopping just shy of hyperextension.',
      cueAr: 'افرد الساقين ببطء على مدى 2–3 ثوانٍ لإطالة الفخذ الخلفي بالكامل.'
    },
  ],
  calf_raise: [
    {
      phase: 'setup',
      labelEn: 'Ball-of-Foot Anchor',
      labelAr: 'تثبيت أمشاط القدم على الحافة',
      cueEn: 'Place big-toe and little-toe metatarsal heads solidly on block; keep ankles tracking straight.',
      cueAr: 'ضع مقدمة القدمين بثبات على الحافة مع استقامة الكاحلين.'
    },
    {
      phase: 'eccentric',
      labelEn: 'Deep Heel Drop & 1–2s Pause',
      labelAr: 'نزول كامل وتوقف 1–2 ث للامتداد',
      cueEn: 'Drop heels to deep dorsiflexion and pause briefly to kill elastic Achilles bounce.',
      cueAr: 'اخفض الكعبين لأقصى تمدد وتوقف ثانية لإلغاء الارتداد الوترِي.'
    },
    {
      phase: 'concentric',
      labelEn: 'High Plantar-Flexion Drive',
      labelAr: 'دفع عالٍ على الأمشاط',
      cueEn: 'Drive straight upward onto big toe ball cleanly as high as ankle mobility permits.',
      cueAr: 'اصعد بأقصى ارتفاع ممكن على أمشاط القدمين.'
    },
    {
      phase: 'isometric',
      labelEn: '1s Top Calf Squeeze',
      labelAr: 'ثبات ثانية في القمة',
      cueEn: 'Squeeze gastrocnemius/soleus hard at top before next slow descent.',
      cueAr: 'اعصر السمانة ثانية واحدة في القمة قبل النزول البطيء.'
    },
  ],
  core_flexion: [
    {
      phase: 'setup',
      labelEn: 'Posterior Pelvic Tilt',
      labelAr: 'تثبيت الحوض والقفص الصدري',
      cueEn: 'Engage abs gently before moving so spinal/pelvic motion comes from rectus abdominis rather than hip flexors.',
      cueAr: 'شد البطن أولاً لتكون الحركة من تقريب القفص الصدري للحوض وليس من مفصل الورك فقط.'
    },
    {
      phase: 'concentric',
      labelEn: 'Ribs-to-Pelvis Crunch',
      labelAr: 'تقريب الأضلاع نحو الحوض',
      cueEn: 'Exhale while curling ribs toward pelvis or tucking pelvis upward smoothly.',
      cueAr: 'ازفر مع تقويس العمود الفقري الصدري لتقريب الضلوع من الحوض.'
    },
    {
      phase: 'isometric',
      labelEn: 'Abdominal Peak Hold',
      labelAr: 'ثبات الانقباض الأقصى',
      cueEn: 'Hold tight abdominal tension for 1s without pulling on the neck.',
      cueAr: 'ثبّت الانقباض لثانية واحدة دون شد الرقبة أو الذراعين.'
    },
    {
      phase: 'eccentric',
      labelEn: 'Controlled Uncurl',
      labelAr: 'العودة البطيئة بتحكم',
      cueEn: 'Unfurl smoothly maintaining steady core tension throughout.',
      cueAr: 'عد ببطء مع إبقاء عضلات البطن مشدودة طوال المدى.'
    },
  ],
};

export const EXERCISE_COMPARISONS: Record<string, ExerciseComparison[]> = {
  chest_press_family: [
    {
      otherExerciseId: 'incline-barbell-press',
      otherNameEn: 'Incline Barbell Press',
      otherNameAr: 'ضغط الصدر المائل بالبار (الصدر العلوي)',
      mechanicalDiffEn: 'Flat press shifts peak tension across mid-sternal fibers and permits heavier absolute loading, whereas 30–45° incline elevates shoulder flexion to bias the clavicular (upper) pec and anterior deltoid.',
      mechanicalDiffAr: 'الضغط المستوي يركّز على ألياف منتصف الصدر ويسمح بأوزان أكبر، بينما ينقل الميلان 30–45° التركيز للألياف العلوية للصدر والكتف الأمامي.',
      practicalChoiceEn: 'Use Flat for primary pressing strength; include Incline to ensure balanced upper-chest fullness.',
      practicalChoiceAr: 'استخدم المستوي لقوة الدفع الأساسية والمائل لبناء امتلاء أعلى الصدر.'
    },
    {
      otherExerciseId: 'dumbbell-bench-press',
      otherNameEn: 'Dumbbell Flat Bench Press',
      otherNameAr: 'ضغط الصدر المستوي بالدامبل',
      mechanicalDiffEn: 'Barbell tracks fixed bilateral load efficiently for progressive strength milestones; dumbbells grant independent arm motion, deeper bottom stretch, and joint-friendly wrist rotation.',
      mechanicalDiffAr: 'البار ممتاز للتدرج الرقمي بالقوة وبأقل متطلبات توازن؛ بينما يمنح الدامبل مدى تمدد أعمق وحرية لمفصل الكتف والمعصم.',
      practicalChoiceEn: 'Barbell for heavy 3–8 rep progression; Dumbbells when shoulders crave customizable paths or deeper hypertrophy ROM.',
      practicalChoiceAr: 'البار لتطور القوة الثقيلة، والدامبل للراحة المفصلية والتضخيم بمدى أعمق.'
    },
  ],
  row_family: [
    {
      otherExerciseId: 'seated-cable-row',
      otherNameEn: 'Seated Cable Row',
      otherNameAr: 'التجديف الأرضي بالكابل جالساً',
      mechanicalDiffEn: 'Barbell rows require free-weight isometric hip-hinge bracing across spinal erectors and hamstrings; seated cable rows remove lower-back fatigue to isolate mid-back retraction cleanly.',
      mechanicalDiffAr: 'تجديف البار يحمّل منتصف الظهر مع مجهود إضافي لأسفل الظهر والمثبتات؛ بينما يعزل الكابل منتصف الظهر والعضلة العريضة دون إجهاد أسفل الظهر.',
      practicalChoiceEn: 'Pick Barbell Row early for systemic back thickness; pick Seated Cable Row after heavy deadlifts/squats when lower back is fatigued.',
      practicalChoiceAr: 'استخدم البار لبناء السماكة الكلية، والكابل بعد تمارين الأرجل لتفادي إرهاق أسفل الظهر.'
    },
  ],
  vertical_pull_family: [
    {
      otherExerciseId: 'lat-pulldown',
      otherNameEn: 'Wide-Grip Lat Pulldown',
      otherNameAr: 'السحب العالي للظهر أمام الصدر بالكابل',
      mechanicalDiffEn: 'Closed-chain vertical bodyweight pull-ups demand higher total core tension; open-chain lat pulldowns let any lifter scale weight precisely in small increments.',
      mechanicalDiffAr: 'العقلة تمرين بوزن الجسم يتطلب ثبات جذع أعلى، بينما يسهّل جهاز السحب العالي بالكابل ضبط الأوزان بدقة لكل المستويات.',
      practicalChoiceEn: 'Use Pull-Ups for athletic relative strength; use Lat Pulldown for controlled hypertrophy or higher-rep finishing sets.',
      practicalChoiceAr: 'العقلة للقوة النسبية واللياقة، والسحب العالي بالكابل للتحكم الدقيق والتكرارات المتوسطة.'
    },
  ],
  hinge_family: [
    {
      otherExerciseId: 'romanian-deadlift',
      otherNameEn: 'Barbell Romanian Deadlift (RDL)',
      otherNameAr: 'الرفعة المميتة الرومانية بالبار للفخذ الخلفي',
      mechanicalDiffEn: 'Conventional deadlift pulls from a dead floor stop with greater knee flexion; RDL starts standing and focuses pure hip-hinge eccentric stretch onto hamstrings and glutes.',
      mechanicalDiffAr: 'الرفعة المميتة التقليدية تبدأ من الأرض بانثناء أكبر للركبتين وتطور قوة السحب الكاملة؛ بينما تركز الرفعة الرومانية الإطالة الشديدة على الفخذ الخلفي والأرداف.',
      practicalChoiceEn: 'Conventional for maximal total-body strength; RDL for targeted hamstring/glute hypertrophy with lower systemic CNS fatigue.',
      practicalChoiceAr: 'التقليدية للقوة الشاملة القصوى، والرومانية لتضخيم الفخذ الخلفي بإجهاد عصبي أقل.'
    },
  ],
  squat_family: [
    {
      otherExerciseId: 'leg-press-machine',
      otherNameEn: '45-Degree Leg Press',
      otherNameAr: 'دفع الأرجل المائل على الجهاز',
      mechanicalDiffEn: 'Back Squat imposes axial spinal load and high core demand; Leg Press places the torso on a supported sled track to push quads safely near failure without spinal fatigue.',
      mechanicalDiffAr: 'القرفصاء الحرة تحمّل العمود الفقري والجذع بالكامل؛ بينما يثبّت جهاز دفع الأرجل الظهر على المسند لتوجيه المقاومة بأمان نحو الفخذ الأمامي.',
      practicalChoiceEn: 'Anchor leg day with Back or Front Squat, then accumulate clean quad volume with Leg Press.',
      practicalChoiceAr: 'ابدأ يوم الأرجل بالقرفصاء الحرة ثم أكمل حجم التمرين للفخذ الأمامي على جهاز دفع الأرجل.'
    },
  ],
  bicep_family: [
    {
      otherExerciseId: 'hammer-curl',
      otherNameEn: 'Dumbbell Hammer Curl',
      otherNameAr: 'تمرين المطرقة بالدامبل للبايسبس والساعد',
      mechanicalDiffEn: 'Supinated barbell curls maximize biceps brachii flexion/supination leverage; neutral-grip Hammer Curls shift greater mechanical demand to the brachialis and brachioradialis.',
      mechanicalDiffAr: 'البار المستقيم يفعّل البايسبس بقبضة سفلية كلاسيكية؛ بينما ينقل تمرين المطرقة بقبضته المتقابلة جهداً أكبر إلى الساعد والعضلة العضدية العميقة.',
      practicalChoiceEn: 'Pair 1 supinated curl (Barbell or Incline) with 1 neutral Hammer Curl for complete upper-arm thickness.',
      practicalChoiceAr: 'ادمج تمرين ثني للبايسبس بقبضة سفلية مع تمرين المطرقة لتطوير الذراع والساعد معاً.'
    },
  ],
  tricep_family: [
    {
      otherExerciseId: 'overhead-cable-tricep-extension',
      otherNameEn: 'Overhead Cable Triceps Extension',
      otherNameAr: 'مد الترايسبس بالحبل فوق الرأس بالكابل',
      mechanicalDiffEn: 'Neutral-shoulder pushdowns emphasize lateral and medial heads comfortably; overhead extensions flex the shoulder joint to stretch the biarticular long head.',
      mechanicalDiffAr: 'الدفع للأسفل يركز على الرأسين الجانبي والإنسي براحة مرفقية عالية؛ بينما يمد التمرين العلوي الرأس الطويل عبر مفصل الكتف لتحقيق أقصى إطالة.',
      practicalChoiceEn: 'Combine both patterns weekly for full horseshoe development while preserving elbow comfort.',
      practicalChoiceAr: 'اجمع بين الدفع للأسفل والمد فوق الرأس أسبوعياً لتطوير جميع رؤوس الترايسبس.'
    },
  ],
  calf_family: [
    {
      otherExerciseId: 'seated-calf-raise',
      otherNameEn: 'Seated Calf Raise Machine',
      otherNameAr: 'رفع السمانة جالساً على الجهاز',
      mechanicalDiffEn: 'Extended-knee standing raises stretch and recruit both gastrocnemius heads heavily; bending knees 90° while seated puts gastrocnemius in slack to target the deeper soleus.',
      mechanicalDiffAr: 'التمرين وقوفاً بركبة مفرودة يفعّل عضلة السمانة الكبرى بقوة؛ بينما ينقل التمرين جالساً بثني الركبة الحمل إلى الجزء العميق من السمانة.',
      practicalChoiceEn: 'Prioritize straight-leg calf work for overall calf size, and add seated raises for lower-calf width and ankle strength.',
      practicalChoiceAr: 'أعطِ الأولوية للسمانة وقوفاً لحجم السمانة العام، وأضف التمرين جالساً لتقوية الجزء العميق وأسفل الساق.'
    },
  ],
};

const PATTERN_BY_ID: Record<string, Partial<ExerciseBiomechanicsMeta>> = {
  'barbell-bench-press': {
    movementPattern: 'bench_press',
    stabilizerMuscles: ['abdominals', 'forearms', 'back'],
    techniqueSummaryEn: 'Horizontal barbell press emphasizing mechanical tension across the sternal pectoralis major while maintaining scapular depression and leg drive.',
    techniqueSummaryAr: 'دفع أفقي بالبار يركز على التوتر الميكانيكي لعضلة الصدر الكبرى مع تثبيت لوحي الكتف ودفع القدمين بالأرض.',
    gripStanceEn: 'Overhand grip ~1.5x shoulder width; thumbs wrapped securely; feet planted solidly behind knees.',
    gripStanceAr: 'قبضة علوية أعرض قليلاً من الكتفين مع لف الإبهامين بإحكام وتثبيت القدمين بالأرض.',
    easierAlternativeIds: ['chest-press-machine', 'push-ups'],
    harderAlternativeIds: ['incline-barbell-press', 'dumbbell-bench-press'],
    variationsEn: ['Paused Bench Press', 'Close-Grip Bench Press', 'Dumbbell Flat Press'],
    variationsAr: ['ضغط الصدر المستوي مع توقف سفلي', 'ضغط الصدر بقبضة ضيقة', 'ضغط الصدر المستوي بالدامبل'],
    comparisons: EXERCISE_COMPARISONS.chest_press_family,
  },
  'dumbbell-bench-press': {
    movementPattern: 'bench_press',
    stabilizerMuscles: ['abdominals', 'forearms', 'back'],
    techniqueSummaryEn: 'Unilateral-path dumbbell flat press permitting customized wrist angles and deeper chest stretch at bottom turnaround.',
    techniqueSummaryAr: 'دفع أفقي بالدامبل يمنح كل ذراع مساراً مستقلاً ومدى تمدد أعمق في الصدر مع راحة لمفصل الكتف.',
    gripStanceEn: 'Pronated or slightly angled (~30° neutral-tilted) grip directly over mid-chest.',
    gripStanceAr: 'قبضة علوية أو مائلة قليلاً (30 درجة للداخل) لحماية الكتف فوق منتصف الصدر.',
    easierAlternativeIds: ['chest-press-machine', 'push-ups'],
    harderAlternativeIds: ['barbell-bench-press', 'incline-dumbbell-press'],
    comparisons: EXERCISE_COMPARISONS.chest_press_family,
  },
  'incline-barbell-press': {
    movementPattern: 'incline_press',
    stabilizerMuscles: ['abdominals', 'forearms', 'back'],
    techniqueSummaryEn: 'Inclined barbell press loading clavicular pectoralis fibers and anterior deltoids through strict shoulder-blade stability.',
    techniqueSummaryAr: 'دفع مائل بالبار يستهدف الصدر العلوي والكتف الأمامي بثبات عالٍ للوح الكتف.',
    gripStanceEn: 'Medium-wide overhand grip aligned vertically over upper sternum on a 30–45° incline.',
    gripStanceAr: 'قبضة متوسطة واسعة فوق أعلى الصدر على مقعد مائل بزاوية 30 إلى 45 درجة.',
    easierAlternativeIds: ['incline-dumbbell-press', 'smith-bench-press'],
    harderAlternativeIds: ['barbell-bench-press', 'overhead-barbell-press'],
    comparisons: EXERCISE_COMPARISONS.chest_press_family,
  },
  'incline-dumbbell-press': {
    movementPattern: 'incline_press',
    stabilizerMuscles: ['abdominals', 'forearms'],
    techniqueSummaryEn: '30–45° inclined press prioritizing the clavicular (upper) head of the pectoralis major with independent shoulder path freedom.',
    techniqueSummaryAr: 'دفع مائل بزاوية 30–45 درجة يستهدف الألياف العلوية للصدر مع حرية حركة طبيعية لمفصل الكتف.',
    gripStanceEn: '30°–45° incline bench; palms angled subtly inward rather than locked straight across.',
    gripStanceAr: 'مقعد مائل 30–45° مع إمالة طفيفة للراحتين للداخل وتثبيت القدمين.',
    easierAlternativeIds: ['push-ups', 'chest-press-machine'],
    harderAlternativeIds: ['incline-barbell-press'],
    variationsEn: ['Incline Barbell Press', 'Low-Incline Neutral-Grip Press'],
    variationsAr: ['ضغط الصدر المائل بالبار', 'ضغط الصدر المائل بقبضة متقابلة'],
    comparisons: EXERCISE_COMPARISONS.chest_press_family,
  },
  'cable-chest-fly': {
    movementPattern: 'chest_fly',
    stabilizerMuscles: ['abdominals', 'biceps'],
    techniqueSummaryEn: 'Constant-tension horizontal adduction arc isolating the pectorals at both peak stretch and full midline contraction.',
    techniqueSummaryAr: 'تقريب أفقي بتوتر مستمر عبر الكابل لعزل عضلة الصدر في أقصى تمدد وأقصى انقباض.',
    gripStanceEn: 'Staggered split stance one step ahead of pulleys; neutral palms with soft 15° elbow bend.',
    gripStanceAr: 'وقفة متقدمة بخطوة أمام جهاز الكابل مع ثني طفيف ثابت في المرفقين.',
    easierAlternativeIds: ['pec-deck-machine'],
    harderAlternativeIds: ['dumbbell-bench-press'],
    variationsEn: ['High-to-Low Cable Fly', 'Low-to-High Cable Fly', 'Pec Deck Machine Fly'],
    variationsAr: ['تفتيح كابل من أعلى لأسفل', 'تفتيح كابل من أسفل لأعلى', 'تفتيح على جهاز الفراشة'],
  },
  'pec-deck-machine': {
    movementPattern: 'chest_fly',
    stabilizerMuscles: ['abdominals'],
    techniqueSummaryEn: 'Guided machine chest fly stabilizing the torso so mental focus remains squarely on sternal pectoral contraction.',
    techniqueSummaryAr: 'تفتيح موجه على الجهاز يعزل عضلة الصدر بتركيز عالٍ دون الحاجة لتوازن الجذع.',
    easierAlternativeIds: ['chest-press-machine'],
    harderAlternativeIds: ['cable-chest-fly', 'dumbbell-bench-press'],
  },
  'chest-dips': {
    movementPattern: 'bench_press',
    stabilizerMuscles: ['abdominals', 'back', 'forearms'],
    techniqueSummaryEn: 'Closed-chain dipping press combining forward torso lean (~25°) for lower sternal pec emphasis alongside heavy triceps engagement.',
    techniqueSummaryAr: 'تمرين غطس مغلق بوزن الجسم مع ميل الجذع للأمام لتحميل الصدر السفلي والترايسبس بقوة.',
    gripStanceEn: 'Shoulder-width or slightly wider parallel bars; lean torso ~25° forward with legs softly tucked back.',
    gripStanceAr: 'قبضة بعرض الكتفين أو أعرض قليلاً على المتوازي مع إمالة الجذع للأمام 25° تقريباً.',
    easierAlternativeIds: ['bench-dips', 'push-ups'],
    harderAlternativeIds: ['barbell-bench-press'],
  },
  'smith-bench-press': {
    movementPattern: 'bench_press',
    stabilizerMuscles: ['abdominals'],
    easierAlternativeIds: ['chest-press-machine'],
    harderAlternativeIds: ['barbell-bench-press'],
    variationsEn: ['Incline Smith Press', 'Tempo Smith Press'],
    variationsAr: ['ضغط الصدر المائل على جهاز السميث', 'ضغط السميث بإيقاع بطيء'],
  },
  'chest-press-machine': {
    movementPattern: 'bench_press',
    stabilizerMuscles: ['abdominals'],
    easierAlternativeIds: ['resistance-band-chest-press'],
    harderAlternativeIds: ['dumbbell-bench-press', 'barbell-bench-press'],
  },
  'push-ups': {
    movementPattern: 'bench_press',
    stabilizerMuscles: ['abdominals', 'glutes', 'quadriceps'],
    easierAlternativeIds: ['resistance-band-chest-press'],
    harderAlternativeIds: ['chest-dips', 'dumbbell-bench-press'],
    variationsEn: ['Incline Push-Up', 'Deficit Push-Up', 'Weighted Push-Up'],
    variationsAr: ['ضغط مائل للمبتدئين', 'ضغط بمدى حركي عميق', 'ضغط بأوزان إضافية'],
  },
  'resistance-band-chest-press': {
    movementPattern: 'bench_press',
    stabilizerMuscles: ['abdominals', 'shoulders'],
    easierAlternativeIds: [],
    harderAlternativeIds: ['push-ups', 'dumbbell-bench-press'],
  },
  'barbell-bent-over-row': {
    movementPattern: 'row',
    stabilizerMuscles: ['abdominals', 'hamstrings', 'glutes'],
    techniqueSummaryEn: 'Hip-hinged horizontal pull demanding isometric spinal bracing while driving elbows back to overload mid-back thickness and lats.',
    techniqueSummaryAr: 'سحب أفقي من وضع الانحناء يتطلب ثباتاً قوياً للجذع والورك لتقوية منتصف الظهر والعضلة الظهرية العريضة.',
    gripStanceEn: 'Pronated grip slightly outside knee width; hinge ~35–45° over mid-foot balance.',
    gripStanceAr: 'قبضة علوية خارج الركبتين بقليل مع انحناء للجذع بنحو 35–45 درجة وثبات القدمين.',
    easierAlternativeIds: ['chest-supported-row-machine', 'seated-cable-row'],
    harderAlternativeIds: ['pendlay-row'],
    variationsEn: ['Pendlay Row', 'Underhand Barbell Row', 'Chest-Supported Row'],
    variationsAr: ['تجديف بندلاي الصارم من الأرض بالبار', 'التجديف بالبار بقبضة معكوسة', 'التجديف مع إسناد الصدر'],
    comparisons: EXERCISE_COMPARISONS.row_family,
  },
  'pendlay-row': {
    movementPattern: 'row',
    stabilizerMuscles: ['abdominals', 'hamstrings', 'glutes'],
    techniqueSummaryEn: 'Strict dead-stop barbell row parallel to floor building explosive mid-back & posterior power without momentum heave.',
    techniqueSummaryAr: 'تجديف صارم يبدأ من توقف تام للبار على الأرض في كل تكرار لبناء قوة السحب دون أرجحة.',
    gripStanceEn: 'Overhand shoulder-width grip; torso ~80–90° parallel to floor over mid-foot.',
    gripStanceAr: 'قبضة علوية بعرض الكتفين مع انحناء شبه موازٍ للأرض وثبات أسفل الظهر.',
    easierAlternativeIds: ['barbell-bent-over-row', 'seated-cable-row'],
    harderAlternativeIds: ['conventional-deadlift'],
    comparisons: EXERCISE_COMPARISONS.row_family,
  },
  'lat-pulldown': {
    movementPattern: 'pulldown',
    stabilizerMuscles: ['abdominals', 'forearms'],
    techniqueSummaryEn: 'Vertical pull depressing the scapula and driving the elbows toward the hips to maximize latissimus dorsi width.',
    techniqueSummaryAr: 'سحب عمودي لخفض لوحي الكتف ودفع المرفقين نحو الحوض لتطوير عرض الظهر.',
    gripStanceEn: 'Overhand grip ~1.3x shoulder width; thigh pad snugged tight over knees.',
    gripStanceAr: 'قبضة علوية أعرض من الكتفين مع تثبيت وسادة الفخذين بإحكام.',
    easierAlternativeIds: ['resistance-band-row'],
    harderAlternativeIds: ['chin-ups', 'pull-ups'],
    variationsEn: ['Neutral-Grip Pulldown', 'Single-Arm Cable Pulldown', 'Assisted Pull-Up'],
    variationsAr: ['سحب بقبضة متقابلة', 'سحب بذراع واحدة', 'عقلة بمساعدة'],
    comparisons: EXERCISE_COMPARISONS.vertical_pull_family,
  },
  'seated-cable-row': {
    movementPattern: 'row',
    stabilizerMuscles: ['abdominals', 'hamstrings'],
    easierAlternativeIds: ['chest-supported-row-machine', 'resistance-band-row'],
    harderAlternativeIds: ['barbell-bent-over-row'],
    comparisons: EXERCISE_COMPARISONS.row_family,
  },
  'single-arm-dumbbell-row': {
    movementPattern: 'row',
    stabilizerMuscles: ['abdominals', 'glutes', 'forearms'],
    easierAlternativeIds: ['chest-supported-row-machine'],
    harderAlternativeIds: ['barbell-bent-over-row'],
  },
  'pull-ups': {
    movementPattern: 'pulldown',
    stabilizerMuscles: ['abdominals', 'glutes', 'forearms'],
    techniqueSummaryEn: 'Closed-chain overhead vertical pull requiring coordinated scapular depression, lat drive, and full core bracing.',
    techniqueSummaryAr: 'تمرين سحب عمودي متكامل بوزن الجسم يبني عرض الظهر وقوة القبضة والجذع معاً.',
    easierAlternativeIds: ['lat-pulldown', 'chin-ups'],
    harderAlternativeIds: ['pendlay-row'],
    variationsEn: ['Chin-Up (Supinated)', 'Weighted Pull-Up', 'Band-Assisted Pull-Up'],
    variationsAr: ['العقلة بقبضة معكوسة', 'العقلة بأوزان إضافية', 'العقلة بمساعدة حبل المقاومة'],
    comparisons: EXERCISE_COMPARISONS.vertical_pull_family,
  },
  'chin-ups': {
    movementPattern: 'pulldown',
    stabilizerMuscles: ['abdominals', 'glutes', 'forearms'],
    techniqueSummaryEn: 'Supinated shoulder-width vertical pull placing biceps in strong mechanical leverage alongside lower lats.',
    techniqueSummaryAr: 'عقلة بقبضة معكوسة تضع البايسبس وعضلات الظهر العريض في أفضل وضع ميكانيكي للقوة.',
    gripStanceEn: 'Underhand (supinated) grip at shoulder width.',
    gripStanceAr: 'قبضة معكوسة بعرض الكتفين.',
    easierAlternativeIds: ['lat-pulldown'],
    harderAlternativeIds: ['pull-ups'],
    comparisons: EXERCISE_COMPARISONS.vertical_pull_family,
  },
  'chest-supported-row-machine': {
    movementPattern: 'row',
    stabilizerMuscles: ['abdominals'],
    easierAlternativeIds: ['resistance-band-row'],
    harderAlternativeIds: ['barbell-bent-over-row', 'pendlay-row'],
  },
  'resistance-band-row': {
    movementPattern: 'row',
    stabilizerMuscles: ['abdominals'],
    easierAlternativeIds: [],
    harderAlternativeIds: ['seated-cable-row', 'single-arm-dumbbell-row'],
  },
  'overhead-barbell-press': {
    movementPattern: 'overhead_press',
    stabilizerMuscles: ['abdominals', 'glutes', 'back'],
    techniqueSummaryEn: 'Standing vertical barbell press locking ribcage over pelvis to build anterior/medial deltoid strength and overhead stability.',
    techniqueSummaryAr: 'دفع عمودي بالبار وقوفاً مع ثبات الجذع والأرداف لبناء قوة الأكتاف وثبات الضغط فوق الرأس.',
    gripStanceEn: 'Just outside shoulders with forearms vertical from front & side; feet hip-width.',
    gripStanceAr: 'قبضة خارج الكتفين قليلاً مع ساعدين عموديين تماماً وقدمين بعرض الورك.',
    easierAlternativeIds: ['seated-dumbbell-shoulder-press', 'smith-overhead-press'],
    harderAlternativeIds: [],
    variationsEn: ['Seated Barbell Press', 'Dumbbell Overhead Press', 'Push Press'],
    variationsAr: ['ضغط الأكتاف بالبار جالساً', 'ضغط الأكتاف بالدامبل فوق الرأس', 'الدفع السريع للأكتاف بالبار'],
  },
  'seated-dumbbell-shoulder-press': {
    movementPattern: 'overhead_press',
    stabilizerMuscles: ['abdominals', 'back'],
    easierAlternativeIds: ['smith-overhead-press'],
    harderAlternativeIds: ['overhead-barbell-press'],
  },
  'dumbbell-lateral-raise': {
    movementPattern: 'lateral_raise',
    stabilizerMuscles: ['abdominals', 'forearms'],
    techniqueSummaryEn: 'Scapular-plane shoulder abduction isolating the lateral deltoid while minimizing upper trapezius elevation.',
    techniqueSummaryAr: 'رفع جانبي في مستوى لوح الكتف لعزل الكتف الجانبي وتقليل مشاركة الترابيس العلوي.',
    easierAlternativeIds: ['machine-lateral-raise'],
    harderAlternativeIds: ['cable-lateral-raise'],
    variationsEn: ['Cable Lateral Raise', 'Leaning Single-Arm Lateral Raise'],
    variationsAr: ['رفرفة جانبية بالكابل', 'رفرفة جانبية مائل بذراع واحدة'],
  },
  'cable-face-pull': {
    movementPattern: 'row',
    stabilizerMuscles: ['abdominals', 'forearms'],
    easierAlternativeIds: ['rear-delt-machine-fly'],
    harderAlternativeIds: ['barbell-bent-over-row'],
  },
  'cable-lateral-raise': {
    movementPattern: 'lateral_raise',
    stabilizerMuscles: ['abdominals', 'forearms'],
    easierAlternativeIds: ['machine-lateral-raise'],
    harderAlternativeIds: ['dumbbell-lateral-raise'],
  },
  'smith-overhead-press': {
    movementPattern: 'overhead_press',
    stabilizerMuscles: ['abdominals'],
    easierAlternativeIds: [],
    harderAlternativeIds: ['seated-dumbbell-shoulder-press', 'overhead-barbell-press'],
  },
  'machine-lateral-raise': {
    movementPattern: 'lateral_raise',
    stabilizerMuscles: ['abdominals'],
    easierAlternativeIds: [],
    harderAlternativeIds: ['dumbbell-lateral-raise', 'cable-lateral-raise'],
  },
  'rear-delt-machine-fly': {
    movementPattern: 'row',
    stabilizerMuscles: ['abdominals'],
    easierAlternativeIds: [],
    harderAlternativeIds: ['cable-face-pull'],
  },
  'barbell-bicep-curl': {
    movementPattern: 'bicep_curl',
    stabilizerMuscles: ['abdominals', 'shoulders'],
    easierAlternativeIds: ['machine-preacher-curl', 'cable-bicep-curl'],
    harderAlternativeIds: ['incline-dumbbell-curl', 'chin-ups'],
    comparisons: EXERCISE_COMPARISONS.bicep_family,
  },
  'incline-dumbbell-curl': {
    movementPattern: 'bicep_curl',
    stabilizerMuscles: ['shoulders', 'forearms'],
    easierAlternativeIds: ['cable-bicep-curl', 'machine-preacher-curl'],
    harderAlternativeIds: ['chin-ups'],
    comparisons: EXERCISE_COMPARISONS.bicep_family,
  },
  'hammer-curl': {
    movementPattern: 'bicep_curl',
    stabilizerMuscles: ['shoulders', 'abdominals'],
    easierAlternativeIds: ['cable-bicep-curl'],
    harderAlternativeIds: ['barbell-bicep-curl', 'chin-ups'],
    comparisons: EXERCISE_COMPARISONS.bicep_family,
  },
  'cable-bicep-curl': {
    movementPattern: 'bicep_curl',
    stabilizerMuscles: ['abdominals', 'forearms'],
    easierAlternativeIds: ['machine-preacher-curl'],
    harderAlternativeIds: ['barbell-bicep-curl', 'incline-dumbbell-curl'],
    comparisons: EXERCISE_COMPARISONS.bicep_family,
  },
  'machine-preacher-curl': {
    movementPattern: 'bicep_curl',
    stabilizerMuscles: ['forearms'],
    easierAlternativeIds: [],
    harderAlternativeIds: ['barbell-bicep-curl', 'incline-dumbbell-curl'],
    comparisons: EXERCISE_COMPARISONS.bicep_family,
  },
  'cable-tricep-pushdown': {
    movementPattern: 'tricep_extension',
    stabilizerMuscles: ['abdominals', 'shoulders'],
    easierAlternativeIds: ['bench-dips'],
    harderAlternativeIds: ['overhead-cable-tricep-extension', 'ez-bar-skullcrusher'],
    comparisons: EXERCISE_COMPARISONS.tricep_family,
  },
  'overhead-cable-tricep-extension': {
    movementPattern: 'tricep_extension',
    stabilizerMuscles: ['abdominals', 'shoulders'],
    easierAlternativeIds: ['cable-tricep-pushdown'],
    harderAlternativeIds: ['overhead-barbell-tricep-extension', 'ez-bar-skullcrusher'],
    comparisons: EXERCISE_COMPARISONS.tricep_family,
  },
  'overhead-barbell-tricep-extension': {
    movementPattern: 'tricep_extension',
    stabilizerMuscles: ['abdominals', 'shoulders', 'forearms'],
    easierAlternativeIds: ['overhead-cable-tricep-extension', 'cable-tricep-pushdown'],
    harderAlternativeIds: ['chest-dips'],
    comparisons: EXERCISE_COMPARISONS.tricep_family,
  },
  'ez-bar-skullcrusher': {
    movementPattern: 'tricep_extension',
    stabilizerMuscles: ['shoulders', 'forearms'],
    easierAlternativeIds: ['cable-tricep-pushdown'],
    harderAlternativeIds: ['overhead-barbell-tricep-extension', 'chest-dips'],
    comparisons: EXERCISE_COMPARISONS.tricep_family,
  },
  'dumbbell-tricep-kickback': {
    movementPattern: 'tricep_extension',
    stabilizerMuscles: ['back', 'abdominals'],
    easierAlternativeIds: ['cable-tricep-pushdown'],
    harderAlternativeIds: ['ez-bar-skullcrusher'],
  },
  'bench-dips': {
    movementPattern: 'tricep_extension',
    stabilizerMuscles: ['shoulders', 'abdominals'],
    easierAlternativeIds: ['cable-tricep-pushdown'],
    harderAlternativeIds: ['chest-dips'],
  },
  'barbell-wrist-curl': {
    movementPattern: 'bicep_curl',
    stabilizerMuscles: ['biceps'],
    easierAlternativeIds: ['reverse-dumbbell-wrist-curl'],
    harderAlternativeIds: ['hammer-curl'],
  },
  'reverse-dumbbell-wrist-curl': {
    movementPattern: 'bicep_curl',
    stabilizerMuscles: ['biceps'],
    easierAlternativeIds: [],
    harderAlternativeIds: ['barbell-wrist-curl', 'hammer-curl'],
  },
  'barbell-back-squat': {
    movementPattern: 'squat',
    stabilizerMuscles: ['abdominals', 'back', 'calves'],
    techniqueSummaryEn: 'Foundational knee-and-hip compound squat requiring intra-abdominal bracing and balanced mid-foot pressure throughout descent and ascent.',
    techniqueSummaryAr: 'تمرين القرفصاء الأساسي المركب للركبة والورك مع شد الجذع وتوزيع الوزن على منتصف القدم طوال الحركة.',
    gripStanceEn: 'Bar centered across upper traps (high-bar); stance roughly shoulder-width with toes turned out 15–30°.',
    gripStanceAr: 'البار على أعلى الترابيس مع وقفة بعرض الكتفين وإمالة خفيفة لأصابع القدم للخارج 15–30°.',
    easierAlternativeIds: ['dumbbell-goblet-squat', 'leg-press-machine', 'smith-squat'],
    harderAlternativeIds: ['barbell-front-squat'],
    variationsEn: ['Front Squat', 'High-Bar Pause Squat', 'Box Squat'],
    variationsAr: ['القرفصاء الأمامية بالبار', 'القرفصاء مع توقف سفلي', 'القرفصاء على الصندوق'],
    comparisons: EXERCISE_COMPARISONS.squat_family,
  },
  'barbell-front-squat': {
    movementPattern: 'squat',
    stabilizerMuscles: ['abdominals', 'back', 'calves'],
    techniqueSummaryEn: 'Anteriorly racked squat forcing upright torso mechanics and higher quadriceps & thoracic-extension demand.',
    techniqueSummaryAr: 'القرفصاء الأمامية بالبار؛ تحافظ على استقامة الجذع وتضع تركيزاً مضاعفاً على الفخذ الأمامي وثبات أعلى الظهر.',
    gripStanceEn: 'Clean-rack or crossed-arm shelf across front delts with elbows pointing high forward; shoulder-width stance.',
    gripStanceAr: 'إسناد البار على الكتفين الأماميين مع رفع المرفقين عالياً للأمام ووقفة بعرض الكتفين.',
    easierAlternativeIds: ['dumbbell-goblet-squat', 'leg-press-machine'],
    harderAlternativeIds: ['barbell-back-squat'],
    comparisons: EXERCISE_COMPARISONS.squat_family,
  },
  'leg-press-machine': {
    movementPattern: 'squat',
    stabilizerMuscles: ['abdominals', 'calves'],
    easierAlternativeIds: ['leg-extension-machine'],
    harderAlternativeIds: ['barbell-back-squat', 'barbell-front-squat'],
    comparisons: EXERCISE_COMPARISONS.squat_family,
  },
  'leg-extension-machine': {
    movementPattern: 'leg_extension',
    stabilizerMuscles: ['abdominals'],
    easierAlternativeIds: [],
    harderAlternativeIds: ['leg-press-machine', 'barbell-front-squat'],
  },
  'dumbbell-goblet-squat': {
    movementPattern: 'squat',
    stabilizerMuscles: ['abdominals', 'back', 'biceps'],
    easierAlternativeIds: ['leg-press-machine'],
    harderAlternativeIds: ['barbell-front-squat', 'barbell-back-squat'],
  },
  'smith-squat': {
    movementPattern: 'squat',
    stabilizerMuscles: ['abdominals', 'calves'],
    easierAlternativeIds: ['leg-press-machine'],
    harderAlternativeIds: ['barbell-back-squat'],
  },
  'conventional-deadlift': {
    movementPattern: 'hinge',
    stabilizerMuscles: ['abdominals', 'forearms', 'quadriceps'],
    techniqueSummaryEn: 'Full-body posterior-chain pull from a dead floor stop building maximal hip, hamstring, glute, and upper/lower back strength.',
    techniqueSummaryAr: 'الرفعة الأساسية من الأرض لبناء القوة القصوى للسلسلة الخلفية بالكامل والقبضة والجذع.',
    gripStanceEn: 'Feet hip-width with mid-foot under bar; grip just outside shins (double-overhand or mixed/hook for top sets).',
    gripStanceAr: 'وقفة بعرض الورك ومنتصف القدم تحت البار، وقبضة خارج الساقين مباشرة.',
    easierAlternativeIds: ['romanian-deadlift', 'dumbbell-rdl', 'barbell-hip-thrust'],
    harderAlternativeIds: [],
    comparisons: EXERCISE_COMPARISONS.hinge_family,
  },
  'romanian-deadlift': {
    movementPattern: 'hinge',
    stabilizerMuscles: ['abdominals', 'forearms', 'quadriceps'],
    techniqueSummaryEn: 'Pure hip-hinge keeping knees slightly unlocked while pushing hips straight back to load hamstrings and glutes under deep stretch.',
    techniqueSummaryAr: 'حركة مفصل الورك الأساسية بدفع الورك للخلف مع ثبات العمود الفقري لتحميل الفخذ الخلفي والأرداف عند أقصى تمدد.',
    gripStanceEn: 'Hip-width stance with soft ~15° knee unlock; hands overhand just outside thighs.',
    gripStanceAr: 'وقفة بعرض الورك مع ثني خفيف ثابت للركبتين وقبضة علوية خارج الفخذين.',
    easierAlternativeIds: ['dumbbell-rdl', 'lying-leg-curl'],
    harderAlternativeIds: ['conventional-deadlift'],
    variationsEn: ['Dumbbell RDL', 'B-Stance RDL', 'Conventional Deadlift'],
    variationsAr: ['الرفعة المميتة الرومانية بالدامبل', 'الرفعة المميتة الرومانية بقدم متقدمة', 'الرفعة المميتة التقليدية بالبار'],
    comparisons: EXERCISE_COMPARISONS.hinge_family,
  },
  'lying-leg-curl': {
    movementPattern: 'leg_curl',
    stabilizerMuscles: ['glutes', 'calves'],
    easierAlternativeIds: [],
    harderAlternativeIds: ['dumbbell-rdl', 'romanian-deadlift'],
  },
  'dumbbell-rdl': {
    movementPattern: 'hinge',
    stabilizerMuscles: ['abdominals', 'forearms'],
    easierAlternativeIds: ['lying-leg-curl'],
    harderAlternativeIds: ['romanian-deadlift', 'conventional-deadlift'],
  },
  'barbell-hip-thrust': {
    movementPattern: 'hinge',
    stabilizerMuscles: ['abdominals', 'quadriceps'],
    easierAlternativeIds: ['cable-glute-kickback'],
    harderAlternativeIds: ['romanian-deadlift', 'conventional-deadlift'],
  },
  'cable-glute-kickback': {
    movementPattern: 'hinge',
    stabilizerMuscles: ['abdominals', 'quadriceps'],
    easierAlternativeIds: [],
    harderAlternativeIds: ['barbell-hip-thrust', 'bodyweight-bulgarian-split-squat'],
  },
  'bodyweight-bulgarian-split-squat': {
    movementPattern: 'lunge',
    stabilizerMuscles: ['abdominals', 'calves', 'glutes'],
    easierAlternativeIds: ['leg-press-machine'],
    harderAlternativeIds: ['barbell-back-squat'],
  },
  'standing-calf-raise-machine': {
    movementPattern: 'calf_raise',
    stabilizerMuscles: ['abdominals', 'quadriceps'],
    easierAlternativeIds: ['seated-calf-raise'],
    harderAlternativeIds: ['smith-standing-calf-raise'],
    comparisons: EXERCISE_COMPARISONS.calf_family,
  },
  'seated-calf-raise': {
    movementPattern: 'calf_raise',
    stabilizerMuscles: ['quadriceps'],
    techniqueSummaryEn: 'Bent-knee plantar-flexion isolating the deep soleus muscle through full ankle dorsiflexion stretch and crisp pause.',
    techniqueSummaryAr: 'تمرين بركبة مثنية لعزل الجزء العميق من عضلة السمانة عبر إطالة كاملة للكاحل وتوقف متحكم به.',
    easierAlternativeIds: [],
    harderAlternativeIds: ['standing-calf-raise-machine'],
    comparisons: EXERCISE_COMPARISONS.calf_family,
  },
  'smith-standing-calf-raise': {
    movementPattern: 'calf_raise',
    stabilizerMuscles: ['abdominals', 'quadriceps'],
    easierAlternativeIds: ['seated-calf-raise', 'standing-calf-raise-machine'],
    harderAlternativeIds: [],
    comparisons: EXERCISE_COMPARISONS.calf_family,
  },
  'cable-crunch': {
    movementPattern: 'core_flexion',
    stabilizerMuscles: ['shoulders', 'quadriceps'],
    easierAlternativeIds: ['plank-hold'],
    harderAlternativeIds: ['hanging-leg-raise'],
  },
  'hanging-leg-raise': {
    movementPattern: 'core_flexion',
    stabilizerMuscles: ['forearms', 'shoulders', 'quadriceps'],
    easierAlternativeIds: ['cable-crunch', 'plank-hold'],
    harderAlternativeIds: [],
  },
  'plank-hold': {
    movementPattern: 'core_flexion',
    stabilizerMuscles: ['shoulders', 'glutes', 'quadriceps'],
    easierAlternativeIds: [],
    harderAlternativeIds: ['resistance-band-pallof-press', 'cable-crunch'],
  },
  'resistance-band-pallof-press': {
    movementPattern: 'core_flexion',
    stabilizerMuscles: ['abdominals', 'glutes', 'shoulders'],
    easierAlternativeIds: ['plank-hold'],
    harderAlternativeIds: ['hanging-leg-raise'],
  },
};

export function inferMovementPattern(ex: Pick<Exercise, 'id' | 'primaryMuscles' | 'movementPattern'>): MovementPattern {
  if (ex.movementPattern) return ex.movementPattern;
  const known = PATTERN_BY_ID[ex.id]?.movementPattern;
  if (known) return known;

  const p = ex.primaryMuscles[0];
  switch (p) {
    case 'chest':
      return 'bench_press';
    case 'back':
      return 'row';
    case 'shoulders':
      return 'overhead_press';
    case 'biceps':
    case 'forearms':
      return 'bicep_curl';
    case 'triceps':
      return 'tricep_extension';
    case 'quadriceps':
      return 'squat';
    case 'hamstrings':
    case 'glutes':
      return 'hinge';
    case 'calves':
      return 'calf_raise';
    case 'abdominals':
    default:
      return 'core_flexion';
  }
}

export function getExerciseBiomechanics(ex: Exercise): ExerciseBiomechanicsMeta {
  const mapped = PATTERN_BY_ID[ex.id];
  const pattern = ex.movementPattern || mapped?.movementPattern || inferMovementPattern(ex);

  const defaultStabilizers: MuscleGroup[] =
    ex.category === 'compound' ? ['abdominals', 'back'] : ['abdominals'];
  const rawStabilizers = ex.stabilizerMuscles?.length
    ? ex.stabilizerMuscles
    : mapped?.stabilizerMuscles ?? defaultStabilizers;

  const stabilizerMuscles = rawStabilizers.filter(
    (m) => !ex.primaryMuscles.includes(m) && !ex.secondaryMuscles.includes(m)
  );

  const defaultGripEn =
    ex.equipment === 'barbell'
      ? 'Shoulder-width or slightly wider grip; balanced mid-foot base and neutral wrists.'
      : ex.equipment === 'dumbbell'
        ? 'Neutral or natural angled grip matching comfortable joint line; stable foot base.'
        : 'Adjust seat/anchor height to match joint axis before initiating the set.';

  const defaultGripAr =
    ex.equipment === 'barbell'
      ? 'قبضة بعرض الكتفين أو أعرض قليلاً مع ثبات منتصف القدم واستقامة المعصمين.'
      : ex.equipment === 'dumbbell'
        ? 'قبضة مريحة متماشية مع زاوية الكتف والمرفق مع وقفة أو جلوس متزن.'
        : 'اضبط ارتفاع المقعد أو البكرة لمطابقة محور المفصل قبل بدء الجولة.';

  return {
    movementPattern: pattern,
    stabilizerMuscles: stabilizerMuscles.length > 0 ? stabilizerMuscles : rawStabilizers.slice(0, 2),
    techniqueSummaryEn:
      ex.techniqueSummaryEn ||
      mapped?.techniqueSummaryEn ||
      `Controlled ${ex.category} movement targeting ${ex.primaryMuscles.join(', ')} through a full, stable range of motion.`,
    techniqueSummaryAr:
      ex.techniqueSummaryAr ||
      mapped?.techniqueSummaryAr ||
      `حركة ${ex.category === 'compound' ? 'مركبة' : 'عزل'} متحكم بها تركز على العضلات المستهدفة بمدى حركي كامل وثبات مفصلي.`,
    gripStanceEn: ex.gripStanceEn || mapped?.gripStanceEn || defaultGripEn,
    gripStanceAr: ex.gripStanceAr || mapped?.gripStanceAr || defaultGripAr,
    phases: ex.phases?.length ? ex.phases : mapped?.phases || DEFAULT_PHASES_BY_PATTERN[pattern],
    easierAlternativeIds: ex.easierAlternativeIds?.length
      ? ex.easierAlternativeIds
      : mapped?.easierAlternativeIds ?? [],
    harderAlternativeIds: ex.harderAlternativeIds?.length
      ? ex.harderAlternativeIds
      : mapped?.harderAlternativeIds ?? [],
    variationsEn: ex.variationsEn?.length ? ex.variationsEn : mapped?.variationsEn ?? [],
    variationsAr: ex.variationsAr?.length ? ex.variationsAr : mapped?.variationsAr ?? [],
    comparisons: ex.comparisons?.length ? ex.comparisons : mapped?.comparisons ?? [],
  };
}
