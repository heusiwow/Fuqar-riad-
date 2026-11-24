import { Exercise, MovementPattern } from '../types/ironlog';

export type TrainingSchoolId = 'general' | 'modern' | 'old_school';

export interface ExerciseVideoAsset {
  src: string;
  fileName: string;
  durationSec?: number;
  titleEn: string;
  titleAr: string;
  school?: TrainingSchoolId;
}

export interface SchoolCueSummary {
  badgeEn: string;
  badgeAr: string;
  focusEn: string;
  focusAr: string;
  cuesEn: string[];
  cuesAr: string[];
}

/**
 * Built-in offline-cached exercise videos bundled in /public/assets/.
 * Additional school-specific or exercise-specific clips can be dropped into /public/assets/
 * and mapped here, or attached locally offline via IndexedDB in ExerciseVideoViewer.
 */
export const BUILTIN_EXERCISE_VIDEOS: Record<
  string,
  Partial<Record<TrainingSchoolId | 'default', ExerciseVideoAsset>>
> = {
  'barbell-bench-press': {
    default: {
      src: '/assets/aistudio/1795382374541_efaff05f.mp4',
      fileName: 'barbell-bench-press-apex.mp4',
      durationSec: 22,
      titleEn: 'Barbell Bench Press — Form & Common Mistakes',
      titleAr: 'البنش برس بالبار — الأداء الصحيح وتجنب الأخطاء',
    },
  },
};

const PATTERN_SCHOOL_CUES: Record<
  MovementPattern,
  Record<TrainingSchoolId, { focusEn: string; focusAr: string; cuesEn: string[]; cuesAr: string[] }>
> = {
  bench_press: {
    general: {
      focusEn: 'Scapular lock, ~45° elbow tuck, vertical forearms, full chest touch.',
      focusAr: 'تثبيت لوحي الكتف، مرفق ~45°، ساعدان عموديان، لمس الصدر بتحكم.',
      cuesEn: [
        'Pull shoulder blades down and back into the bench; plant feet firmly.',
        'Lower bar to mid-lower sternum with elbows ~45°—never flared 90°.',
        'Keep forearms vertical under the bar and press smoothly without bouncing.',
      ],
      cuesAr: [
        'اسحب لوحي الكتف للأسفل وللخلف على البنش وثبّت القدمين بالأرض.',
        'أنزل البار إلى منتصف/أسفل الصدر بمرفقين بزاوية ~45° لا 90°.',
        'حافظ على الساعدين عموديين تحت البار وادفع بثبات دون ارتداد.',
      ],
    },
    modern: {
      focusEn: 'Evidence-based tension: 2–3s controlled eccentric, deep pec stretch, 1–2 RIR.',
      focusAr: 'التحميل الميكانيكي الحديث: نزول بطيء 2–3 ثوانٍ، تمدد كامل للصدر، 1–2 RIR.',
      cuesEn: [
        'Control a 2–3s descent to maximize mechanical tension in the lengthened pec.',
        'Stack wrist–elbow–bar vertically; brief 0.5s chest pause kills momentum.',
        'Progress load or reps cleanly within 6–12 reps at RPE 8–9 (1–2 RIR).',
      ],
      cuesAr: [
        'تحكم بالنزول خلال 2–3 ثوانٍ لتعظيم الشد الميكانيكي في وضع الإطالة للصدر.',
        'طابق المعصم فوق المرفق عمودياً مع توقف خفيف يلغي الارتداد.',
        'تدرّج بالأوزان أو التكرارات ضمن نطاق 6–12 تكراراً بشدة RPE 8–9.',
      ],
    },
    old_school: {
      focusEn: 'Heavy compound base: tight arch, explosive chest drive, mind-muscle squeeze.',
      focusAr: 'الأساس الكلاسيكي: تقوّس ثابت، دفع قوي من الصدر، وتركيز ذهني عضلي عالٍ.',
      cuesEn: [
        'Anchor upper back hard, drive heels into the floor, and grip the bar tight.',
        'Lower deliberately to the chest line and drive up using the pectorals—not front delts.',
        'Build pyramid strength sets (8–10 → 6 → 4–6 reps) while logging every kilo.',
      ],
      cuesAr: [
        'ثبّت أعلى الظهر بقوة، اضغط بالكعبين على الأرض، واقبض البار بإحكام.',
        'انزل بتركيز إلى خط الصدر وادفع بعصر الصدر مع الحفاظ على ثبات الكتفين.',
        'اعتمد التدرج الهرمي في الجولات وسجّل كل زيادة وزن طويلة الأمد.',
      ],
    },
  },
  incline_press: {
    general: {
      focusEn: '30–45° bench angle, clavicular chest target, elbows ~45°.',
      focusAr: 'زاوية 30–45°، استهداف أعلى الصدر، مرفقان ~45°.',
      cuesEn: [
        'Set bench to 30–45° (avoid steep 60° which shifts load to front delts).',
        'Touch upper chest just below the collarbone with stacked forearms.',
        'Keep shoulder blades pinned down throughout every press.',
      ],
      cuesAr: [
        'اضبط الميلان 30–45° وتجنب الزوايا الحادة التي تنقل الحمل للكتف.',
        'أنزل الوزن لأعلى الصدر أسفل الترقوة مع بقاء الساعدين عموديين.',
        'حافظ على خفض وتثبيت لوحي الكتف طوال الدفع.',
      ],
    },
    modern: {
      focusEn: 'Clavicular fiber alignment at 30° incline with full bottom stretch.',
      focusAr: 'محاذاة ألياف الصدر العلوي على زاوية 30° مع أقصى تمدد سفلي.',
      cuesEn: [
        '30° incline optimizes upper-pec leverage over anterior deltoid takeover.',
        'Pause lightly at deep clavicular stretch before pressing cleanly upward.',
        'Track weekly total sets alongside flat pressing to manage shoulder fatigue.',
      ],
      cuesAr: [
        'ميلان 30° يحقق أفضل ذراع عزم لأعلى الصدر دون سيطرة الكتف الأمامي.',
        'توقف لحظة في التمدد السفلي العميق قبل الدفع بثبات.',
        'راقب حجم الجولات الأسبوعي مع تمارين الدفع الأخرى لحماية الكتف.',
      ],
    },
    old_school: {
      focusEn: 'Upper-chest shelf builder: deliberate reps and full-chest pump.',
      focusAr: 'بناء الصدر العلوي الكلاسيكي: تكرارات مركّزة وضخ دم كامل.',
      cuesEn: [
        'Lead with a high chest and keep ribs lifted as the weight descends.',
        'Squeeze the upper chest shelf together at the top without clanking weights.',
        'Pair after heavy flat bench for complete upper-to-lower chest development.',
      ],
      cuesAr: [
        'أبقِ القفص الصدري مرفوعاً خلال النزول دون إرخاء الكتفين للأمام.',
        'اعصر الصدر العلوي في القمة بتركيز ذهني عالٍ.',
        'ضعه بعد البنش المستوي الثقيل لتحقيق توازن شامل للصدر.',
      ],
    },
  },
  chest_fly: {
    general: {
      focusEn: 'Soft fixed 15–20° elbow bend, wide hugging arc, zero shoulder roll.',
      focusAr: 'ثني ثابت 15–20° للمرفق، قوس واسع، دون تقدم الكتف.',
      cuesEn: [
        'Lock elbow bend at 15–20°; never turn a fly into a press.',
        'Open smoothly until a clean outer-pec stretch, keeping chest tall.',
        'Sweep arms together across midline and hold 1s peak squeeze.',
      ],
      cuesAr: [
        'ثبّت انثناء المرفق 15–20° طوال الحركة ولا تحوّل التفتيح إلى دفع.',
        'افتح بذراعين واسعتين حتى تمدد الصدر مع بقاء الصدر مرفوعاً.',
        'اجمع الذراعين نحو المنتصف واعصر لثانية واحدة.',
      ],
    },
    modern: {
      focusEn: 'Lengthened hypertrophy stimulus with constant resistance profile.',
      focusAr: 'تضخيم بتوتر مستمر في أقصى إطالة للصدر.',
      cuesEn: [
        'Cable/pec-deck keeps torque high through both stretch and peak squeeze.',
        'Control 3s eccentric openings stopping before anterior shoulder discomfort.',
        'Ideal for 10–15 clean reps close to failure (1–2 RIR) with low joint strain.',
      ],
      cuesAr: [
        'الكابل أو الجهاز يحافظ على مقاومة عالية في أقصى إطالة وأقصى انقباض.',
        'تحكم بـ 3 ثوانٍ في الفتح دون التسبب بشد أمام الكتف.',
        'ممتاز لنطاق 10–15 تكراراً قرب الفشل العضلي بإجهاد مفصلي منخفض.',
      ],
    },
    old_school: {
      focusEn: 'Classic isolation finisher: strict stretch & intense peak contraction.',
      focusAr: 'عزل كلاسيكي لإنهاء الصدر: تمدد عميق وعصر قمي مركز.',
      cuesEn: [
        'Visualize hugging a barrel—focus purely on pectoral sweep, not heavy weight.',
        'Hold a hard 1–2s flex at the center to fill the inner chest.',
        'Keep shoulders pinned back so front delts never steal the tension.',
      ],
      cuesAr: [
        'تخيل معانقة برميل كبير وركز على شد الصدر نفسه لا ثقل الوزن.',
        'ثبّت الانقباض لثانية أو ثانيتين في المنتصف لإشباع العضلة بالدم.',
        'ثبّت الكتفين للخلف لمنع الكتف الأمامي من سرقة الجهد.',
      ],
    },
  },
  row: {
    general: {
      focusEn: 'Neutral spine, pull elbows to hips/ribs, squeeze shoulder blades.',
      focusAr: 'ظهر مستقيم، سحب المرفقين للخصر، ضغط لوحي الكتف.',
      cuesEn: [
        'Keep spine neutral and core braced—never round the lower back.',
        'Lead the pull with elbows toward hips/lower ribs rather than biceps.',
        'Control the forward stretch so lats and mid-back lengthen fully.',
      ],
      cuesAr: [
        'حافظ على استقامة الظهر وشد الجذع دون تقوّس أسفل الظهر.',
        'ابدأ السحب بدفع المرفقين نحو الخصر لا بالذراعين فقط.',
        'تحكم في الإعادة للأمام لإطالة عضلات الظهر بالكامل.',
      ],
    },
    modern: {
      focusEn: 'Full scapular protraction-to-retraction ROM with minimal momentum.',
      focusAr: 'مدى حركي كامل للوح الكتف من الإطالة إلى العصر دون أرجحة.',
      cuesEn: [
        'Allow controlled protraction at the bottom to load mid-traps and lats stretched.',
        'Pause 0.5–1s at peak contraction without heaving the torso backward.',
        'Use chest-supported variants when lower-back fatigue limits target back sets.',
      ],
      cuesAr: [
        'اسمح بتمدد لوحي الكتف في الأمام بتحكم لتحميل الأوسط واللاتس في الإطالة.',
        'توقف لحظة عند أقصى سحب دون أرجحة الجذع للخلف.',
        'استخدم المسند الصدري عندما يحد إرهاق أسفل الظهر من جودة الجولات.',
      ],
    },
    old_school: {
      focusEn: 'Dense back thickness: heavy strict rows and powerful elbow drive.',
      focusAr: 'بناء سماكة الظهر الكلاسيكية: سحب ثقيل منضبط وقوة سحب عالية.',
      cuesEn: [
        'Treat hands like hooks—pull with the back elbows to build thick rhomboids & lats.',
        'Stay locked over the weight without jerking upright.',
        'Build steady progression across 6–10 heavy working reps.',
      ],
      cuesAr: [
        'اعتبر اليدين مجرد خطافين واسحب بالمرفقين لبناء سماكة منتصف الظهر.',
        'حافظ على زاوية الجذع ثابتة دون رفع الصدر بالزخم.',
        'تدرج بثبات في الأوزان ضمن 6–10 تكرارات قوية.',
      ],
    },
  },
  pulldown: {
    general: {
      focusEn: 'Depress shoulders first, pull elbows straight down to upper chest.',
      focusAr: 'اخفض الكتفين أولاً ثم اسحب المرفقين عمودياً لأعلى الصدر.',
      cuesEn: [
        'Start upright with ribcage stacked; avoid excessive backward torso lean.',
        'Pull shoulder blades down away from ears, then drive elbows to your sides.',
        'Control the return overhead until lats stretch fully.',
      ],
      cuesAr: [
        'ابدأ بجذع مستقر وتجنب الميل المفرط للخلف.',
        'اخفض لوحي الكتف بعيداً عن الأذنين ثم اسحب المرفقين للأسفل نحو الجانبين.',
        'اصعد بتحكم حتى أقصى إطالة للعضلة الظهرية العريضة.',
      ],
    },
    modern: {
      focusEn: 'Vertical shoulder-adduction leverage & slow overhead eccentric stretch.',
      focusAr: 'عزم سحب عمودي دقيق مع إطالة بطيئة فوق الرأس.',
      cuesEn: [
        'Use a shoulder-to-medium grip aligned with your elbow plane to avoid shoulder impingement.',
        'Stretch high at the top for 1–2s and control a 2–3s eccentric return.',
        'Stop pulling once upper arms align near ribs rather than over-rolling shoulders forward.',
      ],
      cuesAr: [
        'استخدم قبضة متوسطة تلائم مسار المرفقين لحماية مفصل الكتف.',
        'أطِل العضلة بالكامل في الأعلى وتحكم بالنزول والصعود 2–3 ثوانٍ.',
        'توقف عند مستوى أعلى الصدر دون لف الكتفين للأمام.',
      ],
    },
    old_school: {
      focusEn: 'Classic V-taper width builder: full stretch and chest-up lat flare.',
      focusAr: 'بناء عرض الظهر الكلاسيكي (V-Taper): تمدد عميق وسحب نحو أعلى الصدر.',
      cuesEn: [
        'Lift chest to meet the bar at the bottom of every rep.',
        'Lead with the pinky/outer-hand side to ignite the outer lats.',
        'Work 8–12 strict reps focusing on a deep lat pump.',
      ],
      cuesAr: [
        'ارفع الصدر قليلاً لملاقاة البار في أسفل كل تكرار.',
        'ركز السحب عبر الجانب الخارجي للقبضة لتنشيط عرض المجنص.',
        'نفّذ 8–12 تكراراً منضبطاً مع تركيز ذهني على التمدد والعصر.',
      ],
    },
  },
  overhead_press: {
    general: {
      focusEn: 'Brace abs & glutes, forearms vertical, press straight overhead.',
      focusAr: 'شد البطن والأرداف، ساعدان عموديان، دفع عمودي مستقيم.',
      cuesEn: [
        'Squeeze glutes and abs tight so lower back never arches.',
        'Keep forearms vertical and press straight up over mid-foot/ears.',
        'Lower steadily back to upper chest / clavicle under control.',
      ],
      cuesAr: [
        'اشدد الأرداف والبطن لمنع تقوّس أسفل الظهر.',
        'أبقِ الساعدين عموديين وادفع للأعلى على خط عمودي فوق منتصف القدم.',
        'أنزل بتحكم إلى مستوى أعلى الصدر/الترقوة.',
      ],
    },
    modern: {
      focusEn: 'Scapular-plane pressing path & stacked axial stability.',
      focusAr: 'الدفع في مستوى لوح الكتف مع ثبات محوري كامل.',
      cuesEn: [
        'Tuck elbows ~20–30° forward (scapular plane) to protect shoulder subacromial space.',
        'Track bar straight vertically by tucking chin slightly back off start.',
        'Control descent to full front-delt stretch without bouncing off knees.',
      ],
      cuesAr: [
        'وجه المرفقين للأمام 20–30° (مستوى لوح الكتف) لحماية أوتار الكتف.',
        'اجعل مسار البار مستقيماً عمودياً بإرجاع الذقن قليلاً عند الانطلاق.',
        'تحكم بالنزول الكامل دون استخدام دفعة الركبتين.',
      ],
    },
    old_school: {
      focusEn: 'Strict military press strength: boulder shoulders & solid core.',
      focusAr: 'القوة العسكرية الكلاسيكية: بناء أكتاف ضخمة وجذع صلب.',
      cuesEn: [
        'Lock legs and hips like steel pillars before initiating the drive.',
        'Press forcefully to a crisp lockout overhead and control down to the collarbones.',
        'Progress methodically in strict 5–8 rep strength sets.',
      ],
      cuesAr: [
        'ثبّت الساقين والورك كأعمدة صلبة قبل بدء الدفع.',
        'ادفع بقوة حتى القفل الكامل فوق الرأس ثم أنزل بثبات للترقوة.',
        'تدرّج بالأوزان في جولات قوة من 5–8 تكرارات صارمة.',
      ],
    },
  },
  lateral_raise: {
    general: {
      focusEn: 'Sweep outward ~30° forward in scapular plane; never shrug traps.',
      focusAr: 'رفع جانبي بزاوية ~30° للأمام دون رفع الترابيس.',
      cuesEn: [
        'Stand tall, keep shoulders depressed, and angle arms ~20–30° forward.',
        'Push weights outward toward the side walls up to shoulder height.',
        'Lower slowly over 2–3s without resting weights on legs.',
      ],
      cuesAr: [
        'قف باستقامة مع خفض الكتفين وتوجيه الذراعين للأمام 20–30°.',
        'ارفع للخارج نحو الجدران حتى مستوى الكتفين لا أعلى.',
        'انزل ببطء خلال 2–3 ثوانٍ دون إراحة الوزن على الفخذين.',
      ],
    },
    modern: {
      focusEn: 'Scapular-plane lateral delt tension with constant-tension bottom range.',
      focusAr: 'استهداف الدالية الجانبية بمستوى لوح الكتف وحفظ التوتر في الأسفل.',
      cuesEn: [
        'Cables or slight torso lean maximize tension where lateral delts are lengthened.',
        'Avoid internal shoulder rotation ("pouring pitchers"); keep thumbs neutral/slightly up.',
        'Use 12–20 clean controlled reps with short rests for lateral delt growth.',
      ],
      cuesAr: [
        'الكابل أو الميل الخفيف يزيد التوتر في نقطة الإطالة السفلية.',
        'تجنب تدوير الكتف للداخل المفرط؛ أبقِ المعصم متوازناً مع المرفق.',
        'استهدف 12–20 تكراراً متحكماً به لنمو الكتف الجانبي.',
      ],
    },
    old_school: {
      focusEn: 'Broad-shoulder illusion: relentless control and zero trap swing.',
      focusAr: 'عرض الأكتاف الكلاسيكي: تحكم صارم وعزل عن الترابيس.',
      cuesEn: [
        'Lead with the elbows and stop strictly at shoulder height.',
        'Keep torso dead still—drop weight rather than swinging with lower back.',
        'Chase clean burn and full lateral-head pump.',
      ],
      cuesAr: [
        'اجعل المرفق يقود الحركة وتوقف عند مستوى الكتفين.',
        'ثبّت الجذع تماماً؛ خفّف الوزن بدلاً من أرجحة الظهر.',
        'ركّز على الضخ الدموي المستمر في الرأس الجانبي للكتف.',
      ],
    },
  },
  bicep_curl: {
    general: {
      focusEn: 'Elbows pinned to sides, pure elbow flexion, full bottom extension.',
      focusAr: 'المرفقان بمحاذاة الجذع، ثني مرفق نقي، وفرد كامل في الأسفل.',
      cuesEn: [
        'Pin upper arms gently at sides; avoid swinging torso backward.',
        'Curl cleanly to top contraction keeping wrists neutral/straight.',
        'Lower all the way to full extension over 2–3s.',
      ],
      cuesAr: [
        'ثبّت العضدين بمحاذاة الجذع دون أرجحة الظهر.',
        'اثنِ المرفقين للأعلى مع استقامة المعصمين دون انثناء مفرط.',
        'افرد الذراعين بالكامل بتحكم خلال 2–3 ثوانٍ.',
      ],
    },
    modern: {
      focusEn: 'Stretched-position elbow flexion & strict eccentric resistance.',
      focusAr: 'ثني المرفق مع تعظيم الإطالة السفلية والنزول البطيء.',
      cuesEn: [
        'Full elbow extension at the bottom stimulates distal and long-head hypertrophy.',
        'Keep shoulder angle locked so front delts don’t lift the elbow forward early.',
        'Track slow 2–3s eccentrics across 8–15 reps at 1–2 RIR.',
      ],
      cuesAr: [
        'الوصول إلى الفرد الكامل في الأسفل يحفّز التضخيم على كامل طول العضلة.',
        'ثبّت مفصل الكتف لمنع تقدم المرفق للأمام مبكراً.',
        'التزم بنزول بطيء 2–3 ثوانٍ في 8–15 تكراراً قرب الفشل.',
      ],
    },
    old_school: {
      focusEn: 'Peak contraction & strict discipline: supinate wrists, squeeze hard.',
      focusAr: 'ذروة الانقباض الكلاسيكية: لف المعصم للخارج وعصر قوي في القمة.',
      cuesEn: [
        'Supinate pinky upward cleanly as you curl for classic biceps peak activation.',
        'Hold a deliberate 1s squeeze at the top before resisting downward.',
        'Never sacrifice form for ego weight.',
      ],
      cuesAr: [
        'أدر راحة اليد بالكامل للأعلى أثناء الصعود لتفعيل قمة البايسبس.',
        'اعصر العضلة لثانية في القمة قبل النزول المقاوم للجاذبية.',
        'لا تضحِّ بنظافة الأداء من أجل أوزان زائفة.',
      ],
    },
  },
  tricep_extension: {
    general: {
      focusEn: 'Lock upper arms solidly, deep elbow fold, full lockout squeeze.',
      focusAr: 'تثبيت العضد تماماً، ثني عميق للمرفق، وقفل كامل في النهاية.',
      cuesEn: [
        'Anchor upper arms firmly—only the elbow joint moves.',
        'Fold forearms fully for a deep tricep stretch without flaring elbows out.',
        'Extend to crisp lockout and hold tension briefly.',
      ],
      cuesAr: [
        'ثبّت العضد دون تحريك الكتف؛ الحركة من مفصل المرفق فقط.',
        'اسمح بانثناء كامل لإطالة الترايسبس دون فتح المرفقين للخارج.',
        'افرد المرفقين بالكامل واعصر العضلة لحظة.',
      ],
    },
    modern: {
      focusEn: 'Overhead long-head stretch + pushdown joint-friendly balance.',
      focusAr: 'توازن إطالة الرأس الطويل فوق الرأس مع الدفع المريح للمرفق.',
      cuesEn: [
        'Combine overhead extensions (long-head stretch) with neutral pushdowns weekly.',
        'Pause lightly at full elbow flexion to remove tendon bounce.',
        'Use controlled 10–15 reps that spare elbow tendon irritation.',
      ],
      cuesAr: [
        'ادمج المد العلوي (لإطالة الرأس الطويل) مع الدفع للأسفل أسبوعياً.',
        'توقف لحظة في أقصى انثناء لتجنب ارتداد وتر المرفق.',
        'نفّذ 10–15 تكراراً بتحكم يحافظ على راحة المرفق.',
      ],
    },
    old_school: {
      focusEn: 'Horseshoe thickness: heavy controlled extensions & locked elbows.',
      focusAr: 'بناء حذوة الترايسبس الكلاسيكية: تركيز ثقيل ومتحكم فيه.',
      cuesEn: [
        'Keep elbows tucked tight toward midline throughout the set.',
        'Flex triceps hard at every lockout before bending slowly back.',
        'Finish arm day with clean pump-focused sets.',
      ],
      cuesAr: [
        'أبقِ المرفقين قريبين من الخط الوسطي للجسم طوال الجولة.',
        'اعصر الترايسبس بقوة في كل قفل قبل الثني البطيء.',
        'أنهِ يوم الذراعين بجولات مركزة لضخ الدم.',
      ],
    },
  },
  squat: {
    general: {
      focusEn: 'Tripod foot, 360° core brace, knees track over toes to parallel+.',
      focusAr: 'توازن القدم، شد الجذع 360°، ركبتان بمحاذاة الأصابع حتى الموازاة.',
      cuesEn: [
        'Spread weight evenly across heel, big toe, and outer foot; brace core 360°.',
        'Break hips and knees together; track knees cleanly over toes.',
        'Drive straight up through mid-foot keeping chest and hips rising together.',
      ],
      cuesAr: [
        'وزّع الضغط على الكعب وأطراف القدم واشدد البطن والظهر 360°.',
        'انزل بثني الورك والركبة معاً مع توجيه الركبتين نحو أصابع القدم.',
        'ادفع الأرض بمنتصف القدم واصعد بالورك والصدر معاً.',
      ],
    },
    modern: {
      focusEn: 'High knee-flexion depth & upright torso for maximum quad stimulus.',
      focusAr: 'عمق كامل وانثناء ركبة كبير لتعظيم تحفيز الفخذ الأمامي.',
      cuesEn: [
        'Reach parallel or below with neutral spine to maximize quad & glute hypertrophy.',
        'Control descent over 2–3s and avoid bouncing out of the bottom hole.',
        'Scale stance width or heel elevation to match hip anatomy cleanly.',
      ],
      cuesAr: [
        'اهبط لعمق الموازاة أو أسفلها بظهر محايد لتعظيم تحفيز الفخذ والألوية.',
        'تحكم بالنزول 2–3 ثوانٍ دون ارتداد من القاع.',
        'عدّل عرض الوقفة أو ارتفاع الكعب بما يناسب مرونة الحوض والكاحل.',
      ],
    },
    old_school: {
      focusEn: 'King of lower-body builders: iron brace, grit, steady weight progression.',
      focusAr: 'ملك تمارين القوة الكلاسيكية: صلابة الجذع والتدرج المستمر.',
      cuesEn: [
        'Lock upper back tightly under the bar and own every inch of the descent.',
        'Drive forcefully out of the bottom without letting hips shoot up first.',
        'Respect fatigue—build heavy working sets patiently across months.',
      ],
      cuesAr: [
        'ثبّت أعلى الظهر بإحكام تحت البار وسيطر على كل سنتيمتر من النزول.',
        'ادفع بقوة من القاع دون صعود الحوض قبل الصدر.',
        'ابنِ الأوزان تدريجياً على مدى الأشهر مع احترام الاستشفاء.',
      ],
    },
  },
  hinge: {
    general: {
      focusEn: 'Lats packed, neutral spine, push hips straight back, bar close.',
      focusAr: 'شد المجنص، استقامة الظهر، دفع الورك للخلف، بار ملاصق للساق.',
      cuesEn: [
        'Pack lats down and lock neutral spine before lifting.',
        'Push hips horizontally backward keeping bar hugging thighs/shins.',
        'Snap hips forward to tall lockout—never hyperextend backward.',
      ],
      cuesAr: [
        'شد المجنص وحافظ على استقامة الظهر التامة قبل السحب.',
        'ادفع الحوض أفقياً للخلف مع بقاء البار ملاصقاً للفخذين والساقين.',
        'أتمّ الوقوف بدفع الورك للأمام دون إرجاع الظهر للخلف.',
      ],
    },
    modern: {
      focusEn: 'Maximal hamstring/glute stretch with zero lumbar rounding.',
      focusAr: 'أقصى إطالة للفخذ الخلفي والألوية دون تقوس أسفل الظهر.',
      cuesEn: [
        'Stop lowering the moment hips cease moving backward (mid-shin)—depth beyond that rounds spine.',
        'Control a 3s eccentric on RDLs to maximize hamstring stretch-mediated growth.',
        'Manage systemic fatigue by pairing heavy hinges cleanly with recovery days.',
      ],
      cuesAr: [
        'توقف عن النزول فور توقف الحوض عن التراجع للخلف لحماية أسفل الظهر.',
        'التزم بنزول 3 ثوانٍ في الروماني لتعظيم التضخيم في أقصى إطالة.',
        'وازن حمل السحب الثقيل مع قدرة استشفاء الجهاز العصبي.',
      ],
    },
    old_school: {
      focusEn: 'Posterior-chain powerhouse: dead-stop tension and full-body pull.',
      focusAr: 'قوة السلسلة الخلفية الكلاسيكية: سحب من الثبات بكامل صلابة الجسم.',
      cuesEn: [
        'Pull slack out of the bar until you feel lats and hamstrings click tight.',
        'Push the floor away cleanly while keeping chest proud.',
        'Focus on quality heavy triples to fives rather than sloppy high-rep bouncing.',
      ],
      cuesAr: [
        'اسحب ارتخاء البار أولاً حتى تشعر بشد المجنص والفخذ الخلفي بالكامل.',
        'ادفع الأرض بقدميك مع بقاء الصدر عالياً والبار قريباً.',
        'ركّز على جولات ثقيلة نظيفة 3–5 تكرارات بدلاً من الارتداد السريع.',
      ],
    },
  },
  lunge: {
    general: {
      focusEn: 'Split tripod stance, vertical drop, drive through front foot.',
      focusAr: 'وقفة متباعدة، نزول عمودي، دفع عبر كامل القدم الأمامية.',
      cuesEn: [
        'Keep front heel planted and torso leaned subtly ~10–15° forward.',
        'Drop smoothly straight down keeping front knee aligned over toes.',
        'Drive forcefully up through the front mid-foot and heel.',
      ],
      cuesAr: [
        'ثبّت كعب القدم الأمامية مع ميل طفيف للجذع للأمام.',
        'انزل باستقامة للأسفل مع ثبات الركبة بمحاذاة أصابع القدم.',
        'ادفع بقوة للأعلى عبر كامل القدم الأمامية.',
      ],
    },
    modern: {
      focusEn: 'Unilateral glute/quad symmetry & deep hip-flexion stretch.',
      focusAr: 'توازن أحادي الجانب وإطالة عميقة للألوية والفخذ الأمامي.',
      cuesEn: [
        'Use longer stride / slight forward lean for glutes; upright torso for quads.',
        'Control bottom turnaround cleanly without slamming rear knee on the floor.',
        'Great for fixing left-to-right strength imbalances.',
      ],
      cuesAr: [
        'خطوة أطول بميل خفيف تركز على الألوية؛ وجذع مستقيم يركز على الفخذ الأمامي.',
        'تحكم بالنقطة السفلية دون صدم الركبة الخلفية بالأرض.',
        'مثالي لعلاج عدم توازن القوة بين الساقين.',
      ],
    },
    old_school: {
      focusEn: 'Classic leg separation & conditioning finisher.',
      focusAr: 'تفصيل الساقين وبناء التوازن العضلي الكلاسيكي.',
      cuesEn: [
        'Stay steady through every stride without wobbling knees.',
        'Keep constant tension without locking out completely at top if chasing burn.',
        'Pair after squats for complete thigh development.',
      ],
      cuesAr: [
        'حافظ على توازن صلب في كل خطوة دون اهتزاز الركبة.',
        'أبقِ التوتر مستمراً في الساق الأمامية طوال الجولة.',
        'ضعه بعد السكوات لإتمام تطوير الفخذ والألوية.',
      ],
    },
  },
  leg_extension: {
    general: {
      focusEn: 'Align knee with pivot cam, lock out smoothly, slow descent.',
      focusAr: 'محاذاة الركبة مع المحور، فرد سلس، ونزول بطيء.',
      cuesEn: [
        'Align knee joint directly with machine pivot; pad sits above ankles.',
        'Extend knees smoothly to full quad contraction without lifting hips.',
        'Control a 2–3s descent keeping tension off the weight stack.',
      ],
      cuesAr: [
        'طابق مفصل الركبة مع محور دوران الجهاز وضع الوسادة فوق الكاحل.',
        'افرد الركبتين بسلاسة لعصر الفخذ الأمامي دون رفع الحوض.',
        'أنزل بتحكم 2–3 ثوانٍ دون اصطدام الأوزان.',
      ],
    },
    modern: {
      focusEn: 'Pure rectus femoris isolation without systemic squat fatigue.',
      focusAr: 'عزل مباشر للفخذ الأمامي (خاصة المستقيمة الفخذية) دون إجهاد جهازي.',
      cuesEn: [
        'Slightly reclined backrest lengthens rectus femoris at the hip for superior growth.',
        'Control the bottom stretched half tightly—that range drives high quad hypertrophy.',
        'Push close to failure (0–2 RIR) safely in 10–15 rep sets.',
      ],
      cuesAr: [
        'إرجاع مسند الظهر قليلاً يطيل العضلة المستقيمة الفخذية لتضخيم أفضل.',
        'ركز على النصف السفلي المتحكم فيه لأنه يولّد استجابة نمو قوية.',
        'يمكن الاقتراب بأمان من الفشل العضلي (0–2 RIR) في 10–15 تكراراً.',
      ],
    },
    old_school: {
      focusEn: 'Teardrop quad carving: 1s lockout squeeze and strict tempo.',
      focusAr: 'نحت الفخذ الأمامي الكلاسيكي: ثبات ثانية في القمة وإيقاع صارم.',
      cuesEn: [
        'Hold a hard 1s peak squeeze at lockout to etch vastus medialis detail.',
        'Avoid kicking the weight up violently from the bottom.',
        'Great for pre-exhaust or finishing pump sets.',
      ],
      cuesAr: [
        'ثبّت انقباض القفل لمدة ثانية كاملة لإبراز تفاصيل العضلة الدمعة.',
        'تجنب ركل الوزن بعنف من الأسفل.',
        'ممتاز لتسخين أو إنهاء تمرين الأرجل بضخ دم قوي.',
      ],
    },
  },
  leg_curl: {
    general: {
      focusEn: 'Pin pelvis to pad, curl heels to glutes, slow knee extension.',
      focusAr: 'إلصاق الحوض بالمقعد، سحب الكعبين للأرداف، وفرد بطيء.',
      cuesEn: [
        'Press hips firmly into the pad so lower back never arches.',
        'Drive heels smoothly toward glutes and hold briefly.',
        'Extend legs slowly over 2–3s to stretch hamstrings cleanly.',
      ],
      cuesAr: [
        'ألصق الحوض بالمقعد تماماً لمنع تقوس أسفل الظهر.',
        'اسحب الكعبين نحو الأرداف بسلاسة مع ثبات قصير.',
        'افرد الساقين ببطء خلال 2–3 ثوانٍ لإطالة الخلفي.',
      ],
    },
    modern: {
      focusEn: 'Seated hip-flexion advantage & full eccentric lengthening.',
      focusAr: 'استغلال إطالة الفخذ الخلفي مع نزول بطيء كامل.',
      cuesEn: [
        'Seated leg curls pre-stretch hamstrings at the hip for greater hypertrophy.',
        'Reach full knee extension (short of hyperextension) on every rep.',
        'Work 8–15 strict reps close to failure (1–2 RIR).',
      ],
      cuesAr: [
        'الجهاز جالساً يضع الفخذ الخلفي في إطالة أكبر عند الورك لنمو أفضل.',
        'اصل لفرد كامل متحكم فيه في كل تكرار.',
        'نفّذ 8–15 تكراراً صارماً قرب الفشل العضلي.',
      ],
    },
    old_school: {
      focusEn: 'Thick rear-thigh isolation: zero hip lift, hard peak hold.',
      focusAr: 'تضخيم الفخذ الخلفي الكلاسيكي: ثبات الحوض وعصر قوي.',
      cuesEn: [
        'Keep glutes/hips nailed down—any hip rise means the weight is too heavy.',
        'Squeeze hamstrings hard at top flexion before lowering slowly.',
        'Pair with RDLs for full knee-flexion & hip-extension hamstring work.',
      ],
      cuesAr: [
        'أبقِ الأرداف ملتصقة بالوسادة؛ ارتفاعها يعني أن الوزن أثقل من اللازم.',
        'اعصر الفخذ الخلفي بقوة عند القمة قبل الفرد البطيء.',
        'اجمعه مع الديدلفت الروماني لتغطية وظيفتي العضلة الخلفية.',
      ],
    },
  },
  calf_raise: {
    general: {
      focusEn: 'Pause 1–2s in deep stretch, rise high on ball of foot, squeeze 1s.',
      focusAr: 'توقف 1–2 ث في التمدد السفلي، صعود عالٍ على الأمشاط، عصر ثانية.',
      cuesEn: [
        'Anchor balls of feet solidly; keep ankles tracking straight.',
        'Drop heels fully and pause 1–2s to kill Achilles tendon bounce.',
        'Drive all the way up onto big toe ball and squeeze 1s.',
      ],
      cuesAr: [
        'ثبّت مقدمة القدمين مع استقامة الكاحلين.',
        'اخفض الكعبين بالكامل وتوقف 1–2 ثانية لإلغاء ارتداد الوتر.',
        'اصعد لأقصى ارتفاع على الأمشاط واعصر السمانة ثانية.',
      ],
    },
    modern: {
      focusEn: 'Lengthened-range bias with straight-knee gastrocnemius priority.',
      focusAr: 'أولوية السمانة بركبة مفرودة والتركيز على المدى السفلي.',
      cuesEn: [
        'Straight-knee raises recruit gastrocnemius far more effectively than bent-knee seated.',
        'Deep paused bottom stretch is the highest-value portion of the rep.',
        'Never bounce fast; 10–15 strict paused reps outperform rapid 30-rep bouncing.',
      ],
      cuesAr: [
        'الركبة المفرودة (وقوفاً) تفعّل البطن الساقية الكبرى بفاعلية أعلى من الجلوس.',
        'الثبات في أقصى تمدد سفلي هو الجزء الأعلى قيمة للبناء العضلي.',
        '10–15 تكراراً بتوقف بطيء أفضل بكثير من 30 تكراراً بالارتداد السريع.',
      ],
    },
    old_school: {
      focusEn: 'Full-range diamond calves: heavy deliberate reps from bottom to peak.',
      focusAr: 'بناء السمانة الكلاسيكي: مدى كامل من أقصى تمدد لأعلى ارتفاع.',
      cuesEn: [
        'Treat calves like any heavy muscle—push true full-range weight progression.',
        'Hold the top peak on every single rep until calves burn.',
        'Train straight-leg and seated variations consistently twice weekly.',
      ],
      cuesAr: [
        'عامل السمانة كأي عضلة أساسية وتدرج بأوزان حقيقية بمدى كامل.',
        'ثبّت القمة في كل تكرار حتى نهاية الجولة.',
        'استمر عليها مرتين أسبوعياً بانضباط طويل الأمد.',
      ],
    },
  },
  core_flexion: {
    general: {
      focusEn: 'Curl ribs toward pelvis (spinal flexion), exhale, slow uncurl.',
      focusAr: 'تقريب القفص الصدري للحوض، زفير مع الانقباض، وعودة بطيئة.',
      cuesEn: [
        'Curl spine to bring ribs to pelvis rather than just hinging at hips.',
        'Exhale smoothly through peak abdominal contraction for 1s.',
        'Uncurl slowly maintaining steady core tension throughout.',
      ],
      cuesAr: [
        'قوّس الجذع لتقريب الضلوع من الحوض لا بالثني من الورك فقط.',
        'ازفر الهواء عند قمة الانقباض مع ثبات ثانية واحدة.',
        'عد ببطء مع إبقاء البطن مشدوداً طوال الجولة.',
      ],
    },
    modern: {
      focusEn: 'Loadable spinal flexion in 8–15 reps for real rectus hypertrophy.',
      focusAr: 'ثني عمود فقري محمل بأوزان في 8–15 تكراراً لتضخيم البطن.',
      cuesEn: [
        'Cable crunches and hanging raises let you apply progressive overload to abs.',
        'Round thoracic spine smoothly so rectus abdominis actually shortens.',
        'Track reps & cable weight like any other hypertrophy movement.',
      ],
      cuesAr: [
        'الكابل والرفع المعلق يتيحان تطبيق الزيادة التدريجية على عضلات البطن.',
        'حرّك العمود الفقري الصدري لتنقبض عضلات البطن فعلياً لا ثني الفخذ.',
        'سجّل الوزن والتكرارات كأي تمرين بناء عضلي آخر.',
      ],
    },
    old_school: {
      focusEn: 'Sharp midsection control: deliberate crunches & tight vacuum breath.',
      focusAr: 'تحكم عضلي كلاسيكي بالبطن: انقباض مركز وتنفس منضبط.',
      cuesEn: [
        'Never pull on the neck; keep focus squarely on flexing the abs.',
        'Pause and squeeze all air out at peak contraction.',
        'Consistency and nutrition carve the midsection alongside hard core work.',
      ],
      cuesAr: [
        'تجنب شد الرقبة باليدين وركز كامل الجهد في البطن.',
        'أفرغ النفس واعصر البطن تماماً في ذروة الحركة.',
        'الاستمرارية والانضباط الغذائي يكملان التمرين القوي.',
      ],
    },
  },
};

export function getExerciseVideoAsset(
  exerciseId: string,
  school: TrainingSchoolId
): ExerciseVideoAsset | null {
  const entry = BUILTIN_EXERCISE_VIDEOS[exerciseId];
  if (!entry) return null;
  return entry[school] ?? entry.default ?? null;
}

export function getBuiltinVideoPaths(): string[] {
  const urls = new Set<string>();
  for (const entry of Object.values(BUILTIN_EXERCISE_VIDEOS)) {
    for (const asset of Object.values(entry)) {
      if (asset?.src) {
        urls.add(asset.src);
      }
    }
  }
  return Array.from(urls);
}

export function getSchoolExecutionSummary(
  exercise: Exercise,
  pattern: MovementPattern,
  school: TrainingSchoolId
): SchoolCueSummary {
  const patternBlock = PATTERN_SCHOOL_CUES[pattern] || PATTERN_SCHOOL_CUES.bench_press;
  const chosen = patternBlock[school];

  const badgeMap: Record<TrainingSchoolId, { en: string; ar: string }> = {
    general: { en: 'Core Mechanics', ar: 'الشرح المختصر الأساسي' },
    modern: { en: 'Modern Scientific School', ar: 'المدرسة العلمية الحديثة' },
    old_school: { en: 'Old School Bodybuilding', ar: 'المدرسة القديمة' },
  };

  // For barbell-bench-press video, tailor general cues precisely to the 22s clip highlights
  if (exercise.id === 'barbell-bench-press' && school === 'general') {
    return {
      badgeEn: badgeMap.general.en,
      badgeAr: badgeMap.general.ar,
      focusEn: '5 key form checks: lower-mid chest touch, ~45° elbows, packed scapula, vertical forearms, shoulder-width+ grip.',
      focusAr: 'أهم 5 قواعد سريعة: لمس أسفل الصدر، مرفق ~45°، تثبيت اللوحين، ساعد عمودي، قبضة متوازنة.',
      cuesEn: [
        'Lower bar toward lower-mid chest—never high near the collarbones or neck.',
        'Tuck elbows ~45° from ribs (not flared 90°) and depress shoulder blades into the bench.',
        'Stack forearms vertically under the bar with a balanced grip slightly wider than shoulders.',
      ],
      cuesAr: [
        'أنزل البار نحو منتصف/أسفل الصدر — تجنب النزول عالياً قرب الترقوة أو الرقبة.',
        'اجعل المرفقين بزاوية ~45° عن الجذع (لا 90°) وثبّت لوحي الكتف للأسفل على المقعد.',
        'اجعل الساعدين عموديين تماماً تحت البار بقبضة متزنة أعرض قليلاً من الكتفين.',
      ],
    };
  }

  return {
    badgeEn: badgeMap[school].en,
    badgeAr: badgeMap[school].ar,
    focusEn: chosen.focusEn,
    focusAr: chosen.focusAr,
    cuesEn: chosen.cuesEn,
    cuesAr: chosen.cuesAr,
  };
}
