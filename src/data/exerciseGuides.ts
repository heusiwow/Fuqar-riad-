import stepBandChestPress from '../assets/images/step_band_chest_press_1795622285558.jpg';
import stepBandRow from '../assets/images/step_band_row_fixed_1795800279473.jpg';
import stepBarbellRow from '../assets/images/step_barbell_row_fixed_1795800131030.jpg';
import stepBarbellSquat from '../assets/images/step_barbell_squat_1795622203169.jpg';
import stepBenchDips from '../assets/images/step_bench_dips_1795695814431.jpg';
import stepBenchPress from '../assets/images/step_bench_press_1795617482435.jpg';
import stepBicepCurl from '../assets/images/step_bicep_curl_1795622201415.jpg';
import stepCableBicepCurl from '../assets/images/step_cable_bicep_curl_1795622333890.jpg';
import stepCableCrunch from '../assets/images/step_cable_crunch_1795706325936.jpg';
import stepCableFly from '../assets/images/step_cable_fly_1795617483962.jpg';
import stepCableLateralRaise from '../assets/images/step_cable_lateral_raise_v2_1795800596358.jpg';
import stepCalfRaise from '../assets/images/step_calf_raise_1795617488452.jpg';
import stepChestDips from '../assets/images/step_chest_dips_1795706470839.jpg';
import stepChestPressMachine from '../assets/images/step_chest_machine_1795706477153.jpg';
import stepChestSupportedRow from '../assets/images/step_supported_row_1795706472033.jpg';
import stepChinUps from '../assets/images/step_chin_ups_1795622285647.jpg';
import stepConventionalDeadlift from '../assets/images/step_deadlift_fixed_1795800281527.jpg';
import stepDumbbellBenchPress from '../assets/images/step_dumbbell_bench_press_1795622286033.jpg';
import stepDumbbellRdl from '../assets/images/step_dumbbell_rdl_fixed_1795800134781.jpg';
import stepDumbbellRow from '../assets/images/step_dumbbell_row_1795617484991.jpg';
import stepEzSkullcrusher from '../assets/images/step_ez_skullcrusher_1795706315581.jpg';
import stepFacePull from '../assets/images/step_face_pull_fixed_1795800282070.jpg';
import stepFrontSquat from '../assets/images/step_front_squat_1795695820092.jpg';
import stepGluteKickback from '../assets/images/step_glute_kickback_1795695847249.jpg';
import stepGobletSquat from '../assets/images/step_goblet_squat_1795695938678.jpg';
import stepHammerCurl from '../assets/images/step_hammer_curl_1795646674444.jpg';
import stepHipThrust from '../assets/images/step_hip_thrust_1795617486495.jpg';
import stepInclineBarbellPress from '../assets/images/step_incline_barbell_press_1795622285064.jpg';
import stepInclineCurl from '../assets/images/step_incline_curl_fixed_1795800446161.jpg';
import stepInclineDumbbellPress from '../assets/images/step_incline_dumbbell_press_1795384187243.jpg';
import stepLatPulldown from '../assets/images/step_lat_pulldown_fixed_1795800284842.jpg';
import stepLateralRaise from '../assets/images/step_lateral_raise_fixed_1795800138518.jpg';
import stepLegCurl from '../assets/images/step_leg_curl_1795617487952.jpg';
import stepLegExtension from '../assets/images/step_leg_extension_1795617331618.jpg';
import stepLegPress from '../assets/images/step_leg_press_1795622204292.jpg';
import stepLegRaise from '../assets/images/step_leg_raise_1795617427609.jpg';
import stepMachineAbCrunch from '../assets/images/step_machine_ab_crunch_1795882298588.jpg';
import stepMachineLateralRaise from '../assets/images/step_machine_lateral_raise_fixed_1795800139937.jpg';
import stepMachineTricepExt from '../assets/images/step_machine_tricep_ext_1795882091814.jpg';
import stepOverheadEzTricep from '../assets/images/step_overhead_ez_tricep_1795706317632.jpg';
import stepOverheadPress from '../assets/images/step_overhead_press_1795622200788.jpg';
import stepOverheadTricep from '../assets/images/step_overhead_tricep_1795706513736.jpg';
import stepPallofPress from '../assets/images/step_pallof_press_1795695936454.jpg';
import stepPecDeck from '../assets/images/step_pec_deck_1795617325182.jpg';
import stepPendlayRow from '../assets/images/step_pendlay_row_fixed_1795800245982.jpg';
import stepPlankHold from '../assets/images/step_plank_hold_1795706473774.jpg';
import stepPreacherCurl from '../assets/images/step_preacher_curl_fixed_1795800285821.jpg';
import stepPullUps from '../assets/images/step_pull_ups_1795617328308.jpg';
import stepPushUps from '../assets/images/step_push_ups_1795617484602.jpg';
import stepRearDeltFly from '../assets/images/step_rear_delt_fly_fixed_1795800143316.jpg';
import stepReverseWristCurl from '../assets/images/step_reverse_wrist_curl_fixed_1795800423376.jpg';
import stepRomanianDeadlift from '../assets/images/step_romanian_deadlift_1795622205467.jpg';
import stepSeatedCableRow from '../assets/images/step_seated_cable_row_1795706331201.jpg';
import stepSeatedCalf from '../assets/images/step_seated_calf_1795706474299.jpg';
import stepSeatedDbPress from '../assets/images/step_seated_db_press_1795622325979.jpg';
import stepSmithBenchPress from '../assets/images/step_smith_bench_press_1795622250921.jpg';
import stepSmithCalf from '../assets/images/step_smith_calf_1795695822664.jpg';
import stepSmithOverheadPress from '../assets/images/step_smith_ohp_1795706475274.jpg';
import stepSmithSquat from '../assets/images/step_smith_squat_1795706405792.jpg';
import stepSplitSquat from '../assets/images/step_split_squat_1795706327418.jpg';
import stepTricepKickback from '../assets/images/step_tricep_kickback_v4_1795800626909.jpg';
import stepTricepPushdown from '../assets/images/step_tricep_pushdown_1795384187535.jpg';
import stepWristCurl from '../assets/images/step_wrist_curl_1795706470043.jpg';
import { Exercise } from '../types/ironlog';

export interface ExerciseQuickGuide {
  stepImage?: string;
  stepCaptionsEn: [string, string, string];
  stepCaptionsAr: [string, string, string];
  simpleExplanationEn: string;
  simpleExplanationAr: string;
  tipsEn: [string, string, string];
  tipsAr: [string, string, string];
  avoidEn: [string, string, string];
  avoidAr: [string, string, string];
}

export const EXERCISE_GUIDES: Record<string, ExerciseQuickGuide> = {
  // CHEST
  'barbell-bench-press': {
    stepImage: stepBenchPress,
    stepCaptionsEn: [
      'Pull shoulder blades down and back into the bench, plant feet flat, and grip slightly wider than shoulders with stacked wrists.',
      'Lower the bar over 2–3 seconds in a slight diagonal path toward your lower-mid chest while keeping elbows angled ~45° from your ribs.',
      'Touch the chest lightly without bouncing, then drive through your legs and press the bar up and slightly back above your shoulders.',
    ],
    stepCaptionsAr: [
      'ثبّت لوحي الكتف للأسفل والخلف على المقعد، اضغط القدمين بالأرض، وأمسك البار أعرض قليلاً من الكتفين مع استقامة المعصمين.',
      'أنزل البار بتحكم خلال 2–3 ثوانٍ في مسار مائل قليلاً نحو أسفل منتصف الصدر مع إبقاء المرفقين بزاوية تقارب 45°.',
      'لامس الصدر برفق دون ارتداد، ثم ادفع الأرض بقدميك وارفع البار للأعلى وللخلف قليلاً ليستقر فوق الكتفين.',
    ],
    simpleExplanationEn:
      'Lie flat with your upper back anchored and a slight natural arch so the chest—not the front shoulders—sits highest. The bar travels along a gentle diagonal line from directly over the shoulders to the lower-mid sternum and back up, keeping the forearms vertical underneath the bar to maximize chest power and protect the shoulder joints.',
    simpleExplanationAr:
      'استلقِ على المقعد المستوي مع سحب لوحي الكتف للخلف وللأسفل ليرتفع القفص الصدري ويتحمّل العبء بدلاً من مفصل الكتف. يتحرك البار في مسار مائل طفيف من فوق الكتفين نحو أسفل منتصف الصدر ثم يعود للأعلى، مع بقاء الساعدين عموديين تماماً تحت البار لتوجيه كامل القوة إلى ألياف الصدر الوسطى.',
    tipsEn: [
      'Keep wrists straight (knuckles pointing up) directly above your elbows so force transfers straight into the bar.',
      'Push your heels steadily into the floor throughout the set to lock your lower body and stabilize the bench arch.',
      'Pause for a fraction of a second on the chest before pressing—this eliminates momentum and strengthens your weakest point.',
    ],
    tipsAr: [
      'أبقِ المعصمين مستقيمين تماماً فوق المرفقين دون ثنيهما للخلف حتى ينتقل الدفع مباشرة إلى البار دون إجهاد الأوتار.',
      'ادفع الأرض بقدميك بثبات طوال الجولة لتثبيت الحوض والعمود الفقري ومنع اهتزاز الجسم.',
      'توقف لحظة خاطفة عند ملامسة الصدر قبل الدفع لإلغاء الاندفاع وتقوية أضعف نقطة في الرفعة.',
    ],
    avoidEn: [
      'Flaring elbows out to 90° in a T-shape, which pinches the front shoulder tendons under heavy load.',
      'Bouncing the bar off your ribcage or lifting your glutes off the bench to heave the weight up.',
      'Lowering the bar high toward your neck/collarbone instead of mid-lower sternum.',
    ],
    avoidAr: [
      'فتح المرفقين بزاوية 90° للخارج لأن ذلك يضغط مباشرة على أوتار الكتف الأمامية.',
      'ضرب البار بالصدر للارتداد أو رفع الأرداف عن المقعد لاختصار المسافة.',
      'إنزال البار عالياً باتجاه الرقبة أو الترقوة بدلاً من أسفل منتصف الصدر.',
    ],
  },
  'incline-dumbbell-press': {
    stepImage: stepInclineDumbbellPress,
    stepCaptionsEn: [
      'Set the bench to 30–45°, pin shoulder blades against the pad, and stack both dumbbells directly over your upper chest.',
      'Lower smoothly over 2–3 seconds until dumbbells reach beside your upper chest with elbows angled ~45° and forearms vertical.',
      'Drive upward along a slight inward arc above your upper chest—stopping just shy of clanking the weights together.',
    ],
    stepCaptionsAr: [
      'اضبط المقعد على زاوية 30–45°، ثبّت لوحي الكتف على المسند، وارفع الدامبل عمودياً فوق أعلى الصدر.',
      'انزل ببطء خلال 2–3 ثوانٍ حتى محاذاة أعلى الصدر مع بقاء المرفقين بزاوية ~45° والساعدين عموديين.',
      'ادفع للأعلى في قوس خفيف للداخل فوق أعلى الصدر دون صدم الدامبل ببعضهما في القمة.',
    ],
    simpleExplanationEn:
      'With the bench inclined at 30–45°, the line of push shifts upward to align directly with the clavicular (upper) chest fibers. Using dumbbells allows a deeper stretch at the bottom and lets your hands converge naturally at the top, forcing each side of the upper chest to work independently without dominance.',
    simpleExplanationAr:
      'يضبط هذا التمرين زاوية الجذع بين 30° و45° لتتماشى تماماً مع اتجاه ألياف الصدر العلوي (أسفل الترقوة). يسمح الدامبل بنزول أعمق يمنح العضلة إطالة كاملة في الأسفل، مع تقارب خفيف لليدين في الأعلى لعصر الصدر العلوي بالتساوي بين اليمين واليسار.',
    tipsEn: [
      'Stick to a 30° bench angle when possible—it hits upper pecs cleanly while minimizing front-delt takeover.',
      'Angle the dumbbells slightly inward (~15–30°) rather than dead flat to keep wrists and shoulders comfortable.',
      'Keep your ribcage high as the weights descend so your chest receives the stretch instead of your shoulders.',
    ],
    tipsAr: [
      'فضّل زاوية 30° للمقعد قدر الإمكان، فهي تمنح أعلى تفعيل للصدر العلوي قبل تدخل الكتف الأمامي.',
      'أمل الدامبل للداخل قليلاً (~15–30°) بدلاً من إبقائهما على خط مستقيم واحد لراحة مفصل الكتف.',
      'حافظ على رفع القفص الصدري أثناء النزول حتى يتمدد الصدر العلوي نفسه لا الكتفان.',
    ],
    avoidEn: [
      'Setting the bench too upright (60°+), which turns the exercise into a shoulder press.',
      'Clanking dumbbells loudly at the top, which bounces tension off the pecs.',
      'Letting elbows flare backward behind your torso line at the bottom stretch.',
    ],
    avoidAr: [
      'رفع زاوية المقعد إلى 60° فأعلى لأن ذلك يحوّل الحمل الرئيسي إلى الكتف الأمامي.',
      'صدم الدامبل ببعضهما في الأعلى مما يضيع الشد المستمر عن العضلة.',
      'ترك المرفقين يرجعان خلف مستوى الظهر عند النزول العميق.',
    ],
  },
  'cable-chest-fly': {
    stepImage: stepCableFly,
    stepCaptionsEn: [
      'Set pulleys at chest level, take a stable split stance, chest proud, and freeze a soft 15–20° elbow bend.',
      'Sweep arms forward in a wide hugging arc until hands meet cleanly in front of your mid-chest.',
      'Hold 1s peak pectoral squeeze at midline, then open arms slowly back into a controlled stretch.',
    ],
    stepCaptionsAr: [
      'اضبط البكرتين بمستوى الصدر، تقدم بخطوة متوازنة، ارفع صدرك وثبّت ثنياً بسيطاً للمرفق (~15–20°).',
      'اجمع الذراعين للأمام في قوس واسع حتى تلتقي اليدان أمام منتصف الصدر.',
      'اعصر الصدر لمدة ثانية كاملة في المنتصف ثم افتح ذراعيك ببطء للتمدد المتحكم به.',
    ],
    simpleExplanationEn:
      'Unlike free weights that lose tension at the top, cable pulleys pull your arms outward horizontally throughout the entire arc. You lock a soft 15–20° bend at the elbows and pivot purely from the shoulder joint, sweeping both hands in a hugging motion until they meet in front of your mid-chest.',
    simpleExplanationAr:
      'على عكس الدامبل الذي تقل مقاومته في الأعلى، يحافظ الكابل على سحب ذراعيك للخارج باستمرار طوال المسار. تثبّت انحناءً بسيطاً في المرفقين (15–20°) وتتحرك الذراعان من مفصل الكتف فقط في قوس واسع للأمام حتى تلتقي اليدان أمام منتصف الصدر.',
    tipsEn: [
      'Freeze the 15–20° elbow bend like stiff wings—only your shoulder joints should open and close.',
      'Step forward into a solid split stance and keep your sternum lifted above your shoulders.',
      'Pause for 1 full second with hands slightly crossed or touching at midline to peak the inner chest.',
    ],
    tipsAr: [
      'جمّد زاوية المرفق (15–20°) طوال التمرين بحيث تفتح الذراعان وتغلقان من مفصل الكتف فقط.',
      'تقدم بخطوة متوازنة للأمام وثبّت صدرك مرفوعاً وأكتافك منخفضة للخلف.',
      'توقف لثانية كاملة عند التقاء اليدين أمام منتصف الصدر لتحقيق أقصى عصر للألياف.',
    ],
    avoidEn: [
      'Bending and extending your elbows each rep, which turns the fly into a standing cable chest press.',
      'Leaning your whole torso forward aggressively to push heavy stacks with body weight.',
      'Allowing arms to swing behind your body line, over-stretching the front shoulder joint.',
    ],
    avoidAr: [
      'ثني وفرد المرفقين أثناء السحب، لأن ذلك يحوّل التمرين إلى دفع وليس تفتيحاً.',
      'الانحناء بوزن الجسم للأمام لدفع أوزان ثقيلة تفوق قدرة عزل الصدر.',
      'إرجاع الذراعين خلف خط الجذع بشكل مبالغ فيه لأن ذلك يضغط على مفصل الكتف الأمامي.',
    ],
  },
  'smith-bench-press': {
    stepImage: stepSmithBenchPress,
    stepCaptionsEn: [
      'Center bench so the bar drops directly over lower-mid chest, set lower safety pins, and unlatch hooks.',
      'Lower bar smoothly over 2–3s to touch lower-mid chest with elbows tucked ~45°.',
      'Press forcefully straight up the rail without bouncing off the chest or safety stops.',
    ],
    stepCaptionsAr: [
      'ضع المقعد بحيث ينزل البار فوق منتصف الصدر إلى أسفله مباشرة، واضبط مصدّات الأمان السفلية.',
      'أنزل البار بتحكم خلال 2–3 ثوانٍ ليلامس أسفل منتصف الصدر بمرفقين بزاوية 45° تقريباً.',
      'ادفع للأعلى باستقامة على المسار الثابت دون ارتداد على الصدر.',
    ],
    simpleExplanationEn:
      'Guided along fixed steel rails, the Smith machine removes side-to-side stabilization so you can apply pure pressing force safely to failure. Position the bench carefully so the bar lowers perpendicularly straight onto your lower-mid chest, while safety latches lock any missed lift immediately.',
    simpleExplanationAr:
      'يتحرك البار هنا على مسار حديدي موجَّه يلغي الحاجة لموازنة الوزن جانبياً، مما يتيح التركيز الكامل على دفع الصدر بأمان حتى بدون شريك مساعدة. احرص على وضع المقعد بحيث ينزل البار عمودياً على أسفل منتصف الصدر تماماً مع ضبط أقفال الأمان السفلية.',
    tipsEn: [
      'Test bar alignment with an empty bar first so touch-down lands cleanly at lower-mid chest.',
      'Keep shoulder blades pinned down into the bench even though the track is guided.',
      'Set the lower safety stoppers 1–2 cm below your chest touch level before loading plates.',
    ],
    tipsAr: [
      'جرّب مسار البار فارغاً أولاً لتتأكد أنه يلامس منتصف الصدر إلى أسفله لا أعلى الصدر أو البطن.',
      'حافظ على خفض وتثبيت لوحي الكتف على المقعد كما تفعل تماماً في البار الحر.',
      'اضبط مصدّات الأمان السفلية أسفل مستوى ملامسة الصدر بقليل قبل إضافة الأوزان الثقيلة.',
    ],
    avoidEn: [
      'Placing the bench carelessly so the fixed rail forces the bar onto your throat or belly.',
      'Rolling wrists back while rotating the bar to unhook/re-hook.',
      'Bouncing off the bottom stoppers instead of maintaining muscular control.',
    ],
    avoidAr: [
      'وضع المقعد في موضع خاطئ يجبر البار على النزول باتجاه الرقبة أو البطن.',
      'ثني المعصمين للخلف أثناء تدوير البار لتحرير خطافات الأمان أو قفلها.',
      'الاعتماد على ارتداد البار عن مصدّات الأمان بدلاً من التحكم العضلي.',
    ],
  },
  'chest-press-machine': {
    stepImage: stepChestPressMachine,
    stepCaptionsEn: [
      'Adjust seat so handles sit aligned with mid-chest and pin shoulder blades flat against backrest.',
      'Press handles forward smoothly until arms are nearly extended without rolling shoulders off pad.',
      'Control the return back to deep chest stretch—stopping just before plates clank together.',
    ],
    stepCaptionsAr: [
      'اضبط المقعد لتكون المقابض بمحاذاة منتصف الصدر وثبّت لوحي الكتف على مسند الظهر.',
      'ادفع المقابض للأمام بسلاسة حتى شبه استقامة الذراعين دون فصل الكتفين عن المسند.',
      'تحكم في الرجوع للخلف حتى تمدد الصدر وتوقف قبيل اصطدام الأوزان ببعضها.',
    ],
    simpleExplanationEn:
      'Sitting upright with full back support locks your torso completely still, letting you press forward cleanly through the horizontal plane of the pectorals. Adjust the seat so the handles sit right in line with your mid-chest and keep your shoulder blades anchored flat against the backrest.',
    simpleExplanationAr:
      'الجلوس بظهر مسنود بالكامل يثبّت الجذع تماماً ويوجّه المقاومة في خط أفقي مباشر عبر منتصف عضلة الصدر. المفتاح هنا هو ضبط ارتفاع المقعد لتكون المقابض بمحاذاتك الصدرية الوسطى، ودفع المقابض للأمام دون انفصال كتفيك عن المسند.',
    tipsEn: [
      'Adjust seat height so handles align mid-sternum—elbows should sit ~45° below shoulder level.',
      'Use the foot pedal (if equipped) to push handles into starting position without straining shoulders.',
      'Stop the backward return just 1–2 cm before the weight plates touch so tension never drops.',
    ],
    tipsAr: [
      'اضبط ارتفاع المقعد لتكون المقابض بمحاذاة منتصف الصدر والمرفقان أخفض قليلاً من الكتفين.',
      'استخدم دواسة القدم إن وجدت لرفع المقابض إلى نقطة بداية آمنة قبل استلام الوزن بيديك.',
      'أوقف الرجوع قبل ملامسة الأوزان ببعضها بسنتيمتر واحد لإبقاء الصدر تحت شد متواصل.',
    ],
    avoidEn: [
      'Setting the seat too low, which shifts your elbows high and loads your neck and front delts.',
      'Rounding shoulders forward off the back pad at full extension.',
      'Letting the handles snap backward rapidly between reps.',
    ],
    avoidAr: [
      'خفض المقعد كثيراً مما يرفع المقابض لمستوى الكتف والرقبة ويضعف استهداف الصدر.',
      'تقديم الكتفين وفصل لوحي الكتف عن المسند في نهاية الدفع.',
      'ترك الأوزان تعود بسرعة وتصطدم ببعضها بعد كل تكرار.',
    ],
  },
  'push-ups': {
    stepImage: stepPushUps,
    stepCaptionsEn: [
      'Set hands slightly wider than shoulders in a rigid high plank with abs and glutes braced tight.',
      'Lower your chest smoothly toward the floor with elbows tucked ~45° backward—hips never sagging.',
      'Pause briefly just above the floor, then push forcefully back up to full rigid plank.',
    ],
    stepCaptionsAr: [
      'ضع اليدين أعرض قليلاً من الكتفين في وضعية الارتكاز المستقيمة مع شد البطن والأرداف بقوة.',
      'أنزل الصدر بتحكم نحو الأرض بمرفقين مائلين للخلف بنحو 45° دون هبوط أسفل الظهر.',
      'توقف لحظة قبيل ملامسة الأرض ثم ادفع بقوة حتى الاستقامة الكاملة.',
    ],
    simpleExplanationEn:
      'Your body acts as a rigid plank hinged at the toes while your hands push the torso away from the floor. Lower your chest until it hovers just above the ground with elbows angled ~45° backward, maintaining simultaneous tension in your chest, triceps, abs, and glutes.',
    simpleExplanationAr:
      'يعمل جسمك كلوح مستقيم واحد من الرأس حتى الكعبين أثناء خفض الصدر نحو الأرض ثم دفعه بعيداً عنها. ينخفض الصدر أولاً نحو نقطة متقدمة قليلاً عن اليدين بمرفقين مائلين للخلف بنحو 45°، مما يمرّن الصدر والترايسبس وثبات الجذع بوزن الجسم.',
    tipsEn: [
      'Screw your hands slightly outward into the floor and brace abs + glutes before descending.',
      'Lead downward with your chest—not your nose or chin—until chest nearly brushes the ground.',
      'Elevate hands on a bench or sturdy box if you cannot yet complete 6 clean full-depth reps.',
    ],
    tipsAr: [
      'ثبّت كفيك بقوة على الأرض واشدد عضلات البطن والأرداف معاً قبل بدء النزول.',
      'انزل بصدرك نحو الأرض أولاً (وليس برأسك أو أنفك) حتى يقترب الصدر من الملامسة.',
      'ارفع يديك على مقعد أو سطح مرتفع إذا لم تستطع إكمال 6 تكرارات كاملة بوضعية مستقيمة.',
    ],
    avoidEn: [
      'Letting your lower back sag downward into a hammock curve as fatigue hits.',
      'Piking your hips high in the air or doing fast 5-cm head-bobs.',
      'Flaring elbows wide out to 90° from your body.',
    ],
    avoidAr: [
      'تقوّس أسفل الظهر وهبوط البطن للأسفل عند الإجهاد.',
      'رفع الأرداف للأعلى أو الاكتفاء بنصف نزول سريع لا يفعّل الصدر.',
      'فتح المرفقين بزاوية 90° للجانبين أثناء الهبوط.',
    ],
  },
  'resistance-band-chest-press': {
    stepImage: stepBandChestPress,
    stepCaptionsEn: [
      'Anchor band behind you at chest level and step forward into a split stance with pre-tension.',
      'Press both handles straight forward and slightly inward until arms reach full chest contraction.',
      'Hold 1s at peak band tension in front, then resist the pull slowly back to chest.',
    ],
    stepCaptionsAr: [
      'ثبّت الحبل خلفك بمستوى الصدر وتقدم بقدم للأمام لتحقيق شد مسبق منذ البداية.',
      'ادفع اليدين للأمام وللداخل قليلاً حتى الامتداد الكامل أمام الصدر.',
      'ثبّت الانقباض لثانية عند أقصى مقاومة للحبل ثم عد ببطء وتحكم.',
    ],
    simpleExplanationEn:
      'With the band anchored behind you at chest level, resistance increases progressively the further forward you press—peak tension occurs right at full chest contraction. A staggered stance counters the backward pull so you can press evenly and control the return smoothly.',
    simpleExplanationAr:
      'عند تثبيت حبل المقاومة خلفك بمستوى الصدر تزداد المقاومة تدريجياً كلما امتدت ذراعاك للأمام، ليبلغ الشد ذروته في نهاية الدفع. تمنحك الوقفة المتباعدة ثباتاً أمام سحب الحبل للخلف، مما يسمح بدفع منضبط مع مقاومة سرعة الارتداد.',
    tipsEn: [
      'Step far enough forward so the band already carries noticeable tension at the chest start position.',
      'Keep bands running cleanly underneath or alongside your forearms—not rubbing your shoulders.',
      'Hold peak lockout forward for 1 full second to capitalize on maximum band tension.',
    ],
    tipsAr: [
      'تقدم للأمام مسافة كافية حتى تشعر بشد واضح في الحبل منذ نقطة البداية عند الصدر.',
      'مرّر الحبل أسفل الساعدين أو بمحاذاة الذراعين لئلا يحتك بالكتف والرقبة.',
      'ثبّت الدفع للأمام لمدة ثانية كاملة للاستفادة من أعلى مقاومة للحبل في القمة.',
    ],
    avoidEn: [
      'Standing too close to the anchor where the band goes completely slack at the start.',
      'Letting the elastic tension snap your elbows backward fast.',
      'Twisting your hips sideways instead of pressing symmetrically.',
    ],
    avoidAr: [
      'الوقوف قريباً جداً من نقطة التثبيت بحيث يرتخي الحبل عند الصدر.',
      'الاستسلام لمطاطية الحبل وتركه يسحب ذراعيك للخلف بسرعة.',
      'ميلان الجذع أو التفاف الوركين بدلاً من ثبات الوسط.',
    ],
  },
  'dumbbell-bench-press': {
    stepImage: stepDumbbellBenchPress,
    stepCaptionsEn: [
      'Lie back kicking dumbbells up with thighs, pin shoulder blades down, and angle wrists ~15–30° inward.',
      'Lower dumbbells slowly alongside mid-chest with vertical forearms until a deep chest stretch.',
      'Drive upward along a gentle inward arc without banging dumbbells together at the top.',
    ],
    stepCaptionsAr: [
      'استلقِ مستعيناً بالفخذين لرفع الدامبل، ثبّت لوحي الكتف، وأمل اليدين للداخل قليلاً (~15–30°).',
      'أنزل الدامبل بتحكم بجانبي منتصف الصدر مع بقاء الساعدين عموديين حتى تمدد واضح.',
      'ادفع للأعلى في قوس خفيف للداخل دون صدم الدامبل ببعضهما في القمة.',
    ],
    simpleExplanationEn:
      'Lying flat with a dumbbell in each hand lets your wrists rotate into a comfortable neutral-diagonal angle and gives your chest a deeper bottom stretch than a straight barbell can reach. Press smoothly upward along a gentle inward arc while keeping your shoulder blades anchored to the pad.',
    simpleExplanationAr:
      'يتيح الدامبل على المقعد المستوي لليدين والمرفقين اتخاذ زاوية طبيعية مريحة للمفاصل، كما يسمح بنزول أعمق بجانبي الصدر لعدم وجود بار يعترض الصدر. تدفع الدامبل للأعلى في قوس طفيف للداخل دون صدمهما مع تثبيت لوحي الكتف بقوة على المقعد.',
    tipsEn: [
      'Kick dumbbells up cleanly with your thighs as you lie back—and bring knees up to catch them when done.',
      'Lower dumbbells just outside mid-chest until you feel a clear, comfortable pectoral stretch.',
      'Keep forearms perpendicular to the floor throughout both descent and press.',
    ],
    tipsAr: [
      'استعن بدفعة فخذيك لرفع الدامبل عند الاستلقاء، وارفع ركبتيك لاستقبالهما بأمان عند الانتهاء.',
      'أنزل الدامبل بجانبي منتصف الصدر حتى تشعر بتمدد واضح ومريح في ألياف الصدر.',
      'حافظ على بقاء الساعدين عموديين على الأرض طوال النزول والدفع.',
    ],
    avoidEn: [
      'Banging dumbbells together at the top, which jars joints and kills muscle tension.',
      'Dropping heavy dumbbells sideways off the bench with straight arms.',
      'Flaring elbows wide and lifting shoulders up toward your ears.',
    ],
    avoidAr: [
      'اصطدام الدامبل ببعضهما في الأعلى مما يشتت التوازن ويفقدك التوتر العضلي.',
      'رمي الدامبل للجانبين بذراعين ممدودتين من الأعلى مما يعرض الكتف للإصابة.',
      'فتح المرفقين 90° أو رفع الكتفين للأعلى نحو الأذنين.',
    ],
  },
  'incline-barbell-press': {
    stepImage: stepInclineBarbellPress,
    stepCaptionsEn: [
      'Set bench ~30°, anchor upper back into pad, and hold barbell vertically over collarbone.',
      'Lower bar over 2–3s to touch upper chest just below collarbone with ~45° elbow tuck.',
      'Drive evenly upward back over your shoulders without lifting hips or bouncing off bone.',
    ],
    stepCaptionsAr: [
      'اضبط المقعد على ~30°، ثبّت أعلى ظهرك على المسند، واحمل البار عمودياً فوق الترقوة.',
      'أنزل البار ببطء خلال 2–3 ثوانٍ ليلامس أعلى الصدر أسفل الترقوة بمرفقين ~45°.',
      'ادفع للأعلى باستقامة فوق الكتفين دون رفع الأرداف أو ارتداد على العظم.',
    ],
    simpleExplanationEn:
      'An inclined bench (~30°) aligns your upper sternum underneath a straight barbell so heavy progressive loading targets the clavicular chest. The bar descends smoothly to just below your collarbone with elbows tucked ~45° and returns straight back up over the upper shoulder line.',
    simpleExplanationAr:
      'يضع المقعد المائل (بزاوية ~30°) أعلى الصدر في المسار العمودي المباشر للبار الحديدي، مما يتيح تحميل أوزان ثقيلة ومتدرجة لتكبير الصدر العلوي. ينزل البار بتحكم ليلمس أعلى الصدر أسفل الترقوة بمرفقين بزاوية ~45° ثم يُدفع عمودياً للأعلى.',
    tipsEn: [
      'Keep your eyes slightly behind the bar on setup so unracking clears the uprights cleanly.',
      'Lower to the upper chest (~2–4 cm below collarbone), never down toward your lower ribs.',
      'Brace upper back tightly into the angled pad and press symmetrically.',
    ],
    tipsAr: [
      'اجعل نظرك أسفل البار قليلاً عند التهيئة لتفادي اصطدام البار بالحوامل عند إخراجه.',
      'أنزل البار إلى أعلى الصدر (أسفل الترقوة بنحو 2–4 سم) لا إلى أسفل الصدر.',
      'اضغط أعلى ظهرك بقوة على المسند المائل وادفع البار بتوازن متساوٍ.',
    ],
    avoidEn: [
      'Bouncing the barbell off the fragile collarbone area.',
      'Setting incline steep (45–60°+), making front delts take most of the load.',
      'Lifting your hips off the seat pad to turn the angle flat.',
    ],
    avoidAr: [
      'ضرب البار بعظمة الترقوة أو الارتداد به من الأسفل.',
      'استخدام مقعد شديد الانحدار (45–60° فأكثر) يحوّل التركيز للكتف.',
      'رفع الأرداف عن المقعد لتقليص زاوية الميل وتحويل الضغط إلى وضع مستوٍ.',
    ],
  },
  'pec-deck-machine': {
    stepImage: stepPecDeck,
    stepCaptionsEn: [
      'Adjust seat so arms align mid-chest, keep chest lifted and shoulders pinned down against pad.',
      'Sweep arms inward focusing on bringing elbows together across your chest midline.',
      'Squeeze hard for 1 full second at peak closure, then open slowly to comfortable stretch.',
    ],
    stepCaptionsAr: [
      'اضبط المقعد بمستوى منتصف الصدر، ارفع صدرك وثبّت كتفيك للخلف وللأسفل على المسند.',
      'اجمع الذراعين للداخل بالتركيز على تقريب المرفقين نحو منتصف الصدر.',
      'اعصر العضلة لثانية كاملة في المنتصف ثم افتح ببطء حتى إطالة مريحة.',
    ],
    simpleExplanationEn:
      'Seated upright with back support, the pec-deck guides your arms along a fixed horizontal arc so no stabilizing muscles steal effort from your chest. Focus on driving your inner elbows toward each other—not flexing your wrists—and control the opening stretch without letting shoulders roll forward.',
    simpleExplanationAr:
      'يوفّر جهاز الفراشة ثباتاً كاملاً للظهر ويقيد الذراعين في مسار قوسي ثابت يعزل عضلة الصدر بنسبة عالية. بدلاً من عصر اليدين أو ثني المعصمين، ركّز على تقريب المرفقين نحو بعضهما في المنتصف مع مقاومة فتح الذراعين ببطء.',
    tipsEn: [
      'Adjust seat height so upper arms sit slightly below shoulder level (around mid-chest height).',
      'Pin shoulder blades back into the pad and push sternum forward throughout the set.',
      'Hold a hard 1-second contraction when pads or handles meet in front.',
    ],
    tipsAr: [
      'اضبط المقعد بحيث تكون الذراعان بمستوى منتصف الصدر (أخفض قليلاً من الكتفين).',
      'ثبّت لوحي الكتف للخلف على المسند وارفع الصدر للأمام طوال الحركة.',
      'توقف لثانية واحدة عند التقاء الذراعين في المنتصف لشد عضلة الصدر بعمق.',
    ],
    avoidEn: [
      'Setting the starting pins too far back behind your shoulders, straining the front joint.',
      'Hunching shoulders forward off the pad as your hands close.',
      'Letting weights slam at the end of the negative phase.',
    ],
    avoidAr: [
      'ضبط مدى البداية للخلف أكثر من مرونة كتفك مما يؤلم مفصل الكتف.',
      'تقديم الكتفين للأمام وتقويس الظهر عند إغلاق المقابض.',
      'إفلات الوزن في مرحلة الفتح وترك الألواح ترتطم بقوة.',
    ],
  },
  'chest-dips': {
    stepImage: stepChestDips,
    stepCaptionsEn: [
      'Support weight on parallel bars, lean torso ~20–30° forward, and bend knees slightly back.',
      'Lower under control until shoulders dip just below elbows with elbows angled ~45° back.',
      'Drive powerfully up while pushing shoulders down away from ears and keeping forward lean.',
    ],
    stepCaptionsAr: [
      'ارفع جسمك على المتوازي، مِل بالجذع للأمام ~20–30° واثنِ الركبتين قليلاً للخلف.',
      'انزل بتحكم حتى ينخفض الكتفان قليلاً عن مستوى المرفقين دون فتحهما بعنف.',
      'ادفع بقوة للأعلى مع إبقاء الميلان الأمامي وخفض الكتفين بعيداً عن الأذنين.',
    ],
    simpleExplanationEn:
      'Supporting your entire body weight between parallel bars, leaning your torso forward ~20–30° shifts mechanical leverage from the triceps onto the lower chest. Descend smoothly until your shoulders dip just below elbow level while keeping elbows angled gently outward/back, then drive powerfully up.',
    simpleExplanationAr:
      'أثناء تعلّقك على المتوازي، يؤدي إمالة الجذع للأمام بنحو 20–30° مع ثني الركبتين للخلف إلى وضع ألياف الصدر السفلي في مواجهة الجاذبية مباشرة. تنزل بتحكم حتى يصبح الكتفان بمستوى المرفقين أو أخفض قليلاً مع توجيه المرفقين للخلف والخارج بتوازن، ثم تدفع للأعلى.',
    tipsEn: [
      'Maintain a steady 20–30° forward torso lean from top to bottom—do not stay vertical.',
      'Push shoulders down away from your ears forcefully at the top lockout.',
      'Add weight via dip belt only after achieving 10–12 clean full-depth bodyweight reps.',
    ],
    tipsAr: [
      'حافظ على ميلان الجذع للأمام (20–30°) طوال الصعود والنزول لأن الوقوف عمودياً ينقل الجهد للترايسبس.',
      'ادفع الكتفين للأسفل بعيداً عن الأذنين في نهاية الصعود لتثبيت المفصل.',
      'لا تضف أوزاناً إضافية إلا بعد إتقان 10–12 تكراراً بوزن الجسم بمدى كامل.',
    ],
    avoidEn: [
      'Dropping too deep quickly before shoulder flexibility allows it.',
      'Shrugging shoulders into your neck at the bottom position.',
      'Kicking legs forward and backward to swing through hard reps.',
    ],
    avoidAr: [
      'الهبوط السريع والعميق جداً بما يفوق مرونة مفصل الكتف.',
      'غوص الرأس بين الكتفين وارتخاء لوحي الكتف في أسفل الحركة.',
      'أرجحة الساقين لاكتساب زخم يعوض ضعف العضلة.',
    ],
  },

  // BACK
  'lat-pulldown': {
    stepImage: stepLatPulldown,
    stepCaptionsEn: [
      'Lock thighs firmly under the pad, grip slightly wider than shoulders, and stretch lats fully overhead.',
      'Initiate by pulling shoulder blades down away from ears, then drive elbows vertically down toward your hips.',
      'Bring the bar cleanly to your upper chest with torso leaning back just 10–15°, squeeze lats, and return slowly.',
    ],
    stepCaptionsAr: [
      'ثبّت الفخذين بإحكام تحت الوسادة، أمسك البار أعرض قليلاً من الكتفين، وافرد الذراعين لإطالة العضلة الظهرية العريضة.',
      'ابدأ بخفض لوحي الكتف للأسفل أولاً ثم اسحب المرفقين عمودياً نحو الجانبين والخصر.',
      'صل بالبار إلى أعلى الصدر مع ميلان طفيف جداً (10–15°)، اعصر الظهر، ثم اصعد ببطء وتحكم.',
    ],
    simpleExplanationEn:
      'Think of your arms simply as hooks connecting the bar to your back: you start the pull by depressing your shoulder blades downward before bending your elbows. Pulling the bar vertically in front of your face to your upper chest contracts the latissimus dorsi cleanly from full overhead stretch to peak squeeze.',
    simpleExplanationAr:
      'ابدأ بخفض كتفيك للأسفل أولاً ثم اسحب البار بمرفقيك نحو أعلى الصدر أمام وجهك (وليس خلف الرقبة) مع ميل طفيف جداً للخلف. ركّز على شد عضلات الظهر عند النزول، ثم اصعد بذراعيك ببطء حتى يمتد الظهر بالكامل في الأعلى.',
    tipsEn: [
      'Avoid an overly wide snatch grip; slightly outside shoulder width gives the best lat range and leverage.',
      'Keep your chest lifted toward the bar as it descends rather than caving shoulders forward.',
      'Control the upward return for 2–3 seconds until your shoulders gently elevate into a full lat stretch.',
    ],
    tipsAr: [
      'تجنب المسكة الواسعة جداً؛ المسكة الأعـرض قليلاً من الكتفين تعطيك أفضل مدى حركي وأقوى سحب للظهر.',
      'ارفع صدرك للأعلى باتجاه البار أثناء النزول ولا تدع الكتفين ينحنيان للأمام.',
      'اصعد بتحكم خلال 2–3 ثوانٍ حتى تمتد الذراعان والكتفان في الأعلى بالكامل.',
    ],
    avoidEn: [
      'Pulling the bar behind your head/neck, which stresses cervical discs and rotator cuffs.',
      'Swinging your torso far backward past 30° to turn a pulldown into a momentum row.',
      'Stopping the upward stretch early around forehead height.',
    ],
    avoidAr: [
      'سحب البار خلف الرأس والرقبة لأنه يضع ضغطاً غير آمن على الرقبة ومفصل الكتف.',
      'إرجاع الظهر للخلف بقوة للاستعانة بوزن الجسم في السحب.',
      'إيقاف الصعود عند مستوى الرأس دون تمديد كامل للذراعين والظهر.',
    ],
  },
  'barbell-bent-over-row': {
    stepImage: stepBarbellRow,
    stepCaptionsEn: [
      'Stand hip-width, grip bar outside knees, and hinge hips back to ~45° torso angle with flat locked spine.',
      'Drive elbows up and backward along your sides, pulling the bar cleanly toward your lower chest / upper abs.',
      'Pause briefly squeezing shoulder blades together against your torso, then lower under control without rounding back.',
    ],
    stepCaptionsAr: [
      'قف بعرض الورك، أمسك البار أعرض من الركبتين، وانحنِ من الورك بزاوية ~45° مع ظهر مسطح ومشدود.',
      'ادفع المرفقين للأعلى وللخلف بمحاذاة الجذع لسحب البار نحو أسفل الصدر وأعلى البطن.',
      'ثبّت لحظة في القمة مع ضم لوحي الكتف، ثم أنزل البار بتحكم دون تقويس أسفل الظهر.',
    ],
    simpleExplanationEn:
      'Hinging forward at roughly 45° puts your upper back and lats horizontally under gravity while your hamstrings, glutes, and spinal erectors hold your torso steady. Instead of lifting with your biceps, drive your elbows backward toward your hips so the bar meets your upper stomach/lower chest squarely.',
    simpleExplanationAr:
      'الانحناء من مفصل الورك بزاوية تقارب 45° يضع عضلات الظهر والظهرية العريضة أفقياً في مواجهة الجاذبية، بينما يثبّت الجذع والوركان استقامة العمود الفقري. بدلاً من السحب بالذراعين، تقود الحركة بسحب مرفقيك للأعلى وللخلف ليصل البار إلى أسفل الصدر أو أعلى البطن، مما يبني سماكة وقوة الظهر بالكامل.',
    tipsEn: [
      'Keep your torso angle constant throughout the set—do not stand upright as weight rises.',
      'Brace your core and pack your lats tight before lifting the first rep.',
      'Pull to lower ribcage for upper/mid-back emphasis, or toward belly button for more lats.',
    ],
    tipsAr: [
      'حافظ على ثبات زاوية انحناء الجذع طوال الجولة ولا ترفع صدرك للأعلى أثناء السحب.',
      'اشدد عضلات البطن كدعامة واقية وثبّت العمود الفقري مسطحاً قبل أول تكرار.',
      'السحب نحو أسفل الصدر يركز أكثر على منتصف الظهر، ونحو السرة يركز أكثر على العضلة الظهرية العريضة.',
    ],
    avoidEn: [
      'Rounding your lumbar spine under heavy barbell weight.',
      'Using knee bounce and torso heave to jerk the bar upward.',
      'Shrugging shoulders into your ears instead of pulling shoulder blades back and down.',
    ],
    avoidAr: [
      'تقوّس أسفل الظهر تحت ثقل البار مما يسبب ضغطاً خطراً على الظهر.',
      'القفز بالركبتين وأرجحة الظهر للأعلى لرفع وزن زائد بالاندفاع.',
      'رفع الأكتاف نحو الأذنين بدلاً من سحب لوحي الكتف للخلف.',
    ],
  },
  'seated-cable-row': {
    stepImage: stepSeatedCableRow,
    stepCaptionsEn: [
      'Sit tall with knees softly bent, neutral spine, and arms stretched smoothly forward holding the handle.',
      'Pull elbows straight back close to your ribs while lifting your chest toward the handle.',
      'Touch handle lightly to upper abdomen, squeeze mid-back for 1s, then extend forward smoothly without back rounding.',
    ],
    stepCaptionsAr: [
      'اجلس باستقامة مع ثني خفيف للركبتين ومد الذراعين للأمام مع إبقاء الظهر مشدوداً.',
      'اسحب المرفقين للخلف بمحاذاة أضلاعك مع إبقاء الصدر مرتفعاً نحو المقبض.',
      'ثبّت المقبض لحظة عند أعلى البطن مع ضم منتصف الظهر، ثم عد للأمام بتحكم دون تقويس أسفل الظهر.',
    ],
    simpleExplanationEn:
      'Seated horizontally with feet braced on the footplate, the cable pulls straight forward against your mid-back and lats. Keep your torso upright like a pillar while gliding your shoulder blades forward into a controlled stretch, then pulling elbows cleanly past your ribs to squeeze your mid-back together.',
    simpleExplanationAr:
      'بجلوسك مستقيماً وتثبيت قدميك على المنصة، يسحبك الكابل للأمام أفقياً عبر خط منتصف الظهر. تحافظ على الجذع ثابتاً ومستقيماً: تمد لوحي الكتف للأمام في البداية بإطالة متحكم بها دون تقويس أسفل الظهر، ثم تسحب مرفقيك للخلف بمحاذاة الجذع حتى تقترب يدك من أعلى البطن وتضم لوحي الكتف بقوة.',
    tipsEn: [
      'Allow your shoulder blades—not your lower back—to protract forward at the front stretch.',
      'Keep shoulders pressed down away from your ears throughout every squeeze.',
      'Pause 0.5–1 second with the handle touching your torso before releasing forward.',
    ],
    tipsAr: [
      'اسمح للوحي الكتف فقط بالانزلاق للأمام للإطالة في البداية، وأبقِ أسفل الظهر ثابتاً تماماً.',
      'اخفض الكتفين بعيداً عن الأذنين أثناء ضم الظهر في النهاية.',
      'توقف نصف ثانية إلى ثانية عند ملامسة المقبض لبطنك قبل العودة ببطء.',
    ],
    avoidEn: [
      'Rocking torso back and forth like a rowing machine race.',
      'Shrugging upper traps up around your neck as you pull heavy.',
      'Flaring elbows wide out sideways when using a narrow V-grip.',
    ],
    avoidAr: [
      'التأرجح المبالغ فيه بالجذع للأمام والخلف لرفع الأوزان الثقيلة.',
      'رفع الكتفين نحو الأذنين في نهاية السحبة.',
      'فتح المرفقين للجانبين أثناء استخدام المقبض الضيق.',
    ],
  },
  'single-arm-dumbbell-row': {
    stepImage: stepDumbbellRow,
    stepCaptionsEn: [
      'Plant one hand and knee solidly on a bench with torso flat and dumbbell hanging straight below shoulder.',
      'Sweep the dumbbell backward in a slight arc toward your hip pocket, driving the elbow high beside your ribs.',
      'Hold peak lat squeeze briefly at hip height, then lower all the way down into a smooth shoulder-blade stretch.',
    ],
    stepCaptionsAr: [
      'ثبّت يداً وركبة بإحكام على المقعد بحيث يوازي جذعك الأرض وتتدلى الذراع الأخرى عمودياً.',
      'اسحب الدامبل في قوس طفيف للخلف نحو مستوى الورك بقيادة المرفق بمحاذاة الجذع.',
      'توقف لحظة عند أقصى انقباض بجانب الورك ثم انزل بتحكم حتى إطالة كاملة للوح الكتف.',
    ],
    simpleExplanationEn:
      'Bracing one arm and leg on a bench removes lower-back strain and gives you complete freedom to pull one side at a time. Rather than lifting the dumbbell straight up into your armpit (which hits arms/rear delts), sweep it back in an arc toward your hip pocket to isolate the latissimus dorsi deeply.',
    simpleExplanationAr:
      'إسناد يد وركبة على المقعد يزيل العبء عن أسفل الظهر ويتيح لك التركيز على جانب واحد بمدى حركي واسع. السر في هذا التمرين هو سحب الدامبل في مسار قوسي للخلف باتجاه الورك بدلاً من رفعه عمودياً نحو الإبط، مما يضع أقصى حمل على العضلة الظهرية العريضة من الإطالة السفلية حتى الانقباض.',
    tipsEn: [
      'Keep hips and shoulders square to the floor—avoid rotating open just to heave the weight.',
      'Let the dumbbell drop gently forward/down an extra couple centimeters at the bottom to stretch the lat.',
      'Push your supporting hand actively into the bench so your torso stays rock solid.',
    ],
    tipsAr: [
      'أبقِ الكتفين والوركين موازيين للأرض دون لف الجذع للأعلى لتسهيل الرفعة.',
      'اسمح للكتف بالنزول ببطء في الأسفل لتحقيق إطالة كاملة للظهر قبل السحب التالي.',
      'ادفع المقعد باليد المساندة بثبات حتى لا يتأرجح جذعك.',
    ],
    avoidEn: [
      'Twisting your torso like starting a lawnmower to swing heavy dumbbells.',
      'Collapsing your lower back downward or rounding your shoulders.',
      'Pulling straight upward toward your shoulder with heavy bicep curl flexion.',
    ],
    avoidAr: [
      'لف الجذع بعنف للأعلى لتعويض ثقل الوزن.',
      'تقويس الظهر أو ارتخاء الكتف المستند على المقعد.',
      'ثني الذراع للأعلى نحو الكتف فقط مما يحوّل الحمل إلى البايسبس.',
    ],
  },
  'pull-ups': {
    stepImage: stepPullUps,
    stepCaptionsEn: [
      'Hang calmly with overhand grip wider than shoulders, core braced, and ankles crossed softly if helpful.',
      'Depress shoulder blades first and pull your chest upward toward the bar by driving elbows down to your ribs.',
      'Clear your chin smoothly above the bar, pause briefly, and lower over 2–3s to full arm extension.',
    ],
    stepCaptionsAr: [
      'تعلّق بثبات بقبضة أمامية أعرض قليلاً من الكتفين مع شد البطن والأرداف لمنع التأرجح.',
      'اخفض لوحي الكتف أولاً ثم اسحب صدرك نحو البار بدفع المرفقين للأسفل نحو الأضلاع.',
      'تجاوز البار بذقنك أو أعلى صدرك بثبات، ثم انزل بتحكم خلال 2–3 ثوانٍ حتى فرد الذراعين.',
    ],
    simpleExplanationEn:
      'Hanging vertically under gravity, you pull your entire torso upward toward the bar rather than pulling a bar down to you. Beginning each rep by depressing your shoulder blades and aiming your upper chest at the bar engages the full lat sweep and mid-back stabilizers far better than struggling just to poke your chin over.',
    simpleExplanationAr:
      'في هذا التمرين ترفع وزن جسمك بالكامل للأعلى. ابدأ بشد الكتفين للأسفل ثم اسحب مرفقيك نحو أضلاعك مع توجيه أعلى الصدر نحو البار (وليس مجرد مد الذقن بالرقبة)، وانزل ببطء حتى تستقيم ذراعاك لتعمل عضلات الظهر بمداها الكامل.',
    tipsEn: [
      'Think "elbows into back pockets" and aim your upper chest—not just your chin—toward the bar.',
      'Brace abs lightly with feet slightly in front of your torso (hollow body) to stop swinging.',
      'Lower all the way down under control; negatives build strength fast if reps are limited.',
    ],
    tipsAr: [
      'وجّه أعلى صدرك نحو البار وفكر في سحب المرفقين نحو أضلاعك وليس مجرد رفع الرأس.',
      'اشدد البطن واجعل القدمين متقدمتين قليلاً للأمام لمنع تأرجح الجسم.',
      'انزل ببطء حتى استقامة الذراعين؛ النزول البطيء يبني قوة العقلة بسرعة.',
    ],
    avoidEn: [
      'Kipping legs or jerking hips to swing upward.',
      'Stopping halfway down so arms stay bent 90° between reps.',
      'Rolling shoulders forward at the top instead of keeping chest open.',
    ],
    avoidAr: [
      'أرجحة الركبتين والوركين للقفز للأعلى.',
      'التوقف في منتصف النزول وحرمان الظهر من التمديد الكامل في الأسفل.',
      'تقويس الكتفين للأمام عند القمة بدلاً من فتح الصدر نحو البار.',
    ],
  },
  'chest-supported-row-machine': {
    stepImage: stepChestSupportedRow,
    stepCaptionsEn: [
      'Adjust seat and chest pad so ribs rest firmly against support while hands reach handles comfortably.',
      'Pull handles straight back with elbows tucked beside torso, squeezing shoulder blades cleanly together.',
      'Pause 1s at peak contraction without lifting chest off pad, then extend arms smoothly forward.',
    ],
    stepCaptionsAr: [
      'اضبط المقعد ومسند الصدر ليستند القفص الصدري بإحكام مع وصول مريح للمقابض.',
      'اسحب المقابض للخلف بمحاذاة الجذع واضغط لوحي الكتف معاً في المنتصف.',
      'توقف ثانية واحدة مع بقاء الصدر ملاصقاً للمسند، ثم أعد الذراعين للأمام ببطء.',
    ],
    simpleExplanationEn:
      'With your chest locked tightly against the pad, lower-back momentum becomes mechanically impossible. Every pull forces your rhomboids, middle traps, rear delts, and lats to move the load purely across the shoulder blades, making it ideal for pushing back training safely to high effort.',
    simpleExplanationAr:
      'تثبيت الصدر على المسند الأمامي يمنع ظهرك من التأرجح تماماً ويزيل الحمل القطني، فتتحول القوة كاملة إلى عضلات الظهر العلوي والأوسط والعضلة الظهرية العريضة. تمدد الذراعين للأمام بتحكم حتى ينفتح لوحا الكتف، ثم تسحب المرفقين للخلف لعصر المنتصف دون أن يفارق صدرك المسند لحظة واحدة.',
    tipsEn: [
      'Adjust seat height so the handles track smoothly toward your lower sternum / mid-ribs.',
      'Use a neutral grip for more lats, or wider pronated grip to hammer upper back & rear delts.',
      'Keep sternum glued onto the top edge of the pad throughout peak contraction.',
    ],
    tipsAr: [
      'اضبط المقعد لتتحرك المقابض نحو أسفل الصدر أو أعلى البطن براحة.',
      'المقبض المحايد الضيق يستهدف العضلة الظهرية العريضة أكثر، والمقبض العريض يركز على أعلى الظهر والكتف الخلفي.',
      'أبقِ القفص الصدري ملاصقاً للمسند طوال السحب ولا تفصله عنه عند الذروة.',
    ],
    avoidEn: [
      'Pushing your chest off the pad at the top to lean backward for extra inches.',
      'Shrugging shoulders upward toward your ears.',
      'Letting weight plates drop rapidly forward.',
    ],
    avoidAr: [
      'رفع الصدر عن الوسادة والاتكاء للخلف لإنهاء السحبة.',
      'رفع الأكتاف للأعلى نحو الرقبة أثناء السحب.',
      'ترك الأوزان ترتد للأمام بسرعة دون مقاومة.',
    ],
  },
  'resistance-band-row': {
    stepImage: stepBandRow,
    stepCaptionsEn: [
      'Sit tall with legs straight, knees soft, and loop the band securely under mid-arch of both shoes.',
      'Pull handles smoothly toward your lower ribs while driving elbows back and chest upright.',
      'Squeeze shoulder blades together for 1 full second, then return slowly maintaining band stretch.',
    ],
    stepCaptionsAr: [
      'اجلس باستقامة ولف الحبل بإحكام حول منتصف باطن القدمين مع ثني خفيف للركبتين.',
      'اسحب المقبضين نحو أسفل الأضلاع مع دفع المرفقين للخلف ورفع الصدر.',
      'اعصر لوحي الكتف معاً لمدة ثانية كاملة ثم عد ببطء دون ارتخاء الحبل.',
    ],
    simpleExplanationEn:
      'Anchored around the soles of your feet, the elastic band provides smooth progressive tension that peaks right as your shoulder blades squeeze together at the torso. Maintaining an upright, rigid spine lets you train horizontal back contraction effectively anywhere with minimal setup.',
    simpleExplanationAr:
      'يلتف حبل المقاومة حول باطن القدمين لتتحول المقاومة أفقياً مقابل جذعك؛ وكلما سحبت للخلف ازداد الشد ليبلغ أقصاه تماماً لحظة ضم لوحي الكتف. الحفاظ على ظهر مستقيم وصدر مرفوع يضمن تركيز السحب في منتصف الظهر والعضلة الظهرية العريضة في أي مكان.',
    tipsEn: [
      'Wrap the band once or grip closer toward your feet if resistance feels too light at start.',
      'Lead with elbows close to your ribs and pause 1s at peak contraction.',
      'Sit on a folded towel or mat cushion if hamstrings feel too tight to keep spine straight.',
    ],
    tipsAr: [
      'أمسك الحبل من نقطة أقرب للقدمين أو لفه مرة واحدة لزيادة المقاومة عند الحاجة.',
      'قُد السحب بالمرفقين بمحاذاة الجذع وتوقف ثانية في النهاية لاستثمار أقصى شد للحبل.',
      'اجلس على وسادة رفيعة إذا كان شد الفخذ الخلفي يمنعك من استقامة الظهر.',
    ],
    avoidEn: [
      'Slumping your spine into a rounded posture while seated on the floor.',
      'Hooking the band only over your toe tips where it can snap toward your face.',
      'Rushing back and forth with tiny jerky movements.',
    ],
    avoidAr: [
      'انحناء وتقوّس الظهر للأمام أثناء الجلوس على الأرض.',
      'وضع الحبل على أطراف الأصابع فقط مما يعرضه للانفلات نحوك.',
      'السحب السريع العشوائي دون توقف عند الانقباض.',
    ],
  },
  'chin-ups': {
    stepImage: stepChinUps,
    stepCaptionsEn: [
      'Hang with a shoulder-width underhand (palms-facing-you) grip, core tight and legs steady.',
      'Depress shoulders and pull elbows straight down in front of your torso toward your lower ribs.',
      'Bring upper chest near the bar cleanly, pause briefly, and lower over 2–3s to full extension.',
    ],
    stepCaptionsAr: [
      'تعلّق بقبضة معكوسة (راحتا اليد نحوك) بعرض الكتفين مع شد البطن وثبات الساقين.',
      'اخفض الكتفين واسحب المرفقين للأسفل أمام الجذع نحو أضلاعك.',
      'اقترب بأعلى صدرك من البار بثبات، ثم انزل ببطء خلال 2–3 ثوانٍ حتى فرد الذراعين.',
    ],
    simpleExplanationEn:
      'Using an underhand grip rotates your elbows forward into a strong mechanical line for both the lats and the biceps. Pull your chest upward toward the bar with elbows traveling straight down in front of your ribs, giving you one of the strongest bodyweight movements for back width and arm thickness.',
    simpleExplanationAr:
      'تضع القبضة المعكوسة (راحتا اليد نحوك) المرفقين في مسار أمامي قوي يجمع بين أقصى تفعيل للعضلة الظهرية العريضة وأقوى مشاركة لعضلة البايسبس. ترفع صدرك نحو البار بسحب المرفقين للأسفل أمام الجذع وتنزل بتحكم كامل، ما يجعله من أفضل تمارين الجزء العلوي بوزن الجسم.',
    tipsEn: [
      'Use a grip right at shoulder width—too narrow can pinch wrists, too wide weakens leverage.',
      'Focus on bringing your chest up to meet the bar rather than curling just your head over.',
      'Control the descent all the way down to near-straight elbows on every single rep.',
    ],
    tipsAr: [
      'اجعل المسافة بين اليدين بعرض الكتفين تماماً لحماية المعصمين وتحقيق أقوى سحب.',
      'ارفع الصدر باتجاه البار مع إبقاء المرفقين قريبين من الجذع لا متباعدين.',
      'اهبط بتحكم حتى استقامة الذراعين تقريباً في كل تكرار دون اختصار المدى.',
    ],
    avoidEn: [
      'Cutting out the bottom half of the movement so biceps stay cramped.',
      'Swinging knees up toward your chest to jump over the bar.',
      'Letting shoulders roll inward at the top instead of pulling chest open.',
    ],
    avoidAr: [
      'النزول النصفي الذي يحرم عضلات الظهر من التمديد الكامل في الأسفل.',
      'رفع الركبتين بقوة أو أرجحة الساقين لاكتساب اندفاع.',
      'تقويس الكتفين للأمام في الأعلى بدلاً من فتح الصدر للبار.',
    ],
  },
  'pendlay-row': {
    stepImage: stepPendlayRow,
    stepCaptionsEn: [
      'Set torso nearly parallel to the floor with barbell resting dead on the floor over mid-foot and spine locked flat.',
      'Pull the bar powerfully off the floor straight up to touch your lower sternum / upper abdomen.',
      'Lower the bar under control all the way back to a complete rest on the floor and reset brace before rep 2.',
    ],
    stepCaptionsAr: [
      'ثبّت الجذع شبه موازٍ للأرض والبار مستقر تماماً على الأرض فوق منتصف القدم بظهر مستقيم ومشدود.',
      'اسحب البار بقوة وثبات عمودياً نحو أسفل الصدر وأعلى البطن.',
      'أنزل البار بتحكم ليستقر تماماً على الأرض وأعد ضبط شد الظهر قبل كل تكرار جديد.',
    ],
    simpleExplanationEn:
      'Unlike standard bent-over rows where the bar stays suspended, every Pendlay row starts from a dead stop on the floor with your torso parallel to the ground. Pulling explosively from dead rest builds tremendous upper-back power, scapular retraction, and strict form since you reset your back position between every single rep.',
    simpleExplanationAr:
      'على عكس التجديف المعتاد الذي يبقى فيه البار معلقاً، يبدأ كل تكرار هنا من ثبات تام للبار على الأرض مع بقاء الجذع شبه موازٍ للأرض. تسحب البار بقوة إلى أسفل الصدر ثم تعيده للاستقرار على الأرض وتعيد ضبط شد الظهر في كل مرة، مما يبني قوة سحب خاماً وسماكة عالية للظهر دون تأرجح.',
    tipsEn: [
      'Use full-size 20 kg bumper/45 lb plates (or elevate slightly) so bar starts at proper shin height.',
      'Pull the slack and brace core hard before each explosive pull—torso angle stays horizontal.',
      'Touch your torso cleanly with the bar before controlling it back to the floor.',
    ],
    tipsAr: [
      'استخدم أقراصاً بقطر قياسي (أو ارفع البار قليلاً على مساند) ليبدأ من الارتفاع الصحيح أمام الساق.',
      'اشدد الجذع والظهر قبل كل سحبة وحافظ على بقاء الجذع أفقياً دون ارتفاع الصدر.',
      'تأكد من ملامسة البار لجذعك في الأعلى قبل إنزاله بتحكم إلى الأرض.',
    ],
    avoidEn: [
      'Standing up taller with each rep until it turns into an upright shrug-row.',
      'Rounding the lower back to reach down to the plates.',
      'Bouncing the barbell violently off the floor without pausing to reset.',
    ],
    avoidAr: [
      'رفع زاوية الجذع للأعلى تدريجياً مع التعب بدلاً من بقائه موازياً للأرض.',
      'تقويس أسفل الظهر للوصول إلى البار على الأرض.',
      'ضرب البار بالأرض للارتداد السريع بدلاً من التوقف التام وإعادة الضبط.',
    ],
  },

  // SHOULDERS
  'overhead-barbell-press': {
    stepImage: stepOverheadPress,
    stepCaptionsEn: [
      'Rack bar across front delts with hands just outside shoulders, vertical forearms, glutes and abs locked tight.',
      'Tuck chin back slightly and press straight upward—pushing your head gently forward once the bar passes your forehead.',
      'Lock out directly over shoulders and mid-foot with arms straight, then lower smoothly back to clavicle.',
    ],
    stepCaptionsAr: [
      'أرح البار على الكتفين الأماميين بقبضة أعرض قليلاً من الكتفين مع ساعدين عموديين وشد الأرداف والبطن.',
      'أرجع ذقنك قليلاً وادفع البار عمودياً للأعلى، ثم قدّم رأسك برفق فور تجاوزه الجبهة.',
      'ثبّت البار عمودياً فوق الكتفين ومنتصف القدم، ثم أنزله بتحكم إلى مستوى الترقوة.',
    ],
    simpleExplanationEn:
      'Standing upright with no back pad, your entire body acts as a rigid base while pressing the barbell vertically overhead. Because the bar must clear your face before stacking directly over your center of gravity, you tuck your chin slightly back on the way up and nudge your torso/head smoothly through once the bar passes your forehead.',
    simpleExplanationAr:
      'أثناء وقوفك دون مسند ظهر، يعمل جسمك كله كقاعدة صلبة بشد الأرداف والبطن لمنع تقوّس الظهر. يتحرك البار في خط عمودي مستقيم: ترجع ذقنك قليلاً للخلف ليمر البار أمام وجهك بسلام، وفور تجاوز الجبهة تقدم رأسك قليلاً للأمام ليستقر البار فوق الكتفين ومنتصف الجسم تماماً، مما يبني قوة وحجم الأكتاف والترايسبس.',
    tipsEn: [
      'Keep elbows positioned slightly in front of the bar (not flared behind) at the starting rack position.',
      'Squeeze glutes and brace your ribcage down hard before pushing—zero lumbar arch.',
      'Keep wrists neutral rather than bent far backward under the barbell.',
    ],
    tipsAr: [
      'قدّم المرفقين قليلاً أمام البار في نقطة البداية ليكون الساعدان عموديين على الأرض.',
      'اشدد الأرداف والبطن جيداً قبل الدفع لحماية أسفل الظهر.',
      'حافظ على استقامة المعصمين وتجنب ثنيهما للخلف تحت ثقل البار.',
    ],
    avoidEn: [
      'Leaning your torso far backward and turning the lift into a standing incline bench press.',
      'Pressing the bar out in front of your head away from your mid-foot balance line.',
      'Using knee bounce unless deliberately performing a push press.',
    ],
    avoidAr: [
      'الانحناء للخلف وتقويس أسفل الظهر لتعويض ثقل الوزن.',
      'دفع البار للأمام بعيداً عن خط توازن الجسم فوق الرأس.',
      'ثني الركبتين للدفع بالاندفاع ما لم تكن تنفذ تمرين الضغط الدفعي عن عمد.',
    ],
  },
  'seated-dumbbell-shoulder-press': {
    stepImage: stepSeatedDbPress,
    stepCaptionsEn: [
      'Set bench to ~80–85°; kick dumbbells to shoulder height with elbows angled ~20–30° forward.',
      'Press both dumbbells upward along a natural slightly inward path without arching off the pad.',
      'Stop just short of clanking dumbbells overhead, then lower smoothly to ear/shoulder level over 2–3s.',
    ],
    stepCaptionsAr: [
      'اضبط المقعد بزاوية ~80–85° وارفع الدامبل لمستوى الأذنين مع تقديم المرفقين للأمام بنحو 20–30°.',
      'ادفع الدامبل للأعلى في مسار طبيعي مائل قليلاً للداخل مع إبقاء الظهر ثابتاً على المسند.',
      'توقف قبل تصادم الدامبل في الأعلى ثم انزل بتحكم خلال 2–3 ثوانٍ حتى مستوى الكتفين والأذنين.',
    ],
    simpleExplanationEn:
      'Seated against a nearly vertical backrest removes leg drive and lower-back fatigue so your front and side deltoids do pure pressing work. Angling your elbows ~20–30° forward into the scapular plane aligns the shoulder joint naturally, letting you lower deeper safely and press overhead comfortably.',
    simpleExplanationAr:
      'الجلوس على مسند شبه عمودي (80–85°) يزيل مساعدة الساقين وتشتت التوازن ليتحمل الكتفان الأمامي والجانبي الجهد كاملاً. تقديم المرفقين للأمام قليلاً (20–30° في مستوى لوح الكتف) يحمي مفصل الكتف من الاحتكاك ويتيح لك النزول لمستوى الأذنين والدفع للأعلى بسلاسة وراحة.',
    tipsEn: [
      'Set the bench one notch shy of 90° (~80–85°) rather than dead straight vertical for smoother shoulder mechanics.',
      'Keep forearms stacked vertically underneath each dumbbell from bottom to top.',
      'Keep your lower back and glutes pressed firmly into the bench pad throughout the set.',
    ],
    tipsAr: [
      'اضبط مسند الظهر أقل بدرجة واحدة من العمودي (~80–85°) بدلاً من 90° تماماً لحركة أكتاف أريح.',
      'أبقِ الساعدين عموديين تحت الدامبل في كل نقطة من النزول والدفع.',
      'ثبّت أسفل الظهر والأرداف ملتصقين بالمقعد طوال التكرارات.',
    ],
    avoidEn: [
      'Flaring elbows straight back at 180° aligned with your ears, irritating the shoulder capsule.',
      'Arching your lower back heavily off the backrest on tough reps.',
      'Cutting range of motion short at forehead height or banging dumbbells together.',
    ],
    avoidAr: [
      'فتح المرفقين تماماً للجانبين بمحاذاة الأذنين لأن ذلك يضغط على مفصل الكتف.',
      'تقويس أسفل الظهر وفصله عن المسند عند زيادة الوزن.',
      'النزول السطحي لمستوى العين فقط أو صدم الدامبل في الأعلى.',
    ],
  },
  'dumbbell-lateral-raise': {
    stepImage: stepLateralRaise,
    stepCaptionsEn: [
      'Stand tall holding dumbbells beside your hips with a soft 15° elbow bend and shoulders pressed down.',
      'Sweep arms outward ~20–30° forward (scapular plane), reaching toward the walls rather than shrugging up.',
      'Pause briefly at shoulder height parallel to the floor, then lower slowly over 2–3s resisting gravity.',
    ],
    stepCaptionsAr: [
      'قف باستقامة مع حمل الدامبل على الجانبين، ثني خفيف ثابت للمرفق (~15°)، وخفض الكتفين للأسفل.',
      'ارفع الذراعين للخارج وللأمام قليلاً (~20–30°) وكأنك تبعدهما نحو الجدارين دون رفع الترابيس.',
      'توقف لحظة عند مستوى الكتف بموازاة الأرض، ثم أنزل الوزن ببطء خلال 2–3 ثوانٍ.',
    ],
    simpleExplanationEn:
      'Instead of lifting weights upward with your neck and traps, think of sweeping your hands outward toward opposite walls in a wide arc. Raising slightly forward (~20–30° in front of your torso) matches the true anatomical plane of the shoulder blade, loading the side deltoid cleanly without shoulder pinching.',
    simpleExplanationAr:
      'بدلاً من رفع الكتفين للأعلى برقبتك، تخيّل أنك تدفع الدامبل للخارج بعيداً نحو الجدارين. رفع الذراعين للأمام قليلاً (~20–30° أمام مستوى الجسم) يضع الحمل على الكتف الجانبي مباشرة ويريح المفصل، مع ضرورة النزول ببطء لأن الفائدة الأكبر تكون عند التحكم في الهبوط.',
    tipsEn: [
      'Pick a lighter weight you can control—lateral delts respond best to strict form and 10–20 controlled reps.',
      'Keep your torso very slightly hinged forward (~5–10°) and let elbows stay level with wrists.',
      'Stop just shy of resting dumbbells against your thighs so tension remains active at the bottom.',
    ],
    tipsAr: [
      'اختر وزناً متوسطاً أو خفيفاً يمكنك التحكم به؛ الكتف الجانبي يستجيب للأداء النظيف (10–20 تكراراً) لا للأوزان الثقيلة.',
      'انحنِ بجذعك للأمام قليلاً جداً (5–10°) وحافظ على بقاء المرفقين بمستوى المعصمين.',
      'أوقف النزول قبيل ملامسة الفخذين بقليل لإبقاء الشد مستمراً على العضلة.',
    ],
    avoidEn: [
      'Swinging hips and legs to fling dumbbells above shoulder height.',
      'Shrugging traps upward toward your ears on every single raise.',
      'Turning thumbs sharply downward ("pouring water"), which jams rotator cuff tendons.',
    ],
    avoidAr: [
      'أرجحة الوركين والجذع لرفع أوزان ثقيلة لا يستطيع الكتف الجانبي حملها.',
      'سحب الكتفين للأعلى نحو الأذنين مما ينقل الجهد للترابيس.',
      'تدوير الإبهامين للأسفل بقوة (حركة سكب الإبريق) لأنها تضغط أوتار الكتف.',
    ],
  },
  'cable-face-pull': {
    stepImage: stepFacePull,
    stepCaptionsEn: [
      'Set pulley at eye/upper-chest height, grip rope thumbs pointing back, and step back into a split stance.',
      'Pull the rope ends apart toward your forehead while driving elbows high and back at shoulder level.',
      'Rotate forearms upward at the finish so knuckles point back/up, squeeze rear delts 1s, then extend smoothly.',
    ],
    stepCaptionsAr: [
      'اضبط البكرة بمستوى العين أو أعلى الصدر، أمسك الحبل بحيث يتجه الإبهامان للخلف، وتراجع خطوة متزنة.',
      'اسحب طرفي الحبل متباعدين نحو جبهتك مع إبقاء المرفقين عاليين بمستوى الكتفين.',
      'أدر الساعدين للأعلى في النهاية واشدد الكتف الخلفي وأعلى الظهر لثانية، ثم عد للأمام ببطء.',
    ],
    simpleExplanationEn:
      'Pulling the rope toward your forehead while externally rotating your forearms upward at the end trains both the rear deltoids and the rotator cuff muscles that pull rounded shoulders back into healthy posture. Keep the weight moderate so your upper back and rear shoulders—not body lean—guide the rope.',
    simpleExplanationAr:
      'سحب الحبل نحو الجبهة مع فتح طرفيه وتدوير الساعدين للأعلى في نهاية الحركة يقوّي الكتف الخلفي والعضلات الداعمة لمفصل الكتف، ويساعد في استقامة الأكتاف. اختر وزناً متوسطاً يتيح لك التحكم الكامل دون إرجاع ظهرك للخلف.',
    tipsEn: [
      'Finish every rep in a "double biceps" pose so your forearms externally rotate vertically.',
      'Keep ribs stacked down—do not arch your lower back backward as you pull.',
      'Let shoulders reach calmly forward on the return for a controlled upper-back stretch.',
    ],
    tipsAr: [
      'انهِ كل تكرار بوضعية تشبه استعراض العضلات بحيث تكون اليدان بجانب الأذنين وأعلى من المرفقين.',
      'حافظ على شد البطن وتجنب تقويس أسفل الظهر للخلف أثناء السحب.',
      'دع الذراعين تمتدان للأمام بتحكم في نهاية كل تكرار دون إفلات الوزن.',
    ],
    avoidEn: [
      'Stacking heavy weight that forces you to lean way back and row with your lats.',
      'Pulling elbows downward toward your chest instead of keeping them high at shoulder level.',
      'Holding the rope thumbs-forward and failing to pull the rope ends apart.',
    ],
    avoidAr: [
      'استخدام وزن ثقيل يجبرك على إرجاع جسمك للخلف وتحويله إلى تجديف عادي.',
      'خفض المرفقين للأسفل نحو الصدر بدلاً من إبقائهما عاليين بمستوى الكتف.',
      'ترك طرفي الحبل متلاصقين بدلاً من فتحهما للخارج نحو الأذنين.',
    ],
  },
  'cable-lateral-raise': {
    stepImage: stepCableLateralRaise,
    stepCaptionsEn: [
      'Set pulley to the lowest notch, hold the upright post with one hand, and grip the handle in front of your body with your far hand.',
      'Sweep the working arm outward smoothly ~20–30° forward with elbow slightly soft.',
      'Pause briefly at shoulder height parallel to floor, then lower slowly resisting constant cable pull.',
    ],
    stepCaptionsAr: [
      'اضبط البكرة على أدنى مستوى، امسك عمود الجهاز بيدك القريبة، وأمسك المقبض أمام جسمك باليد البعيدة.',
      'ارفع الذراع للجانب وللأمام قليلاً (~20–30°) بسلاسة مع ثني طفيف للمرفق.',
      'توقف لحظة عند مستوى الكتف بموازاة الأرض، ثم أنزل الذراع ببطء ضد سحب الكابل المستمر.',
    ],
    simpleExplanationEn:
      'Unlike dumbbells where gravity pulls straight down and offers almost zero resistance near your legs, the angled cable pulls sideways right from the starting point. That keeps high tension on the lateral deltoid through the bottom half as well as the top.',
    simpleExplanationAr:
      'على عكس الدامبل الذي تقل مقاومته عندما تكون الذراع بجانب الفخذ، يسحب الكابل ذراعك جانبياً منذ اللحظة الأولى. هذا يبقي الشد مستمراً وقوياً على الكتف الجانبي من أسفل الحركة حتى القمة، بشرط ثبات جذعك دون تأرجح.',
    tipsEn: [
      'Stand slightly stepped out from the pulley so the weight stack never rests down between reps.',
      'Lean very slightly away toward the open side while holding the upright post to anchor your torso.',
      'Focus on pushing the handle outward across the room rather than hiking your shoulder upward.',
    ],
    tipsAr: [
      'ابتعد خطوة صغيرة عن البكرة بحيث لا ترتطم الألواح ببعضها عند نزول ذراعك للأسفل.',
      'أمسك عمود الجهاز بيدك الأخرى ومِل قليلاً لتثبيت الجذع ومنع أرجحة الوركين.',
      'ركّز على دفع اليد للخارج بمدى واسع لا على رفع الكتف للأعلى.',
    ],
    avoidEn: [
      'Snatching the handle upward off the weight stack with body swing.',
      'Letting the cable yank your arm across your torso uncontrollably at the bottom.',
      'Raising high past shoulder height with upper traps doing the finish.',
    ],
    avoidAr: [
      'سحب المقبض بسرعة في بداية الرفع باستخدام تأرجح الجذع.',
      'السماح للكابل بسحب ذراعك للداخل بعنف في نهاية النزول.',
      'رفع الذراع أعلى من مستوى الكتف وإشراك عضلات الرقبة والترابيس.',
    ],
  },
  'smith-overhead-press': {
    stepImage: stepSmithOverheadPress,
    stepCaptionsEn: [
      'Center an upright bench inside the Smith frame so the bar travels cleanly ~2–3 cm in front of your nose.',
      'Unlatch the bar, lower smoothly under control to chin/upper-clavicle height with vertical forearms.',
      'Drive upward cleanly to near-straight arms without leaning back off the pad.',
    ],
    stepCaptionsAr: [
      'ضع مقعداً عمودياً داخل جهاز السميث بحيث يمر البار أمام الأنف بنحو 2–3 سم بسلاسة.',
      'حرّر قفل الأمان وأنزل البار بتحكم حتى مستوى الذقن أو أعلى الترقوة مع ساعدين عموديين.',
      'ادفع للأعلى باستقامة حتى يقترب الذراعان من الفرد الكامل مع بقاء الظهر مسنوداً على المقعد.',
    ],
    simpleExplanationEn:
      'Pressing along the fixed vertical guide of the Smith machine removes forward-backward bar drift so you can load the front and side deltoids heavily with zero spotter needed. Careful bench positioning ensures your forearms stay perpendicular under the bar throughout the entire press.',
    simpleExplanationAr:
      'يوفر المسار الحديدي الموجه في جهاز السميث استقامة تلقائية للبار دون الحاجة للقلق من فقدان التوازن للأمام أو الخلف، مما يتيح تحميل الأكتاف بأوزان أعلى وأمان أكبر. السر في دقة التمرين هو ضبط موقع المقعد بحيث يمر البار قريباً من الوجه مع بقاء الساعدين عموديين تماماً تحت البار.',
    tipsEn: [
      'Set lower safety stops around chin/shoulder level before putting heavy weight on the bar.',
      'Position your torso slightly back (~80–85° pad) so your chin easily clears the vertical path.',
      'Keep elbows angled slightly forward under the bar rather than flared behind your shoulders.',
    ],
    tipsAr: [
      'اضبط مصدّات الأمان السفلية على مستوى الذقن أو الكتف قبل تحميل الأوزان.',
      'اجعل زاوية المسند ~80–85° لتتحرك الذقن بحرية دون الاضطرار لإرجاع الرأس كثيراً.',
      'أبقِ المرفقين متقدمين قليلاً تحت البار لحماية الكتف وتوليد دفع أقوى.',
    ],
    avoidEn: [
      'Sitting too far forward so you press behind your line of force, or too far back pressing in front.',
      'Overarching your lumbar spine off the bench pad.',
      'Bouncing reps off the lower safety pins.',
    ],
    avoidAr: [
      'الجلوس للأمام أو للخلف كثيراً مما يفسد عمودية الساعدين تحت البار.',
      'تقويس أسفل الظهر وفصله عن المسند لدفع الوزن.',
      'ارتداد البار عن مصدّات الأمان السفلية بدلاً من التحكم.',
    ],
  },
  'machine-lateral-raise': {
    stepImage: stepMachineLateralRaise,
    stepCaptionsEn: [
      'Adjust seat so shoulder joints align with the machine pivot, rest elbows/forearms on pads, and grip handles lightly.',
      'Drive outward and upward through your elbows/outer arms until upper arms sit parallel to floor.',
      'Pause briefly at horizontal height, then lower arms smoothly without dropping the weight stack.',
    ],
    stepCaptionsAr: [
      'اضبط ارتفاع المقعد ليتحاذى كتفاك مع محور الجهاز، وأسند المرفقين والساعدين على الوسادات مع مسكة خفيفة.',
      'ادفع للخارج وللأعلى بالمرفقين والذراعين حتى توازي الذراعان الأرض.',
      'توقف لحظة في القمة ثم أنزل الأذرع ببطء دون ترك الأوزان تصطدم ببعضها.',
    ],
    simpleExplanationEn:
      'Because your torso is seated and pads contact your outer arms directly, the machine prevents forearm or body momentum from helping. Aligning your shoulder joint with the machine pivot ensures smooth resistance across the full arc of the side deltoid.',
    simpleExplanationAr:
      'الجلوس على الجهاز وإسناد المرفقين على الوسادات يمنع أي أرجحة بالجسم أو مساعدة من القبضة. بمجرد ضبط ارتفاع المقعد مع محور الجهاز، تتركز المقاومة بشكل مباشر وسلس على عضلة الكتف الجانبي من البداية حتى التوازي.',
    tipsEn: [
      'Press outward strictly through your elbows/forearms and keep hands relaxed.',
      'Keep shoulder blades pressed down—never shrug upward toward your ears.',
      'Control a 2–3 second lowering phase back to your sides.',
    ],
    tipsAr: [
      'ركّز على الدفع بالمرفقين والساعدين ضد الوسادة مع إرخاء قبضة اليدين.',
      'أبقِ الكتفين منخفضين بعيداً عن الأذنين طوال الدفع والرجوع.',
      'تحكم في النزول لمدة 2–3 ثوانٍ دون ترك الوزن يهبط بسرعة.',
    ],
    avoidEn: [
      'Skipping seat adjustment so your shoulder sits way above or below the machine pivot.',
      'Leaning your chest heavily forward to cheat the lift upward.',
      'Slamming the weight stack at the bottom of every rep.',
    ],
    avoidAr: [
      'البدء دون ضبط المقعد مما يسبب ضغطاً غير مريح على المفصل لعدم تطابق المحورين.',
      'الميل بالصدر للأمام بقوة لإعطاء دفعة إضافية للوزن.',
      'إفلات الأذرع لتصطدم الأوزان في الأسفل بين التكرارات.',
    ],
  },
  'rear-delt-machine-fly': {
    stepImage: stepRearDeltFly,
    stepCaptionsEn: [
      'Sit facing the chest pad, set handles at shoulder height, and grip comfortably with soft elbow bend.',
      'Sweep arms wide backward in a broad arc—not pinching shoulder blades hard—until inline with torso.',
      'Pause briefly feeling the rear shoulder contract, then return slowly keeping tension on the back of the shoulder.',
    ],
    stepCaptionsAr: [
      'اجلس مواجهاً لمسند الصدر، واضبط المقابض بمستوى الكتفين مع ثني خفيف ثابت للمرفق.',
      'افتح الذراعين للخلف في قوس واسع حتى محاذاة الجذع (دون عصر قوي للوحي الكتف).',
      'ثبّت لحظة عند أقصى انقباض للكتف الخلفي ثم عد للأمام ببطء دون إرخاء.',
    ],
    simpleExplanationEn:
      'Sitting chest-supported isolates the small posterior deltoid on the back of your shoulder. Unlike a mid-back row where you squeeze your shoulder blades tightly inward, think of pushing your knuckles wide outward toward the walls so the rear shoulder—rather than the mid-traps—handles the work.',
    simpleExplanationAr:
      'الجلوس مع إسناد الصدر يعزل عضلة الكتف الخلفي الصغيرة دون تدخل الظهر السفلي. الفرق الجوهري عن تمارين الظهر هو عدم عصر لوحي الكتف للداخل بقوة، بل التفكير في "إبعاد اليدين للخارج في قوس واسع" حتى يتركز الحمل في مؤخرة الكتف بدلاً من سرقته بواسطة عضلات منتصف الظهر.',
    tipsEn: [
      'Use a neutral (thumbs-up) or pronated (palms-down) grip depending on which makes you feel rear delts best.',
      'Imagine reaching outward toward opposite walls as your arms sweep backward.',
      'Stop the backward sweep once your arms align with your torso—no need to hyperextend behind your back.',
    ],
    tipsAr: [
      'استخدم القبضة المحايدة (الإبهام للأعلى) أو المقلوبة (راحة اليد للأسفل) بحسب أيهما يمنحك شعوراً أوضح بالكتف الخلفي.',
      'فكّر في مد الذراعين للخارج بعيداً نحو الجدارين لا سحبهما للخلف نحو العمود الفقري.',
      'توقف بمجرد وصول ذراعيك لمحاذاة الجذع دون إرجاعهما خلف ظهرك كثيراً.',
    ],
    avoidEn: [
      'Crushing shoulder blades together like a back row, turning it into a trap/rhomboid exercise.',
      'Lifting your chest off the pad to swing heavy weight backward.',
      'Using excessive weight that forces bent elbows and jerky half-reps.',
    ],
    avoidAr: [
      'ضم لوحي الكتف للداخل بقوة مما يحوّل التمرين إلى تجديف لمنتصف الظهر.',
      'فصل الصدر عن المسند وأرجحة الجسم للخلف.',
      'استخدام وزن ثقيل يضطرك لثني المرفقين وأداء حركة مقطوعة.',
    ],
  },

  // BICEPS
  'barbell-bicep-curl': {
    stepImage: stepBicepCurl,
    stepCaptionsEn: [
      'Stand tall gripping the bar underhand at shoulder width with upper arms tucked calmly against your sides.',
      'Flex strictly at the elbows to curl the bar smoothly upward toward upper-chest level without swinging hips.',
      'Squeeze biceps hard for 1s at peak contraction, then lower steadily over 2–3s to nearly straight arms.',
    ],
    stepCaptionsAr: [
      'قف باستقامة ممسكاً البار بقبضة سفلية بعرض الكتفين مع تثبيت العضدين بجانب جذعك.',
      'ارفع البار للأعلى بثني مفصل المرفق فقط دون تحريك المرفقين أو تأرجح الظهر.',
      'اعصر البايسبس بقوة لمدة ثانية في الأعلى ثم أنزل البار ببطء خلال 2–3 ثوانٍ حتى شبه استقامة.',
    ],
    simpleExplanationEn:
      'The biceps primary job is flexing the elbow against gravity, so your upper arms must act like fixed pillars pinned at your sides. Stand braced through your core and glutes while curling the bar smoothly up to your chest, then fight gravity on the 2–3 second descent—where half the muscle-building stimulus happens.',
    simpleExplanationAr:
      'الوظيفة الأساسية للبايسبس هي ثني مفصل المرفق؛ ولذلك يجب أن يبقى العضدان (من الكتف حتى المرفق) ثابتين كالأعمدة بجانب جذعك. اشدد البطن والأرداف لمنع تأرجح الظهر، وارفع البار بانسيابية حتى أقصى انقباض، ثم قاوم الجاذبية بنزول بطيء (2–3 ثوانٍ) حتى شبه استقامة الذراع لتفعيل كامل الألياف.',
    tipsEn: [
      'Use an EZ-curl bar if a straight bar puts uncomfortable strain on your wrists or forearms.',
      'Keep wrists straight/flat rather than curling them inward at the top.',
      'Pause momentarily just before full elbow extension at the bottom—no bouncing.',
    ],
    tipsAr: [
      'استخدم البار المتعرج إذا شعرت بأي ضغط غير مريح في المعصمين مع البار المستقيم.',
      'حافظ على استقامة المعصمين وتجنب ثنيهما للداخل عند قمة الرفعة.',
      'توقف لحظة بسيطة في الأسفل قبل الرفع التالي لمنع الاستعانة بارتداد المرفق.',
    ],
    avoidEn: [
      'Swinging hips forward and leaning your lower back backward to heave the bar up.',
      'Shoving elbows high in front of your chest to let front delts finish the curl.',
      'Dropping the barbell rapidly down after peak contraction.',
    ],
    avoidAr: [
      'أرجحة الوركين والظهر للخلف لرفع أوزان تفوق قوة البايسبس.',
      'رفع المرفقين للأمام وللأعلى كثيراً مما يسرق الجهد نحو الكتف الأمامي.',
      'إفلات البار للأسفل بسرعة بعد القمة دون تحكم أثناء النزول.',
    ],
  },
  'incline-dumbbell-curl': {
    stepImage: stepInclineCurl,
    stepCaptionsEn: [
      'Recline on a 45–60° bench and let arms hang vertically straight down behind your torso line.',
      'Keeping upper arms pointing straight at the floor, curl dumbbells smoothly upward toward shoulders.',
      'Squeeze biceps briefly at top, then lower slowly all the way back to a full hanging stretch.',
    ],
    stepCaptionsAr: [
      'استلقِ على مقعد مائل 45–60° ودع الذراعين تتدليان عمودياً خلف خط الجذع تماماً.',
      'مع بقاء المرفقين متجهين نحو الأرض، ارفع الدامبل للأعلى بثني المرفقين فقط.',
      'توقف لحظة في الأعلى ثم انزل ببطء حتى تعود الذراعان إلى أقصى تمدد عمودي.',
    ],
    simpleExplanationEn:
      'Letting your arms hang slightly behind your torso on an incline bench stretches the biceps deeply right from the bottom before you even bend your elbows. Keep your elbows pointing straight down instead of swinging them forward so the bicep works hard through the entire range.',
    simpleExplanationAr:
      'الاستلقاء على المقعد المائل مع ترك ذراعيك متدليتين للخلف يعطي عضلة البايسبس إطالة قوية منذ بداية الحركة. حافظ على ثبات مرفقيك متجهين للأسفل دون تقديمهما للأمام أثناء الرفع لتحصل على أقصى استهداف وتكوير للبايسبس.',
    tipsEn: [
      'Start with a slightly lighter dumbbell weight than standing curls due to the stretched lever.',
      'Rest the back of your head calmly on the bench pad throughout the entire set.',
      'Rotate palms gradually upward (supinate) as you curl up to contract biceps harder.',
    ],
    tipsAr: [
      'ابدأ بوزن أخف قليلاً من تمرين الوقوف لأن وضع التمدد الخلفي يجعل الرفع أصعب.',
      'أرح رأسك وأعلى ظهرك على المسند طوال التكرارات ولا ترفعهما للمساعدة.',
      'أدر راحة اليد للأعلى تدريجياً أثناء الصعود لتحقيق عصر أقوى في القمة.',
    ],
    avoidEn: [
      'Swinging elbows forward in front of your body, which instantly destroys the shoulder stretch.',
      'Setting the bench flat (<35°) if your anterior shoulder feels pinched.',
      'Rushing the bottom stretch without extending arms cleanly.',
    ],
    avoidAr: [
      'تقديم المرفقين للأمام أثناء الصعود لأن ذلك يلغي الفائدة الأساسية للوضع المائل.',
      'ضبط المقعد مسطحاً جداً (<35°) إذا سبب لك شداً مزعجاً في الكتف الأمامي.',
      'عدم مد الذراعين بالكامل في الأسفل والاستعجال في البدء بالتكرار التالي.',
    ],
  },
  'hammer-curl': {
    stepImage: stepHammerCurl,
    stepCaptionsEn: [
      'Stand upright holding dumbbells with palms facing your thighs (thumbs pointing forward/up) and elbows locked at sides.',
      'Curl dumbbells upward keeping wrists completely neutral like swinging a hammer—no forearm twisting.',
      'Pause briefly near front shoulder height, then lower slowly under control.',
    ],
    stepCaptionsAr: [
      'قف باستقامة ممسكاً الدامبل براحتي يد متقابلتين (الإبهام للأمام) وتثبيت المرفقين بجانبيك.',
      'ارفع الدامبل للأعلى مع بقاء القبضة محايدة تماماً كالمطرقة دون تدوير المعصم.',
      'توقف لحظة قرب مستوى الكتف ثم أنزل الوزن ببطء وتحكم حتى الأسفل.',
    ],
    simpleExplanationEn:
      'Keeping your palms facing inward places the biceps in a neutral angle that recruits the brachialis (underneath the biceps) and the thick brachioradialis forearm muscle heavily. Because those muscles bridge the side of your arm, hammer curls add noticeable overall arm thickness and elbow stability.',
    simpleExplanationAr:
      'إبقاء راحتي اليد متقابلتين (وضعية المطرقة) يوزّع الجهد بقوة على العضلة العضدية (أسفل البايسبس والتي تدفعها للخارج فتبدو أكبر) وعلى عضلة الساعد العلوية. تحافظ على ثبات المرفقين بجانبيك وترفع بتحكم دون تدوير المعصم، ما يمنح الذراع سماكة جانبية وقوة قبضة واضحة.',
    tipsEn: [
      'Curl both arms together or alternate smoothly—just prevent your torso from twisting side to side.',
      'Keep wrists straight and firm so the forearm muscles work isometrically in line.',
      'Lower cleanly all the way down without resting weights against your legs.',
    ],
    tipsAr: [
      'يمكنك الرفع بكلتا اليدين معاً أو بالتبادل المنضبط دون التفاف الجذع يميناً ويساراً.',
      'حافظ على صلابة واستقامة المعصم ليظل الساعد على خط واحد مع الدامبل.',
      'انزل بتحكم حتى أسفل المدى دون إسناد الدامبل على الفخذين للراحة.',
    ],
    avoidEn: [
      'Turning thumbs outward halfway up into a normal supinated bicep curl.',
      'Swaying torso and shoulders rhythmically with heavy weights.',
      'Swinging dumbbells cross-body awkwardly toward the opposite shoulder unless intended.',
    ],
    avoidAr: [
      'تدوير المعصم للخارج في منتصف الحركة وتحويله إلى تمرين بايسبس عادي.',
      'تأرجح الكتفين والظهر لإدخال أوزان تفوق تحكم الذراع.',
      'ترك الدامبل يرتد من الأسفل بسرعة دون توقف لحظي.',
    ],
  },
  'cable-bicep-curl': {
    stepImage: stepCableBicepCurl,
    stepCaptionsEn: [
      'Step ~40 cm back from a low pulley holding straight or EZ attachment underhand with arms straight under tension.',
      'Pin elbows steadily by your sides and curl the handle cleanly up toward your collarbones.',
      'Squeeze biceps hard for 1 second at top contraction, then lower smoothly resisting the cable.',
    ],
    stepCaptionsAr: [
      'تراجع خطوة صغيرة عن البكرة السفلية ممسكاً المقبض بقبضة سفلية والذراعان ممدودتان تحت شد مستمر.',
      'ثبّت المرفقين بجانب الجذع وارفع المقبض بسلاسة نحو أعلى الصدر.',
      'اعصر البايسبس لثانية واحدة في القمة ثم أنزل بتحكم مع مقاومة سحب الكابل.',
    ],
    simpleExplanationEn:
      'Free weights feel almost effortless at the very top and very bottom of a curl, whereas a low cable pulley pulls continuously across the entire arc. Taking one small step back ensures your biceps are already loaded at full arm extension and remain under steady tension through peak squeeze.',
    simpleExplanationAr:
      'بفضل خط سحب الكابل المائل قليلاً للأمام، لا توجد أي نقطة راحة في هذا التمرين: تبقى البايسبس تحت شد متواصل منذ بداية استقامة الذراع في الأسفل وحتى أقصى انقباض في الأعلى. خذ خطوة صغيرة للخلف لبدء المقاومة فوراً، ثم تحكم في النزول دون إفلات الوزن.',
    tipsEn: [
      'Step back far enough so the weight plates lift slightly off the stack even with arms hanging straight.',
      'Keep shoulder blades gently set back—do not let the cable drag your shoulders forward.',
      'Control the final few inches of lowering where biceps are fully stretched.',
    ],
    tipsAr: [
      'تراجع للخلف مسافة تجعل لوح الوزن يرتفع عن القاعدة قليلاً حتى والذراعان مفرودتان.',
      'ثبّت كتفيك للخلف ولا تدع سحب الكابل يجرّهما للأمام في نهاية النزول.',
      'تحكم جيداً في السنتيمترات الأخيرة من النزول حيث تصل العضلة لأقصى إطالة.',
    ],
    avoidEn: [
      'Standing right over the pulley so tension drops to zero at the bottom.',
      'Leaning your torso backward like a tug-of-war to curl heavy weight.',
      'Clanking the weight stack down between repetitions.',
    ],
    avoidAr: [
      'الوقوف ملاصقاً للبكرة بحيث يرتخي السحب تماماً في أسفل الحركة.',
      'إرجاع الجذع للخلف بعنف كأنك تسحب حبلاً ثقيلًا بالظهر.',
      'إسقاط الألواح لتصطدم ببعضها بعد كل تكرار.',
    ],
  },
  'machine-preacher-curl': {
    stepImage: stepPreacherCurl,
    stepCaptionsEn: [
      'Adjust seat so armpits rest snugly over the top edge of the angled pad and upper arms lie flat.',
      'Curl handles smoothly upward keeping triceps glued to the pad—do not lift elbows.',
      'Pause briefly at top contraction, then lower over 2–3s stopping just shy of violent elbow hyperextension.',
    ],
    stepCaptionsAr: [
      'اضبط المقعد ليستقر الإبطان فوق الحافة العلوية للوسادة مع ملاصقة العضدين للسطح المائل.',
      'ارفع المقبضين للأعلى بثني المرفقين فقط مع بقاء الذراعين العلويين ملتصقين بالوسادة.',
      'ثبّت لحظة في القمة ثم انزل خلال 2–3 ثوانٍ وتوقف قبيل فرد المرفق بعنف في الأسفل.',
    ],
    simpleExplanationEn:
      'Bracing the backs of your upper arms against an angled preacher pad makes swinging your torso or moving your elbows physically impossible. Resistance peaks most sharply in the bottom half of the movement, forcing pure biceps strength out of the stretched position.',
    simpleExplanationAr:
      'إسناد خلفية العضدين على الوسادة المائلة يمنع جسمك ومرفقيك من أي حركة مساعدة تماماً، ليتحمل البايسبس كامل الحمل دون أي تحايل حركي. يبلغ التوتر ذروته هنا في النصف السفلي من الحركة، لذلك احرص على نزول بطيء متحكم به لحماية أوتار المرفق في وضع التمدد.',
    tipsEn: [
      'Verify seat height before grabbing handles—shoulders should stay relaxed, not pushed up by the pad.',
      'Focus on driving your wrists smoothly upward while pushing upper arms gently into the pad.',
      'Control the bottom inch slowly rather than dropping down onto your joints.',
    ],
    tipsAr: [
      'اضبط ارتفاع المقعد أولاً لتجلس بأريحية دون انضغاط الإبط أو ارتفاع الكتفين.',
      'أبقِ ظهر العضدين ملامساً للوسادة طوال الحركة ولا ترفع مرفقيك للأعلى عند السحب.',
      'هدّئ السرعة في آخر مدى للنزول ولا تدع الوزن يهوي على مفصل المرفق.',
    ],
    avoidEn: [
      'Lifting hips out of the seat or peeling elbows off the pad on heavy reps.',
      'Snapping elbows into full locked hyperextension under heavy load.',
      'Cutting reps halfway up where machine leverage drops.',
    ],
    avoidAr: [
      'الوقوف عن المقعد أو رفع المرفقين عن الوسادة لإنهاء التكرارات.',
      'إرخاء المرفق بعنف عند تمام الفرد في الأسفل تحت وزن ثقيل.',
      'الاكتفاء بنصف الحركة العلوي وترك النصف السفلي الأهم.',
    ],
  },

  // TRICEPS & FOREARMS
  'cable-tricep-pushdown': {
    stepImage: stepTricepPushdown,
    stepCaptionsEn: [
      'Stand with a slight 10–15° forward lean, elbows locked firmly against your ribs, rope held at chest height.',
      'Extend forearms smoothly downward—splitting the rope ends slightly outward as you approach your thighs.',
      'Squeeze triceps fully at bottom lockout for 1s, then let forearms rise high (~past 90°) without lifting elbows.',
    ],
    stepCaptionsAr: [
      'قف بميل طفيف للأمام (10–15°) مع تثبيت المرفقين بجانب أضلاعك واليدين بمستوى الصدر.',
      'ادفع الساعدين للأسفل مع فتح طرفي الحبل قليلاً للخارج عند الاقتراب من الفخذين.',
      'اعصر الترايسبس تماماً في الأسفل ثانية ثم اصعد بالساعدين أعلى من 90° قليلاً مع ثبات المرفقين.',
    ],
    simpleExplanationEn:
      'With upper arms pinned like fixed hinges against your sides, only your forearms move downward through elbow extension. Using a rope lets you split your hands slightly apart beside your thighs at the bottom, triggering a strong contraction across the lateral and medial heads of the triceps.',
    simpleExplanationAr:
      'تُثبّت العضدان بجانب أضلاعك كأنهما محور مفصل ثابت لا يتحرك للأمام أو الخلف، وتقتصر الحركة على مد الساعدين للأسفل عبر مفصل المرفق فقط. يساعدك الحبل في فتح اليدين قليلاً بجانب الفخذين في نهاية الدفع لتحقيق أقصى عصر لعضلات الترايسبس الجانبية والوسطى.',
    tipsEn: [
      'Let your forearms rise smoothly above parallel on the way up for a clean stretch without elbows moving forward.',
      'Keep shoulders rolled back and chest lifted—do not hunch over the rope.',
      'Hold full elbow extension beside your hips for a clear 0.5–1 second squeeze.',
    ],
    tipsAr: [
      'اسمح للساعدين بالصعود أعلى من زاوية 90° قليلاً لتحقيق إطالة جيدة دون أن يرتفع المرفقان للأمام.',
      'أبقِ الصدر مرفوعاً والكتفين للخلف ولا تنحنِ بظهرك فوق الحبل.',
      'ثبّت فرد الذراعين بالكامل في الأسفل لنصف ثانية لتعزيز انقباض الترايسبس.',
    ],
    avoidEn: [
      'Leaning your whole body weight onto the rope like doing dips.',
      'Letting elbows drift forward and backward on every rep (turning it into a lat pulldown).',
      'Cutting the upward stretch short at 90° forearm angle.',
    ],
    avoidAr: [
      'الاتكاء بوزن الجسم والكتفين فوق الحبل لدفع أوزان ثقيلة.',
      'تحريك المرفقين للأمام والخلف مع كل تكرار (ما يسرق الجهد للظهر والصدر).',
      'عدم السماح للساعدين بالصعود للأعلى بما يكفي في مرحلة العودة.',
    ],
  },
  'overhead-cable-tricep-extension': {
    stepImage: stepOverheadTricep,
    stepCaptionsEn: [
      'Face away from a low-to-mid pulley (waist height) in a split stance, torso leaned slightly forward, hands behind head.',
      'Keep upper arms pointed steadily forward/upward and extend forearms smoothly straight ahead.',
      'Squeeze triceps cleanly at extension, then let rope pull forearms deep behind head for full stretch.',
    ],
    stepCaptionsAr: [
      'قف بظهرك للجهاز مع ضبط البكرة بمستوى الخصر أو أسفل الصدر، تقدم بخطوة متزنة، وضع يديك خلف الرأس.',
      'ثبّت العضدين متجهين للأمام وللأعلى ومد الساعدين باستقامة للأمام.',
      'اعصر الترايسبس عند الامتداد ثم أرجع الساعدين بتحكم خلف الرأس لأعمق إطالة.',
    ],
    simpleExplanationEn:
      'Elevating your arms overhead stretches the long head of the triceps—the largest portion of the upper arm—far more than pushdowns ever can. Facing away from the cable provides continuous tension right into that deep overhead stretch behind your head before extending cleanly forward.',
    simpleExplanationAr:
      'رفع الذراعين فوق الرأس يضع الرأس الطويل للترايسبس (وهو الجزء الأكبر الذي يمنح الذراع ضخامته الخلفية) في أقصى وضع إطالة ممكناً، وهو ما لا توفره تمارين الدفع للأسفل. يسحب الكابل ذراعيك باستمرار أثناء الرجوع خلف الرأس قبل أن تمد ساعديك للأمام بثبات.',
    tipsEn: [
      'Set the cable pulley around waist or lower-chest height so it is easy to get into position safely.',
      'Brace your abs tight so your ribs stay down and lower back does not arch.',
      'Point elbows relatively forward/up instead of letting them flare wide.',
    ],
    tipsAr: [
      'اضبط البكرة بمستوى الخصر أو أسفل الصدر لتسهيل الدخول بالوزن والخروج منه بأمان.',
      'اشدد عضلات البطن لمنع تقوّس أسفل الظهر للخلف أثناء المقاومة.',
      'حافظ على توجيه المرفقين للأمام وللأعلى دون فتحهما كثيراً للجانبين.',
    ],
    avoidEn: [
      'Arching lumbar spine heavily to push heavy weight forward.',
      'Letting elbows swing wildly in and out.',
      'Stopping the backward stretch early without bending elbows deeply behind your head.',
    ],
    avoidAr: [
      'تقويس أسفل الظهر للخلف لدفع أوزان تفوق قوة الذراع.',
      'تأرجح المرفقين للخارج والداخل بعشوائية.',
      'عدم ثني المرفقين بعمق خلف الرأس في بداية الحركة.',
    ],
  },
  'ez-bar-skullcrusher': {
    stepImage: stepEzSkullcrusher,
    stepCaptionsEn: [
      'Lie flat holding the EZ bar overhead, upper arms steady and slightly angled back.',
      'Keep upper arms steady and bend only the elbows to lower the bar smoothly toward your forehead or just behind your head.',
      'Extend forearms smoothly back overhead while keeping continuous tension on the triceps.',
    ],
    stepCaptionsAr: [
      'استلقِ على المقعد المستوي وارفع البار المتعرج فوق رأسك مع تثبيت العضدين.',
      'ثبّت العضدين واثنِ المرفقين فقط لإنزال البار بتحكم نحو الجبهة أو خلف قمة الرأس مباشرة.',
      'افرد الساعدين للأعلى بقوة وثبات للحفاظ على شد الترايسبس.',
    ],
    simpleExplanationEn:
      'Instead of pointing your arms straight 90° at the ceiling—where tension vanishes at lockout—leaning your upper arms back ~10–15° keeps constant load on the triceps even when arms straighten. Lowering behind your crown rather than onto your forehead adds safety and gives a richer long-head stretch.',
    simpleExplanationAr:
      'بدلاً من رفع الذراعين عمودياً تماماً (90° على السقف) حيث ينعدم الحمل في الأعلى، أمل العضدين للخلف بنحو 10–15° وثبّتهما طوال التمرين ليبقى الترايسبس مشدوداً حتى في القمة. ينزل البار بتحكم خلف قمة الرأس وليس فوق الجبهة مباشرة لحماية المرفقين وتمديد الرأس الطويل.',
    tipsEn: [
      'Lower the bar slightly behind the top of your head (toward bench edge) for a deeper stretch.',
      'Keep elbows comfortably tucked inward—roughly shoulder width—never splayed wide.',
      'Control the eccentric over 2–3 seconds so elbow tendons stay healthy.',
    ],
    tipsAr: [
      'أنزل البار خلف قمة الرأس قليلاً نحو حافة المقعد لتحقيق إطالة أعمق وأكثر أماناً.',
      'أبقِ المرفقين متوازيين بعرض الكتفين ولا تدعهما ينفتحان للجانبين.',
      'انزل ببطء خلال 2–3 ثوانٍ لحماية أوتار المرفقين من الإجهاد.',
    ],
    avoidEn: [
      'Dropping the bar rapidly toward your forehead/face under heavy load.',
      'Flaring elbows wide out to the sides.',
      'Rocking upper arms forward and back toward your chest like a pullover.',
    ],
    avoidAr: [
      'إسقاط البار بسرعة نحو الجبهة دون سيطرة عضلية.',
      'فتح المرفقين للخارج بزاوية واسعة.',
      'أرجحة العضدين للأمام والخلف بدلاً من تثبيتهما.',
    ],
  },
  'dumbbell-tricep-kickback': {
    stepImage: stepTricepKickback,
    stepCaptionsEn: [
      'Support your free hand and knee on a flat bench; hold working upper arm horizontal parallel to your ribs with elbow bent 90°.',
      'Freeze the upper arm completely flat and extend only your forearm straight back toward your hip.',
      'Hold peak triceps squeeze straight back for 1 full second, then bend elbow smoothly back to 90°.',
    ],
    stepCaptionsAr: [
      'أسند يداً وركبة على المقعد بظهر مستقيم، وثبّت العضد العامل أفقياً بمحاذاة جسمك مع ثني المرفق بزاوية 90°.',
      'أبقِ العضد ثابتاً تماماً ومد الساعد للخلف باستقامة حتى ينفرد الذراع.',
      'ثبّت الشد في الخلف لمدة ثانية كاملة ثم عد ببطء إلى زاوية 90° للمرفق.',
    ],
    simpleExplanationEn:
      'Because gravity pulls vertically downward, resistance on a kickback reaches maximum only when your forearm extends straight back parallel to the floor. Keeping your upper arm pinned high and horizontal beside your ribs ensures the triceps carry 100% of the lockout squeeze without swinging.',
    simpleExplanationAr:
      'تصل المقاومة في هذا التمرين إلى أقصاها عندما يمتد ذراعك للخلف بموازاة الأرض؛ لذا ثبّت العضد أفقياً بجانب جسمك طوال التمرين ومد الساعد للخلف فقط مع ثبات ثانية في الخلف، وتوقف عند زاوية 90° أثناء الرجوع دون أرجحة.',
    tipsEn: [
      'Use a relatively light dumbbell so you can actually lock out straight behind you and hold 1s.',
      'Stop the forward swing right under your elbow (90° angle) so momentum cannot start.',
      'Keep your neck neutral and upper back flat on the bench support.',
    ],
    tipsAr: [
      'استخدم وزناً خفيفاً أو متوسطاً يسمح لك بفرد الذراع بالكامل خلفك والثبات ثانية.',
      'أوقف رجوع الدامبل للأمام عند الزاوية القائمة (تحت المرفق مباشرة) لإلغاء التأرجح.',
      'حافظ على استقامة الظهر والرقبة أثناء الاستناد باليد والركبة على المقعد.',
    ],
    avoidEn: [
      'Dropping your elbow down so your upper arm points diagonally at the floor.',
      'Swinging the dumbbell forward toward your shoulder between reps.',
      'Using heavy weights and jerking your torso upright to finish.',
    ],
    avoidAr: [
      'هبوط المرفق للأسفل بدلاً من بقاء العضد موازياً للأرض.',
      'أرجحة الدامبل للأمام تحت الكتف لاكتساب دفعة.',
      'استخدام وزن ثقيل يضطرك لرفع الكتف والجذع في كل تكرار.',
    ],
  },
  'bench-dips': {
    stepImage: stepBenchDips,
    stepCaptionsEn: [
      'Place hands on bench edge right beside hips with knees softly bent (or legs straight), keeping lower back very close to the bench.',
      'Lower straight downward until upper arms reach parallel to floor (~90° elbow bend)—keeping elbows tucked back.',
      'Press smoothly back up through your palms while keeping shoulders pressed down.',
    ],
    stepCaptionsAr: [
      'ضع يديك على حافة المقعد بجانب الوركين مع ثني خفيف للركبتين (أو مد الساقين) وبقاء ظهرك قريباً جداً من المقعد.',
      'انزل عمودياً بتحكم حتى يوازي العضدان الأرض (زاوية 90° للمرفقين) مع توجيه المرفقين للخلف.',
      'ادفع للأعلى عبر راحتي اليدين مع إبقاء الكتفين منخفضين بعيداً عن الأذنين.',
    ],
    simpleExplanationEn:
      'Supporting yourself behind a bench places the load through your triceps via vertical dipping, keeping your torso upright rather than leaned forward. Staying tight to the bench front and stopping once elbows hit ~90° loads the triceps cleanly without dragging the front shoulder joint forward.',
    simpleExplanationAr:
      'الارتكاز على حافة مقعد خلف ظهرك مع إبقاء الجذع عمودياً ينقل الجهد الرئيسي إلى عضلات الترايسبس. السر الأساسي لحماية الكتف هو إبقاء ظهرك قريباً جداً من حافة المقعد أثناء النزول، والتوقف بمجرد وصول زاوية المرفقين إلى 90° دون هبوط زائد يلتف معه الكتف للأمام.',
    tipsEn: [
      'Bend knees (feet closer) for easier sets, or straighten legs / elevate feet slightly to increase challenge.',
      'Point fingers forward/slightly outward over the edge and keep elbows tracking straight behind you.',
      'Keep your upper back gliding vertically right past the bench edge.',
    ],
    tipsAr: [
      'اثنِ الركبتين لتخفيف المقاومة أو مد الساقين للأمام لزيادة الصعوبة.',
      'وجّه المرفقين للخلف مباشرة ولا تدعهما يبتعدان كثيراً للجانبين.',
      'اجعل ظهرك يتحرك عمودياً بمحاذاة قريبة جداً من حافة المقعد.',
    ],
    avoidEn: [
      'Drifting hips 20–30 cm forward away from the bench, pinching anterior shoulders.',
      'Plunging deep past 90° elbow flexion where shoulders roll forward.',
      'Slumping neck down between shrugged shoulders.',
    ],
    avoidAr: [
      'إبعاد الوركين للأمام بعيداً عن المقعد مما يضع ضغطاً مؤذياً على مقدمة الكتف.',
      'النزول العميق أكثر من زاوية 90° مع التواء الكتفين للأمام.',
      'غوص الرأس بين الكتفين وارتخاء الرقبة.',
    ],
  },
  'machine-tricep-extension': {
    stepImage: stepMachineTricepExt,
    stepCaptionsEn: [
      'Adjust seat so upper arms and elbows rest squarely on the angled pad, holding the vertical neutral handles near chin height.',
      'Keep elbows glued to the pad and extend forearms smoothly forward along the machine arc.',
      'Reach near-full triceps lockout in front of you, squeeze 1 second, then fold back slowly to a deep stretch.',
    ],
    stepCaptionsAr: [
      'اضبط المقعد ليستقر العضدان والمرفقان بثبات على المسند المائل مع إمساك المقبضين بقبضة مطرقة قرب مستوى الذقن.',
      'ثبّت مرفقيك على الوسادة وادفع الساعدين للأمام بسلاسة على مسار الجهاز.',
      'مد الذراعين للأمام مع عصر الترايسبس ثانية، ثم عد ببطء لتحقيق أقصى إطالة خلفية.',
    ],
    simpleExplanationEn:
      'Resting your upper arms on the angled preacher pad locks your shoulders out of the lift so 100% of the work stays on your triceps. The vertical hammer-grip handles keep wrists neutral and comfortable while letting you load the triceps smoothly from deep stretch to peak contraction.',
    simpleExplanationAr:
      'إسناد الذراعين على الوسادة المائلة يعزل عضلة الترايسبس تماماً ويمنع الغش بالكتف أو الظهر. كما تمنحك قبضة المطرقة العمودية راحة كاملة للمعصم والمرفق مع مقاومة ثابتة من أقصى انثناء وحتى فرد الذراع للأمام.',
    tipsEn: [
      'Adjust the seat so your elbow joint aligns directly with the machine’s red/gray pivot axis.',
      'Keep wrists straight and firm in the neutral hammer grip—do not bend them backward.',
      'Control the return back toward your shoulders for 2–3 seconds without letting the stack clank.',
    ],
    tipsAr: [
      'اضبط ارتفاع المقعد ليكون مفصل المرفق بمحاذاة محور دوران الجهاز تماماً.',
      'حافظ على استقامة المعصمين في قبضة المطرقة دون ثنيهما للخلف أو الداخل.',
      'تحكم في الرجوع لمدة 2–3 ثوانٍ دون ترك الأوزان ترتطم ببعضها.',
    ],
    avoidEn: [
      'Lifting your elbows off the pad or leaning your chest forward to heave heavy plates.',
      'Snapping your elbows into a harsh lock at full forward reach.',
      'Using half-reps without folding back into a deep triceps stretch.',
    ],
    avoidAr: [
      'رفع المرفقين عن الوسادة أو الاندفاع بالكتفين للأمام مع الأوزان الثقيلة.',
      'قفل مفصل المرفق بعنف وسرعة عند تمام الفرد للأمام.',
      'أداء نصف مدى حركي وإهمال الانثناء الكامل للإطالة.',
    ],
  },
  'overhead-barbell-tricep-extension': {
    stepImage: stepOverheadEzTricep,
    stepCaptionsEn: [
      'Sit upright with short back support, hold EZ-bar overhead with narrow grip and elbows pointed forward/up.',
      'Brace abs tight and lower bar smoothly behind your head until forearms fold deeply against biceps.',
      'Press smoothly back overhead keeping elbows steady and stopping just short of harsh joint snap.',
    ],
    stepCaptionsAr: [
      'اجلس باستقامة على مقعد قصير المسند وارفع البار المتعرج فوق الرأس بقبضة متقاربة ومرفقين للأمام وللأعلى.',
      'اشدد البطن وأنزل البار ببطء خلف الرأس حتى أقصى انثناء مريح للمرفقين وتمدد الترايسبس.',
      'ادفع البار للأعلى بثبات دون فتح المرفقين للجانبين أو تقويس أسفل الظهر.',
    ],
    simpleExplanationEn:
      'Lowering an EZ-bar smoothly behind your head while seated stretches the long head of the triceps maximally under free-weight gravity. Keeping your elbows pointing upward/forward and abs braced tightly channels the load purely into triceps extension rather than shoulder flexion.',
    simpleExplanationAr:
      'إنزال البار المتعرج خلف الرأس أثناء الجلوس يضع الرأس الطويل للترايسبس تحت أقصى إطالة ممكنة بوزن حر مستقر. إبقاء المرفقين متجهين للأمام والأعلى مع شد البطن لمنع تقوّس الظهر يضمن أن يعمل الترايسبس وحده في النزول والصعود.',
    tipsEn: [
      'Use an EZ-bar for natural angled wrist positioning that protects wrists and elbows.',
      'Have a partner hand you the bar—or clean & press lightly from lap—when using heavier loads.',
      'Pause momentarily in the deep stretch behind your head before pressing smoothly up.',
    ],
    tipsAr: [
      'استخدم البار المتعرج لتوفير زاوية مريحة للمعصمين وتقليل الضغط على المرفقين.',
      'اطلب من زميل مناولتك البار عند استخدام أوزان ثقيلة لحماية كتفيك.',
      'توقف لحظة قصيرة في أقصى إطالة خلف الرأس قبل الدفع للأعلى لمنع الارتداد.',
    ],
    avoidEn: [
      'Flaring elbows wide out to the sides as the bar lowers.',
      'Hyperextending your lower back off the bench to help push.',
      'Dropping the bar rapidly behind your neck.',
    ],
    avoidAr: [
      'فتح المرفقين للخارج للجانبين أثناء هبوط البار.',
      'تقويس أسفل الظهر للأمام وفصله عن المسند.',
      'إسقاط البار سريعاً خلف الرقبة دون تحكم أثناء النزول.',
    ],
  },
  'barbell-wrist-curl': {
    stepImage: stepWristCurl,
    stepCaptionsEn: [
      'Sit on a bench resting forearms along your thighs palm-up with wrists extending just past your knees.',
      'Let bar roll smoothly toward your fingertips for a full stretch, then curl hands strongly upward.',
      'Pause 1s at peak flexion squeezing inner forearms, then lower slowly.',
    ],
    stepCaptionsAr: [
      'اجلس على المقعد وأسند الساعدين على فخذيك براحتي يد للأعلى وبروز المعصمين أمام الركبتين.',
      'دع البار يتدحرج بتحكم نحو أطراف الأصابع، ثم اثنِ القبضتين والمعصمين للأعلى بقوة.',
      'ثبّت ثانية عند أقصى انقباض للساعد الداخلي ثم انزل ببطء.',
    ],
    simpleExplanationEn:
      'Isolates the wrist flexor muscles along the underside of the forearm by immobilizing your elbows on your thighs and allowing only your wrists and fingers to move. Rolling the bar slightly down into your fingers before curling back up works both grip strength and inner-forearm fullness.',
    simpleExplanationAr:
      'يثبّت هذا التمرين الساعدين على فخذيك لتتحرك الحركة كلها من مفصل المعصم والأصابع فقط، مما يعزل عضلات الساعد الداخلية المسؤولة عن قوة القبضة. فتح الأصابع بتحكم عند النزول ثم ضمها وثني المعصم للأعلى يشغّل ألياف الساعد بمداها الكامل.',
    tipsEn: [
      'Keep forearms completely glued onto your thighs or bench throughout every rep.',
      'Use controlled higher reps (15–20) rather than max heavy loads that strain tendons.',
      'Match shoulder-width grip comfortably without twisting wrists inward.',
    ],
    tipsAr: [
      'أبقِ الساعدين ملاصقين للفخذين أو المقعد دون رفعهما أثناء الثني.',
      'اعتمد تكرارات عالية متحكم بها (15–20) بدلاً من الأوزان القصوى التي ترهق أوتار المعصم.',
      'أمسك البار بعرض مناسب ومريح لزاوية معصميك.',
    ],
    avoidEn: [
      'Lifting forearms off your thighs to swing weight upward.',
      'Using excessive weight that causes sharp wrist joint discomfort.',
      'Rushing short bouncy reps without opening the fingers/stretch.',
    ],
    avoidAr: [
      'رفع الساعدين عن الفخذين للاستعانة بالذراع.',
      'استخدام وزن ثقيل يسبب ألماً في مفصل المعصم.',
      'الاستعجال بنصف حركة دون إطالة الساعد في الأسفل.',
    ],
  },
  'reverse-dumbbell-wrist-curl': {
    stepImage: stepReverseWristCurl,
    stepCaptionsEn: [
      'Kneel/lean resting forearms flat palm-down across a flat bench holding light dumbbells with wrists past the bench edge.',
      'Extend backs of your hands smoothly upward using purely forearm extensor contraction.',
      'Pause briefly at top extension, then lower slowly until wrists gently flex downward.',
    ],
    stepCaptionsAr: [
      'اركع بجانب المقعد وأسند الساعدين براحة يد للأسفل على سطح المقعد مع حمل دامبل خفيف وبروز المعصمين خارج الحافة.',
      'ارفع ظهر اليدين للأعلى ببطء بانقباض عضلات الساعد العلوية فقط.',
      'ثبّت لحظة في القمة ثم انزل بتحكم إلى تمدد لطيف في الأسفل.',
    ],
    simpleExplanationEn:
      'Trains the smaller extensor muscles running along the top of your forearms—balancing heavy pulling/gripping work and shielding the outer elbow from overuse tendonitis. Slow, strict wrist extension with modest weights yields the best results.',
    simpleExplanationAr:
      'يستهدف هذا التمرين عضلات الساعد العلوية التي غالباً ما تُهمل مقارنة بعضلات القبض، ما يحقق توازناً جمالياً وقوة مفصلية تحمي أوتار المرفق من الالتهاب. الأوزان الخفيفة والأداء البطيء الدقيق هما سر نجاحه.',
    tipsEn: [
      'Start very light—wrist extensors are far smaller and tire quickly compared to flexors.',
      'Keep your knuckles moving straight up and down without lifting elbows.',
      'Control a steady 2-second lowering phase.',
    ],
    tipsAr: [
      'ابدأ بأوزان خفيفة جداً لأن عضلات الساعد العلوية صغيرة وتتعب سريعاً.',
      'حافظ على حركة ظهر اليد عمودياً للأعلى والأسفل مع ثبات الساعدين.',
      'تحكم في النزول خلال ثانيتين دون إرخاء فوري للوزن.',
    ],
    avoidEn: [
      'Using heavy dumbbells that force your elbows and shoulders to lift.',
      'Jerking wrists quickly at the top.',
      'Bending wrists sideways instead of straight extension.',
    ],
    avoidAr: [
      'حمل دامبل ثقيل يجعلك ترفع الساعد والمرفق عن المسند.',
      'نتش الوزن بسرعة في الأعلى.',
      'انحراف المعصمين للجانبين بدلاً من الحركة العمودية السلسة.',
    ],
  },

  // LEGS — QUADS & COMPOUND
  'barbell-back-squat': {
    stepImage: stepBarbellSquat,
    stepCaptionsEn: [
      'Pin bar snugly across upper traps, take deep belly breath to brace core 360°, feet shoulder-width.',
      'Sit hips back and bend knees simultaneously so knees track cleanly inline with toes, chest tall.',
      'Reach parallel (hip crease at or below knee), then drive firmly through mid-foot straight back up.',
    ],
    stepCaptionsAr: [
      'ثبّت البار على أعلى الظهر والكتفين (الترابيس)، خذ نفساً عميقاً واشدد البطن بالكامل، بقدمين بعرض الكتفين.',
      'ابدأ النزول بثني الوركين والركبتين معاً مع تتبع الركبتين لاتجاه أصابع القدم وصدر مرفوع.',
      'صل لعمق التوازي (مفصل الورك بمحاذاة الركبة أو أخفض)، ثم ادفع بقوة من منتصف القدم للأعلى.',
    ],
    simpleExplanationEn:
      'Think of sitting down between your heels—not pitching forward over your toes—while keeping your chest proud and the barbell traveling in a vertical line directly over mid-foot. Deepening to at least parallel stretches and loads both your quadriceps and glutes maximally while a 360° braced core keeps your spine protected.',
    simpleExplanationAr:
      'تخيّل أنك تجلس للأسفل بين كعبيك بحيث يتحرك البار في خط عمودي واحد فوق منتصف قدمك تماماً من البداية للنهاية. النزول حتى مستوى التوازي (انخفاض مفصل الورك لمحاذاة الركبة) يضع تركيزاً قوياً على الفخذ الأمامي والأرداف، بينما يحمي شد الجذع ظهرك طوال الرفعة.',
    tipsEn: [
      'Angle toes slightly outward (15–30°) and drive knees out along that exact toe direction.',
      'Distribute pressure evenly across 3 points: heel, big toe base, and pinky toe base.',
      'Keep your gaze focused slightly downward ahead (~3–4 m in front)—not straight at the ceiling.',
    ],
    tipsAr: [
      'أدر أصابع القدم للخارج قليلاً (15–30°) واحرص أن تتحرك الركبتان في نفس اتجاه الأصابع تماماً.',
      'وزّع ضغط جسمك بالتساوي على كامل باطن القدم (الكعب ومشط القدم) لا على الأصابع فقط.',
      'ثبّت نظرك للأمام وللأسفل قليلاً ولا ترفع رأسك للسقف.',
    ],
    avoidEn: [
      'Letting knees cave inward toward each other (knee valgus) while pushing out of the hole.',
      'Cutting depth into shallow quarter-squats to pile on heavy plates.',
      'Rounding your lower back sharply at the bottom ("butt wink") or lifting heels off the floor.',
    ],
    avoidAr: [
      'انهيار الركبتين للداخل نحو بعضهما أثناء الدفع للصعود.',
      'النزول السطحي لمجرد رفع أوزان كبيرة دون تفعيل حقيقي للفخذ والأرداف.',
      'تقوّس أسفل الظهر في أقصى النزول أو ارتفاع الكعبين عن الأرض.',
    ],
  },
  'leg-press-machine': {
    stepImage: stepLegPress,
    stepCaptionsEn: [
      'Plant feet shoulder-width on sled, pull yourself deep into seat using side handles, unlock safety latches.',
      'Lower sled smoothly bringing knees toward chest—stopping just before tailbone/lower back peels off pad.',
      'Drive forcefully through mid-foot and heels until legs are extended without violently locking knees.',
    ],
    stepCaptionsAr: [
      'ثبّت قدميك بعرض الكتفين، امسك المقابض الجانبية لتثبيت حوضك بالمقعد، وحرّر أقفال الأمان.',
      'أنزل المنصة بتحكم بتقريب الركبتين نحو الصدر والتوقف قبيل ارتفاع أسفل الظهر عن المقعد.',
      'ادفع بقوة من منتصف القدم والكعبين للأعلى وتوقف قبيل القفل العنيف للركبتين.',
    ],
    simpleExplanationEn:
      'With your back fully supported by the angled seat, you can load heavy weight onto your quadriceps and glutes without fatiguing your spine or balance. The key safety rule is stopping your descent the moment your hips/tailbone threaten to curl off the seat pad—never sacrificing pelvic stability for extra inches.',
    simpleExplanationAr:
      'بإسناد ظهرك بالكامل على المقعد المائل، يتيح لك هذا الجهاز تحميل أوزان ثقيلة على الفخذين والأرداف دون أي ضغط على العمود الفقري أو الحاجة للموازنة. القاعدة الذهبية هنا هي إيقاف النزول فوراً قبيل ارتفاع أسفل ظهرك أو حوضك عن الوسادة، والدفع بثبات من منتصف القدم دون قفل الركبة بعنف في القمة.',
    tipsEn: [
      'Place feet lower on the sled (if ankles allow) for stronger quad emphasis, or higher for glutes/hams.',
      'Pull downward tightly on the side seat handles during the entire set so hips stay anchored.',
      'Keep knees aligned with toes throughout both lowering and pressing.',
    ],
    tipsAr: [
      'وضع القدمين في منتصف المنصة أو أسفلها قليلاً يركز أكثر على الفخذ الأمامي، ورفعهما للأعلى يشرك الأرداف والخلفية أكثر.',
      'اسحب المقابض الجانبية نحوك بقوة طوال الجولة لتثبيت الأرداف ملتصقة بالمقعد.',
      'حافظ على اتجاه الركبتين بمحاذاة أصابع القدمين دون انحراف للداخل.',
    ],
    avoidEn: [
      'Locking knees backward forcefully at the top under heavy loads.',
      'Allowing your lower back and glutes to curl up off the pad at the bottom.',
      'Pressing on your thighs/knees with your hands to help push the sled.',
    ],
    avoidAr: [
      'قفل الركبتين وفردهما للخلف بعنف في الأعلى تحت وزن ثقيل.',
      'السماح لأسفل الظهر والحوض بالارتفاع والانفصال عن المسند عند النزول.',
      'الدفع باليدين على الركبتين أو الفخذين للمساعدة في رفع المنصة.',
    ],
  },
  'leg-extension-machine': {
    stepImage: stepLegExtension,
    stepCaptionsEn: [
      'Align knee joint directly with machine pivot point, place ankle roller just above foot crease, grip handles.',
      'Extend shins smoothly upward by contracting your quads forcefully—without popping hips off seat.',
      'Hold 1 full second at complete knee extension, then lower over 2–3s with controlled resistance.',
    ],
    stepCaptionsAr: [
      'اضبط المسند ليتطابق مفصل ركبتك مع محور الجهاز وضع وسادة الكاحل فوق مشط القدم مباشرة.',
      'ارفع الساقين للأعلى بانقباض عضلات الفخذ الأمامي فقط مع إبقاء الأرداف ثابتة على المقعد.',
      'توقف ثانية واحدة في القمة عند استقامة الساقين، ثم انزل ببطء خلال 2–3 ثوانٍ.',
    ],
    simpleExplanationEn:
      'Unlike squats and leg presses where the hips extend too, leg extensions isolate knee extension exclusively—delivering strong peak contraction to all four heads of the quadriceps (especially the central rectus femoris). Pausing at the top for 1 second and controlling the descent doubles muscle stimulus without adding joint shock.',
    simpleExplanationAr:
      'على عكس القرفصاء ودفع الأرجل، يعزل هذا الجهاز حركة فرد الركبة فقط، مما يمنح عضلات الفخذ الأمامي أقصى انقباض في قمة الحركة. التوقف لثانية كاملة عند تمام الفرد ثم النزول البطيء يضاعفان الفائدة دون أي ضغط مفاجئ على الركبة.',
    tipsEn: [
      'Pull handles firmly downward to lock your hips flat against the seat.',
      'Keep toes pointing straight up or slightly toward you for clean quad engagement.',
      'Stop just before the weight stack clanks down at the bottom.',
    ],
    tipsAr: [
      'أمسك المقابض الجانبية بقوة لتثبيت الحوض في المقعد ومنع ارتفاعك.',
      'حافظ على توجيه أصابع القدم للأعلى أو نحوك قليلاً لشد أفضل للفخذ الأمامي.',
      'توقف قبيل اصطدام ألواح الأوزان في الأسفل للحفاظ على التوتر المستمر.',
    ],
    avoidEn: [
      'Kicking the pad violently upward using hip bounce.',
      'Letting the roller pad sit high on mid-shin or across your toes.',
      'Dropping the weight straight down fast after reaching the top.',
    ],
    avoidAr: [
      'دفع الوسادة للأعلى بسرعة وانفجار باستخدام الاندفاع الحركي.',
      'وضع وسادة الساق عالياً على منتصف الساق أو منخفضاً على أطراف الأصابع.',
      'ترك الساقين تسقطان سريعاً للأسفل بعد القمة دون مقاومة.',
    ],
  },
  'dumbbell-goblet-squat': {
    stepImage: stepGobletSquat,
    stepCaptionsEn: [
      'Cup top head of one heavy dumbbell vertically against your upper chest, elbows tucked downward.',
      'Sit straight down between your knees—gliding elbows neatly inside thighs while keeping chest upright.',
      'Pause 1s smoothly in the deep bottom position, then drive through mid-foot to stand tall.',
    ],
    stepCaptionsAr: [
      'احمل رأس الدامبل العلوي بكلتا يديك ملاصقاً لأعلى الصدر مع توجيه المرفقين للأسفل.',
      'انزل عمودياً بين ركبتيك مع إدخال المرفقين برفق داخل الفخذين وبقاء الصدر مرفوعاً.',
      'توقف ثانية في العمق مع ثبات الكعبين ثم ادفع من منتصف القدم للوقوف.',
    ],
    simpleExplanationEn:
      'Holding the dumbbell right in front of your chest acts as a natural counterweight that lets you sit deeper with a much more upright spine than a back squat. Touching your elbows gently to the inside of your knees at the bottom naturally guides proper knee tracking and deep hip mobility.',
    simpleExplanationAr:
      'حمل الدامبل أمام الصدر يعمل كثقل موازن يسمح لك بالجلوس بعمق أكبر مع بقاء ظهرك منتصباً مقارنة بالقرفصاء الخلفية. ملامسة المرفقين للجزء الداخلي من الركبتين في الأسفل تساعد تلقائياً على إبقاء الركبتين مفتوحتين في المسار الصحيح وتعميق الحركة بأمان.',
    tipsEn: [
      'Keep the dumbbell glued right against your sternum—never hold it out in front with straight arms.',
      'Maintain full foot contact across heels and toes throughout the squat.',
      'Use a 2-second pause at the bottom to build rock-solid squat control.',
    ],
    tipsAr: [
      'أبقِ الدامبل ملاصقاً لأعلى الصدر طوال الوقت ولا تبعده للأمام بيديك.',
      'حافظ على تثبيت الكعبين وكامل القدم على الأرض في أدنى نقطة.',
      'التوقف لمدة ثانية أو ثانيتين في العمق يعزز ثبات وقوة الفخذين.',
    ],
    avoidEn: [
      'Letting elbows pull away from your ribs so your upper back rounds forward.',
      'Allowing knees to collapse inward inside your ankles.',
      'Rocking onto your toes at depth.',
    ],
    avoidAr: [
      'إبعاد الدامبل للأمام مما يجعل أعلى ظهرك يتقوّس للأمام.',
      'انهيار الركبتين للداخل عند النزول العميق.',
      'ارتفاع الكعبين والاعتماد على أطراف الأصابع.',
    ],
  },
  'smith-squat': {
    stepImage: stepSmithSquat,
    stepCaptionsEn: [
      'Set bar on upper traps and place feet ~10–20 cm slightly forward of the vertical bar path.',
      'Sit hips downward and slightly back along the guided track while keeping torso relatively upright.',
      'Reach full parallel depth smoothly, then drive upward evenly through mid-foot.',
    ],
    stepCaptionsAr: [
      'ثبّت البار على أعلى الظهر وقدّم قدميك للأمام قليلاً (~10–20 سم) أمام خط البار العمودي.',
      'اهبط للأسفل على المسار الموجه مع بقاء الجذع أكثر استقامة ونزول متحكم به.',
      'صل إلى مستوى التوازي بسلاسة ثم ادفع عبر منتصف القدم للعودة للأعلى.',
    ],
    simpleExplanationEn:
      'Because the Smith rail supports balance completely, stepping your feet slightly forward of the bar line allows your torso to stay upright while knees travel comfortably forward—focusing heavy, isolated tension squarely onto the quadriceps without lower-back fatigue.',
    simpleExplanationAr:
      'بفضل تثبيت التوازن على قضبان السميث، يمكنك تقديم قدميك قليلاً أمام خط البار ليهبط جذعك باستقامة أكثر، مما يوجه الحمل الرئيسي بشكل مركز ومباشر على عضلات الفخذ الأمامي مع تقليل إجهاد أسفل الظهر مقارنة بالقرفصاء الحرة.',
    tipsEn: [
      'Test your foot distance with an empty bar so your heels stay planted comfortably at the bottom.',
      'Always set lower mechanical safety pins just below your target depth.',
      'Brace core tightly despite the guided bar path.',
    ],
    tipsAr: [
      'اضبط مسافة القدمين مع البار فارغاً لتضمن بقاء الكعبين ثابتين ومريحين في أدنى عمق.',
      'اضبط مصدّات الأمان السفلية أسفل عمق النزول المستهدف مباشرة.',
      'حافظ على شد البطن وثبات الجذع تماماً كما في البار الحر.',
    ],
    avoidEn: [
      'Placing feet directly beneath or behind the bar, which forces uncomfortable lower-back shear.',
      'Stopping halfway down with heavy ego loads.',
      'Forgetting to rotate the safety hooks cleanly before racking.',
    ],
    avoidAr: [
      'وضع القدمين خلف خط البار مما يضغط على الركبتين وأسفل الظهر بزاوية غير طبيعية.',
      'الاعتماد على نزول سطحي قصير بسبب زيادة الأوزان.',
      'إهمال التأكد من تعشيق خطافات الأمان عند إنهاء الجولة.',
    ],
  },
  'barbell-front-squat': {
    stepImage: stepFrontSquat,
    stepCaptionsEn: [
      'Rest bar across your front delts right against throat/collarbone, elbows driven high and torso upright.',
      'Descend smoothly sitting straight down between knees while fighting to keep elbows pointing high.',
      'Drive upward out of the bottom maintaining a vertical chest—never letting elbows drop down.',
    ],
    stepCaptionsAr: [
      'أرح البار على الكتفين الأماميين ملاصقاً لأعلى الصدر مع رفع المرفقين عالياً للأمام.',
      'انزل عمودياً بين الركبتين مع مقاومة هبوط المرفقين وبقاء الصدر منتصباً تماماً.',
      'ادفع للأعلى من منتصف القدم مع الحفاظ على ارتفاع المرفقين واستقامة الجذع.',
    ],
    simpleExplanationEn:
      'Carrying the barbell in front of your neck forces your torso to stay nearly vertical—otherwise the bar rolls right forward off your shoulders. That upright posture places massive knee flexion demand directly onto the quadriceps while building formidable upper-back and core anti-flexion strength.',
    simpleExplanationAr:
      'وضع البار على الكتفين الأماميين يفرض عليك الحفاظ على استقامة شبه عمودية للجذع؛ لأنه بمجرد انحنائك للأمام سينزلق البار ويسقط. هذه الاستقامة تجعل الركبتين تتقدمان للأمام وتمنحان الفخذ الأمامي تحفيزاً هائلاً مع تقوية عظيمة لأعلى الظهر والبطن.',
    tipsEn: [
      'Let the bar sit firmly on your front shoulder shelves—fingers only stabilize lightly, or cross arms if wrists are tight.',
      'Drive elbows aggressively upward on the way out of the bottom—where the chest wants to cave.',
      'Elevating heels slightly on small plates (or lifting shoes) helps achieve full upright depth.',
    ],
    tipsAr: [
      'اترك الوزن يستقر على الكتفين الأماميين ولا تحمله على المعصمين، ويمكنك استخدام قبضة الأذرع المتقاطعة عند الحاجة.',
      'ادفع المرفقين للأعلى بقوة لحظة الصعود من القاع لمنع ميلان الصدر للأمام.',
      'استخدام حذاء رفع أثقال أو رفع الكعبين قليلاً يسهّل النزول العميق باستقامة.',
    ],
    avoidEn: [
      'Letting elbows drop toward the floor, causing the upper back to round and bar to slip.',
      'Trying to hold the bar tightly with a full fist gripping back on strained wrists.',
      'Shifting onto your toes and losing heel contact.',
    ],
    avoidAr: [
      'سقوط المرفقين للأسفل مما يؤدي لانحناء الظهر وسقوط البار للأمام.',
      'إمساك البار بقبضة كاملة تضع ثقل البار على مفصل المعصم.',
      'ارتفاع الكعبين للأعلى أثناء النزول العميق.',
    ],
  },
  'bodyweight-bulgarian-split-squat': {
    stepImage: stepSplitSquat,
    stepCaptionsEn: [
      'Place top of rear foot on a knee-height bench behind you, front foot planted firmly ~60–80 cm forward.',
      'Lower back knee smoothly toward the floor—keep ~85% of your weight over the front working leg.',
      'Drive upward through front mid-foot and heel until front leg extends smoothly without locking harshly.',
    ],
    stepCaptionsAr: [
      'ضع مشط القدم الخلفية على مقعد خلفك وثبّت القدم الأمامية للأمام بمسافة مريحة (~60–80 سم).',
      'انزل بالركبة الخلفية عمودياً نحو الأرض مع تحميل نحو 85% من وزنك على الساق الأمامية.',
      'ادفع بقوة عبر منتصف القدم الأمامية والكعب للوقوف دون قفل الركبة بعنف.',
    ],
    simpleExplanationEn:
      'Elevating your rear foot shifts nearly your entire bodyweight and any dumbbells onto the front leg alone, exposing and fixing left-right leg imbalances. Staying slightly more upright biases the front thigh (quads), while a modest 15–20° forward torso lean shifts deep stretch and drive into the glutes.',
    simpleExplanationAr:
      'رفع القدم الخلفية ينقل نحو 85% من الحمل إلى الساق الأمامية وحدها (بوزن الجسم أو الدامبل)، مما يعالج أي تفاوت في القوة بين الساقين ويحفز الفخذ والأرداف بقوة. الجلوس باستقامة يركز أكثر على الفخذ الأمامي، بينما الميل الخفيف للأمام (~15–20°) يضاعف استهداف عضلات الأرداف.',
    tipsEn: [
      'Stand hip-width laterally (like parallel tracks, not a narrow tightrope) so balance feels solid.',
      'Start sitting on the bench edge and extend one leg straight forward to find your ideal front foot spot.',
      'Control a steady 2–3s descent and lightly touch (or hover above) the floor with your rear knee.',
    ],
    tipsAr: [
      'باعد بين القدمين عرضياً قليلاً (كخطين متوازيين لا على خط واحد) لتحقيق اتزان ممتاز.',
      'لإيجاد المسافة المثالية: اجلس على حافة المقعد ومد ساقاً للأمام؛ موضع كعبك هو موضع قدمك الأمامية.',
      'انزل ببطء (2–3 ثوانٍ) حتى تقترب الركبة الخلفية من ملامسة الأرض بتحكم.',
    ],
    avoidEn: [
      'Standing on a single line so you wobble sideways on every rep.',
      'Using a tall bench that forces an uncomfortable pull in the rear hip flexor.',
      'Pushing off the back toes instead of working the front leg.',
    ],
    avoidAr: [
      'وضع القدمين على خط طولي واحد يسبب فقدان التوازن المتكرر.',
      'استخدام مقعد مرتفع جداً يشد مفصل الورك الخلفي بشكل مزعج.',
      'الدفع بأصابع القدم الخلفية بدلاً من تحميل الساق الأمامية.',
    ],
  },

  // LEGS — POSTERIOR CHAIN, GLUTES & CALVES
  'conventional-deadlift': {
    stepImage: stepConventionalDeadlift,
    stepCaptionsEn: [
      'Walk shins ~2–3 cm from bar over mid-foot, grip just outside legs, pull chest up & lats tight with flat spine.',
      'Push the floor away with your legs while keeping the bar dragging cleanly against shins and thighs.',
      'Stand tall squeezing glutes at lockout—keeping shoulders stacked cleanly without leaning back.',
    ],
    stepCaptionsAr: [
      'قف والبار فوق منتصف القدم (بعيداً ~2–3 سم عن الساق)، أمسك البار خارج الساقين واشدد الظهر وتحت الإبطين.',
      'ابدأ الرفعة بدفع الأرض بقدميك مع بقاء البار ملاصقاً للساقين والفخذين طوال الصعود.',
      'انتصب بالكامل مع شد الأرداف وتثبيت الكتفين دون إرجاع الظهر للخلف في الأعلى.',
    ],
    simpleExplanationEn:
      'Do not think of yanking a deadlift with your lower back—think of pushing the floor away with your legs while your rigid upper back holds the barbell tight against your body. Once the bar clears your knees, drive your hips smoothly forward to meet the bar until standing tall with squeezed glutes.',
    simpleExplanationAr:
      'السر الحقيقي في الرفعة المميتة هو ألا تسحبها بظهرك السفلي، بل ادفع الأرض بقدميك بينما يعمل ظهرك المشدود كرافعة صلبة تبقي البار ملاصقاً لساقيك تماماً. بمجرد تجاوز البار لمستوى الركبتين، ادفع وركيك للأمام باتجاه البار لتقف منتصباً مع شد الأرداف بالكامل دون تقويس الظهر للخلف.',
    tipsEn: [
      'Pull the slack out of the bar until you feel tension click against the plates before driving upward.',
      'Pack your armpits tight by pulling shoulder blades down toward your hips to engage lats and keep the bar close.',
      'Set the bar cleanly back down along the exact same vertical path over mid-foot.',
    ],
    tipsAr: [
      'شد جسمك وخذ وضع الاستعداد على البار قبل رفعه لتشعر بشد الظهر والفخذ الخلفي، ثم ادفع الأرض بقدميك بقوة.',
      'اشدد عضلات تحت الإبطين للخلف وللأسفل لإبقاء البار ملاصقاً لجسمك دون أن ينفصل للأمام.',
      'أنزل البار للأرض بإرجاع الوركين أولاً ثم ثني الركبتين فور تجاوز البار للركبتين.',
    ],
    avoidEn: [
      'Ripping the bar off the floor with a rounded lower back.',
      'Letting hips shoot straight up first while the bar stays glued to the floor.',
      'Hyperextending and leaning far backward at lockout.',
    ],
    avoidAr: [
      'خطف البار من الأرض بظهر مقوّس لأن ذلك يضغط مباشرة على أسفل الظهر.',
      'رفع الوركين للأعلى أولاً قبل تحرك الكتفين والصدر مما يحمّل الظهر وحده.',
      'إمالة الجذع للخلف بعنف عند الوقوف في نهاية الرفعة.',
    ],
  },
  'romanian-deadlift': {
    stepImage: stepRomanianDeadlift,
    stepCaptionsEn: [
      'Stand holding barbell at upper thighs, unlock knees ~15° and lock that slight knee bend permanently.',
      'Push hips straight backward toward the wall behind you while bar glides tight down thighs/shins and spine stays flat.',
      'Stop as soon as hips stop traveling back (mid-shin stretch), then drive hips forward squeezing glutes to stand.',
    ],
    stepCaptionsAr: [
      'قف حاملاً البار أمام الفخذين مع ثني طفيف ثابت في الركبتين (~15°) لا يتغير طوال الحركة.',
      'ادفع الوركين للخلف باستقامة نحو الحائط مع انزلاق البار ملاصقاً للفخذين وبقاء الظهر مسطحاً ومشدوداً.',
      'توقف فور توقف الوركين عن الرجوع للخلف (تمدد عميق للفخذ الخلفي)، ثم ادفع الوركين للأمام للانتصاب.',
    ],
    simpleExplanationEn:
      'Unlike a conventional deadlift from the floor, an RDL starts at the top and emphasizes pure horizontal hip movement: push your hips steadily straight backward while keeping knees softly unlocked (~15°). Stop descending the moment your hips stop going back—usually right below the knees—and drive hips forward from the hamstrings and glutes.',
    simpleExplanationAr:
      'على عكس الرفعة المميتة التقليدية، تبدأ الرفعة الرومانية من الأعلى وتركّز حصراً على حركة مفصل الورك أفقياً: ادفع الحوض أفقياً للخلف مع ثبات انحناء بسيط في الركبتين (~15°) وبقاء البار ملاصقاً للساقين. بمجرد أن يتوقف الحوض عن التراجع للخلف (غالباً أسفل الركبة بقليل)، توقف فوراً وادفع وركيك للأمام باستخدام الفخذ الخلفي والأرداف.',
    tipsEn: [
      'Keep your chin tucked gently in line with your spine rather than craning to watch a mirror.',
      'Maintain active lat tension pulling the bar softly backward against your thighs.',
      'Control a 3-second lowering stretch—do not bounce out of the bottom.',
    ],
    tipsAr: [
      'أبقِ الرقبة على استقامة واحدة مع ظهرك ولا ترفع رأسك للأعلى للنظر في المرآة.',
      'حافظ على شد عضلات تحت الإبطين لإبقاء البار ملاصقاً للفخذين والساقين طوال الوقت.',
      'انزل ببطء (3 ثوانٍ) واشعر بتمدد الفخذ الخلفي قبل الدفع للوقوف دون ارتداد.',
    ],
    avoidEn: [
      'Drifting the barbell several centimeters forward in front of your shins.',
      'Bending knees progressively deeper until it turns into a squat.',
      'Forcing the bar all the way to the floor by rounding your lower back after hip travel ends.',
    ],
    avoidAr: [
      'ابتعاد البار للأمام عن ساقيك لأن ذلك ينقل الحمل فوراً إلى أسفل الظهر.',
      'زيادة ثني الركبتين أثناء النزول وتحويل التمرين إلى قرفصاء.',
      'محاولة إيصال البار للأرض بتقويس الظهر بعد انتهاء مدى مرونة الفخذ الخلفي.',
    ],
  },
  'lying-leg-curl': {
    stepImage: stepLegCurl,
    stepCaptionsEn: [
      'Lie face down with knees aligned right off the bench pivot edge and roller pad snug over lower calves/Achilles.',
      'Curl heels smoothly toward your glutes while pressing hips flat downward into the bench.',
      'Pause briefly at peak hamstring squeeze, then lower slowly over 2–3s to nearly straight legs.',
    ],
    stepCaptionsAr: [
      'استلقِ على بطنك بحيث تقع الركبتان تماماً على حافة دوران المقعد وتستقر الوسادة فوق الكعبين.',
      'اسحب الكعبين نحو الأرداف بتحكم مع تثبيت الحوض والبطن ملاصقين للمقعد تماماً.',
      'توقف لحظة عند قمة انقباض الفخذ الخلفي ثم أنزل الساقين ببطء خلال 2–3 ثوانٍ.',
    ],
    simpleExplanationEn:
      'While RDLs train the hamstrings via hip extension in a stretched position, leg curls isolate them via knee flexion—hitting the short head (biceps femoris) that hip hinges miss. Pressing your pubic bone/hips gently into the bench pad prevents your lower back from taking over the pull.',
    simpleExplanationAr:
      'بينما تمرّن الرفعة الرومانية الفخذ الخلفي من مفصل الورك، يعزل جهاز ثني الفخذ الخلفي العضلة عبر ثني الركبة، ما يشغّل الرأس القصير للعضلة الذي لا يتفعل بالرفعة المميتة وحدها. تثبيت الحوض ملتصقاً بالوسادة يمنع أسفل الظهر من التدخل عند زيادة التعب.',
    tipsEn: [
      'Pull toes gently toward your shins (dorsiflexion) or keep ankles relaxed—test which isolates hamstrings best without calves cramping.',
      'Tighten glutes lightly to keep your pelvis anchored down onto the bench.',
      'Resist the lowering phase smoothly for a full 2–3 seconds.',
    ],
    tipsAr: [
      'تجنب شد السمانة بقوة أثناء الثني؛ جرّب إرخاء الكاحل أو ثني مشط القدم نحوك قليلاً لتركيز الشد في الفخذ الخلفي.',
      'اضغط الحوض للأسفل على المقعد مع شد خفيف للبطن والأرداف.',
      'تحكم ببطء في النزول لمدة 2–3 ثوانٍ حتى امتداد الساقين.',
    ],
    avoidEn: [
      'Arching your lower back and lifting hips high off the pad to heave the weight.',
      'Kicking the pad sharply into your glutes with momentum.',
      'Stopping halfway down instead of extending knees cleanly.',
    ],
    avoidAr: [
      'رفع الوركين والأرداف عن الوسادة وتقويس الظهر لتسهيل السحب.',
      'ضرب الوسادة بالأرداف بدفع سريع وعنيف.',
      'إهمال النزول الكامل حتى شبه استقامة الركبتين.',
    ],
  },
  'dumbbell-rdl': {
    stepImage: stepDumbbellRdl,
    stepCaptionsEn: [
      'Stand holding dumbbells calmly at front/sides of thighs with knees unlocked ~15° and chest proud.',
      'Hinge hips straight backward gliding dumbbells right alongside your legs until deep hamstring tension.',
      'Pause momentarily below knees with neutral flat spine, then squeeze glutes and drive hips forward.',
    ],
    stepCaptionsAr: [
      'قف ممسكاً الدامبل أمام الفخذين أو جانبهما مع ثني طفيف ثابت للركبتين (~15°) واستقامة الظهر.',
      'ادفع الوركين للخلف باستقامة مع انزلاق الدامبل ملاصقين للفخذين والساقين حتى أقصى شد خلفي.',
      'توقف لحظة أسفل الركبتين بظهر مسطح، ثم ادفع الوركين للأمام بشد الأرداف للوقوف.',
    ],
    simpleExplanationEn:
      'Swapping a barbell for dumbbells lets you position your hands naturally beside your thighs/outer shins so you can focus purely on pushing your hips backward without knocking your knees. Maintain a flat back and stop lowering as soon as your hips finish moving back.',
    simpleExplanationAr:
      'استخدام الدامبل بدلاً من البار يمنحك حرية طبيعية لوضع اليدين بمحاذاة جانبي الفخذين، مما يسهّل التركيز الكامل على دفع الحوض للخلف دون إعاقة للركبتين. تنزل بظهر مسطح تماماً حتى تشعر بامتداد قوي في الفخذ الخلفي، ثم تعود بدفع الوركين للأمام.',
    tipsEn: [
      'Keep dumbbells tucked close beside your shins—not hanging far forward under your chin.',
      'Set shoulder blades back and down before starting so your upper back never slumps.',
      'Stop lowering around mid-shin unless hamstring flexibility allows deeper hip travel with a flat spine.',
    ],
    tipsAr: [
      'أبقِ الدامبل ملاصقين لجانبي الفخذين والساقين لا يتدليان للأمام.',
      'اسحب الكتفين للخلف وللأسفل طوال الحركة حتى لا يتقوّس أعلى ظهرك.',
      'توقف عند منتصف الساق تقريباً (حسب مرونتك) قبل أن يبدأ ظهرك بالانحناء.',
    ],
    avoidEn: [
      'Letting shoulders roll forward and dumbbells drift away from legs.',
      'Bending knees deep like a squat.',
      'Snapping hips forward harshly at lockout with an arched back.',
    ],
    avoidAr: [
      'تهدّل الكتفين وابتعاد الدامبل للأمام عن خط الساقين.',
      'زيادة ثني الركبتين وتحويل التمرين إلى قرفصاء.',
      'دفع الحوض للأمام بعنف مع تقويس الظهر في القمة.',
    ],
  },
  'barbell-hip-thrust': {
    stepImage: stepHipThrust,
    stepCaptionsEn: [
      'Rest lower shoulder blades across bench edge, pad bar across hip crease, and position shins vertical at top.',
      'Tuck chin softly forward, drive heels firmly into floor, and lift hips until torso is flat horizontal.',
      'Squeeze glutes maximally for 1 full second at top table-top position, then lower hips smoothly under control.',
    ],
    stepCaptionsAr: [
      'أسند أسفل لوحي الكتف على حافة مقعد ثابت، ضع البار بوسادة فوق الورك، واضبط القدمين بحيث تكون الساق عمودية في القمة.',
      'مِل بذقنك قليلاً للأمام، ادفع الأرض بالكعبين، وارفع الوركين حتى يستقيم الجذع أفقياً.',
      'اعصر الأرداف بقوة لمدة ثانية كاملة في الأعلى، ثم أنزل الوركين بتحكم دون ارتداد.',
    ],
    simpleExplanationEn:
      'Resting your upper back on a bench turns your mid-back into a pivot so horizontal hip extension loads the glutes maximally right at full lockout—where squats actually have low tension. Keep your ribcage tucked down and chin forward so your glutes tilt your pelvis upward rather than arching your lower back.',
    simpleExplanationAr:
      'إسناد أعلى ظهرك على المقعد يجعل لوحي الكتف محور ارتكاز لدفع الحوض للأعلى عمودياً، مما يضع أعلى حمل ممكن على عضلات الأرداف عند القمة تماماً. إمالة الذقن للأمام وإبقاء القفص الصدري منخفضاً يضمنان أن يرتفع الحوض بانقباض الأرداف لا بتقويس أسفل الظهر.',
    tipsEn: [
      'Adjust foot placement so knees form a crisp 90° angle (vertical shins) when hips reach horizontal top.',
      'Use a thick barbell pad or folded mat across your hip bones so load stays comfortable.',
      'Pivot your torso together as one unit with your hips—eyes looking forward toward knees.',
    ],
    tipsAr: [
      'اضبط مسافة القدمين لتشكّل الركبتان زاوية 90° تماماً عند وصول الجذع للاستقامة الأفقية.',
      'استخدم وسادة بار مريحة أو سجادة مطوية لحماية عظام الحوض عند الأوزان الثقيلة.',
      'اجعل الجذع والورك يتحركان كقطعة واحدة مع توجيه نظرك للأمام نحو الركبتين.',
    ],
    avoidEn: [
      'Throwing your head back over the bench and arching your lower back into the ceiling.',
      'Placing feet too close to glutes (quads dominate) or too far out (hamstrings cramp).',
      'Bouncing the weights rapidly off the floor between reps.',
    ],
    avoidAr: [
      'رمي الرأس للخلف وتقويس أسفل الظهر بدلاً من تدوير الحوض للأعلى بالأرداف.',
      'وضع القدمين قريباً جداً (يركز على الفخذ الأمامي) أو بعيداً جداً (يشد الفخذ الخلفي).',
      'ضرب الأقراص بالأرض للارتداد السريع في كل تكرار.',
    ],
  },
  'cable-glute-kickback': {
    stepImage: stepGluteKickback,
    stepCaptionsEn: [
      'Strap ankle cuff, face cable machine leaning torso ~20–30° forward holding frame, brace core flat.',
      'Sweep working leg straight backward and slightly outward (~15°) using strictly glute contraction.',
      'Pause 1 second at full hip extension—without arching your spine—then return leg smoothly forward.',
    ],
    stepCaptionsAr: [
      'ثبّت مربط الكاحل، مِل بالجذع للأمام بنحو 20–30° ممسكاً بإطار الجهاز، واشدد البطن والظهر.',
      'ادفع الساق للخلف باستقامة (ومائلة للخارج بنحو 15°) بانقباض عضلة الأرداف وحدها.',
      'توقف ثانية واحدة في أقصى امتداد للخلف دون تقويس الظهر، ثم أعد الساق ببطء.',
    ],
    simpleExplanationEn:
      'Attaching an ankle cuff to a low cable isolates one glute at a time through pure hip extension. Leaning slightly forward keeps your spine neutral, and stopping your leg kick the moment your hip finishes extending prevents your lower back from taking over.',
    simpleExplanationAr:
      'ربط الكاحل بالكابل السفلي يعزل عضلة الأرداف لكل ساق على حدة عبر حركة مد الورك للخلف. الميلان الطفيف للأمام يحافظ على حيادية العمود الفقري، والتوقف بمجرد انتهاء مدى امتداد الورك يمنع أسفل الظهر من التدخل لرفع الساق أعلى بالاندفاع.',
    tipsEn: [
      'Keep a very soft knee bend in both your standing leg and working leg.',
      'Kick slightly backward and out (~15° diagonal) to align cleanly with glute max fibers.',
      'Focus on moving strictly from the hip joint—your lower back stays frozen.',
    ],
    tipsAr: [
      'أبقِ انثناءً خفيفاً مريحاً في ركبة الساق الثابتة والساق المتحركة.',
      'وجّه الدفع للخلف وللخارج قليلاً (~15°) لمطابقة اتجاه ألياف عضلة الأرداف الكبرى.',
      'تخيل أن الحركة تبدأ وتنتهي في مفصل الورك بينما يبقى أسفل الظهر ثابتاً تماماً.',
    ],
    avoidEn: [
      'Arching your lumbar spine sharply upward just to kick higher.',
      'Swinging the leg forward past the standing foot for momentum.',
      'Opening your pelvis sideways toward the wall.',
    ],
    avoidAr: [
      'تقويس أسفل الظهر للأعلى لمحاولة رفع القدم إلى ارتفاع مبالغ فيه.',
      'أرجحة الساق للأمام والخلف بسرعة بالاندفاع الحركي.',
      'لف الحوض للجانب بدلاً من بقائه مواجهاً للجهاز.',
    ],
  },
  'standing-calf-raise-machine': {
    stepImage: stepCalfRaise,
    stepCaptionsEn: [
      'Set shoulder pads firmly, place balls of feet securely on step edge with knees straight (softly unlocked).',
      'Lower heels slowly all the way down into a deep calf stretch and pause 1–2s to eliminate bounce.',
      'Drive powerfully upward onto your big toes/forefeet, pause 1s at peak contraction, and repeat cleanly.',
    ],
    stepCaptionsAr: [
      'ثبّت الوسادتين على الكتفين وضع مشطي القدمين بإحكام على الحافة مع استقامة الركبتين دون قفل عنيف.',
      'أنزل الكعبين ببطء لأعمق تمدد ممكن وتوقف 1–2 ثانية في الأسفل لإلغاء الارتداد المرن.',
      'ادفع بقوة للأعلى على مقدمة القدم (جهة الإبهام الكبير) وثبّت ثانية في القمة قبل النزول.',
    ],
    simpleExplanationEn:
      'With straight knees, the large gastrocnemius calf muscle stays stretched and generates maximum force through ankle plantarflexion. The Achilles tendon behaves like a thick rubber band that rebounds energy if you bounce—so pausing 1–2 full seconds in the deep bottom stretch is essential for real calf growth.',
    simpleExplanationAr:
      'استقامة الركبتين تضع عضلة السمانة الكبرى في أقصى استعدادها للانقباض. ولأن وتر العرقوب يعمل كالنابض المطاطي إذا ارتددت سريعاً، فإن التوقف لمدة 1–2 ثانية في أقصى تمدد سفلي هو السر الأهم لإجبار ألياف السمانة نفسها على رفع الوزن مع وقفة ثانية واضحة في القمة.',
    tipsEn: [
      'Focus pressure over the balls of your big toes and second toes rather than rolling out to pinky toes.',
      'Hold a crystal-clear 1-second pause at the bottom stretch AND 1 second at the highest tip-toe peak.',
      'Keep hips and knees locked steadily straight—no squatting help.',
    ],
    tipsAr: [
      'ركّز الدفع عبر مشط القدم الداخلي (الإبهام الكبير وما يليه) دون انحراف الكاحل للخارج.',
      'التزم بوقفة ثانية واضحة في أقصى نزول وأخرى في أعلى قمة في كل تكرار.',
      'أبقِ الركبتين والوركين مستقيمين تماماً دون ثنيهما للمساعدة.',
    ],
    avoidEn: [
      'Bouncing up and down quickly like skipping rope—Achilles tendon does the work, not muscle.',
      'Cutting bottom stretch short so heels never drop below horizontal.',
      'Bending knees halfway through tough reps.',
    ],
    avoidAr: [
      'الارتداد السريع للأعلى والأسفل؛ لأنه يضيّع الجهد عن عضلة السمانة نفسها.',
      'عدم إنزال الكعبين أسفل مستوى الحافة لإطالة السمانة.',
      'ثني الركبتين أو دفعهما للأمام للمساعدة عند الإرهاق.',
    ],
  },
  'smith-standing-calf-raise': {
    stepImage: stepSmithCalf,
    stepCaptionsEn: [
      'Place a solid calf block directly under the Smith bar and position balls of feet firmly on the front edge.',
      'Lower heels smoothly downward to deep stretch, holding for 1–2 full seconds at the bottom.',
      'Drive high onto forefeet squeezing calves hard for 1s before descending slowly again.',
    ],
    stepCaptionsAr: [
      'ضع منصة ثابتة لا تنزلق أسفل بار السميث وثبّت مشطي القدمين بإحكام على حافتها.',
      'أنزل الكعبين بتحكم لأقصى إطالة سفلية مع ثبات لمدة 1–2 ثانية في الأسفل.',
      'ارتفع لأقصى قمة على مقدمة القدم واعصر السمانة ثانية ثم انزل ببطء.',
    ],
    simpleExplanationEn:
      'When gyms lack a dedicated standing calf machine, a Smith machine plus a sturdy step block delivers the exact same straight-knee calf overload safely. Because the rail holds balance steady, you can concentrate completely on slow full-range pauses at the bottom stretch and peak tip-toe raise.',
    simpleExplanationAr:
      'عند عدم توفر جهاز السمانة واقفاً، يمنحك جهاز السميث مع منصة ثابتة نفس الفعالية تماماً لتقوية السمانة الكبرى مع ثبات تام للبار. التزم بالنزول الكامل حتى أقصى تمدد مع وقفة 1–2 ثانية في الأسفل ثم الصعود البطيء لأعلى نقطة.',
    tipsEn: [
      'Use a solid dedicated calf block—never stack wobbly weight plates that can shift sideways.',
      'Set safety stoppers right below bottom stretch height before starting.',
      'Keep body aligned straight over your ankles so heels drop freely.',
    ],
    tipsAr: [
      'استخدم منصة صلبة وعريضة لا تتحرك وتجنب تكديس أقراص قابلة للانزلاق.',
      'اضبط مصدّات الأمان السفلية تماماً تحت مستوى أدنى نزول للسلامة.',
      'حافظ على استقامة جسمك عمودياً فوق الكاحلين دون ميل للأمام.',
    ],
    avoidEn: [
      'Bouncing rapidly through shallow half-reps.',
      'Letting ankles roll outward onto your outer shoe edges.',
      'Standing on slick blocks without proper grip.',
    ],
    avoidAr: [
      'الاهتزاز السريع بنصف مدى حركي دون وقفة سفلية.',
      'انحراف الكاحلين للخارج وفقدان التوازن على الحافة.',
      'الوقوف على سطح أملس قد ينزلق تحت الأوزان الثقيلة.',
    ],
  },
  'seated-calf-raise': {
    stepImage: stepSeatedCalf,
    stepCaptionsEn: [
      'Sit upright with knee pad locked snugly right above knees and balls of feet resting securely on footplate.',
      'Lower heels deeply toward the floor into a complete stretch and pause 1–2s.',
      'Drive heels up smoothly as high as possible, squeeze 1s at peak contraction, and lower slowly.',
    ],
    stepCaptionsAr: [
      'اجلس باستقامة مع تثبيت الوسادة فوق الركبتين مباشرة ووضع مشطي القدمين على الحافة.',
      'أنزل الكعبين للأسفل بأقصى مدى مريح وتوقف 1–2 ثانية في وضع الإطالة.',
      'ارفع الكعبين للأعلى لأقصى ارتفاع ممكن، اعصر السمانة ثانية، ثم انزل ببطء.',
    ],
    simpleExplanationEn:
      'Bending the knees 90° puts the upper gastrocnemius slack, forcing the deep underlying soleus muscle to handle nearly the entire workload. Training both seated (bent-knee) and standing (straight-knee) calf raises ensures complete lower-leg width, depth, and ankle resilience.',
    simpleExplanationAr:
      'ثني الركبتين بزاوية 90° أثناء الجلوس يقلل مساهمة السمانة السطحية، مما يجبر الجزء العميق من عضلة السمانة على تحمل الحمل الكامل. الجمع بين التمرين جالساً وواقفاً يضمن نمواً متكاملاً لشكل الساق السفلي من جميع الزوايا مع إبطاء الحركة وإلغاء الارتداد.',
    tipsEn: [
      'Set the thigh pad tight enough that your knees stay stable—not floating under the lever.',
      'Hold a clean 1–2s pause at full bottom stretch before driving up.',
      'Push cleanly through the ball of your big toe for peak soleus contraction.',
    ],
    tipsAr: [
      'اضبط ارتفاع وسادة الركبة بحيث تكون محكمة فوق الفخذين دون فراغ زائد.',
      'توقف 1–2 ثانية في الأسفل عند أقصى إطالة لتشغل عضلة السمانة نفسها دون ارتداد.',
      'اضغط عبر مشط القدم الداخلي لتحقيق أفضل ارتفاع وانقباض في القمة.',
    ],
    avoidEn: [
      'Bouncing plates violently without pausing at the bottom.',
      'Leaning your chest forward over the pads to press down with upper-body weight.',
      'Cutting out the top third of the raise.',
    ],
    avoidAr: [
      'الأرجحة السريعة بالأوزان دون توقف حقيقي في الأسفل والاعتماد على الارتداد.',
      'الاتكاء بوزن جذعك فوق الوسادة بدلاً من الاقتصار على حركة الكاحل.',
      'عدم الصعود لأقصى ارتفاع ممكن في كل تكرار.',
    ],
  },

  // CORE
  'cable-crunch': {
    stepImage: stepCableCrunch,
    stepCaptionsEn: [
      'Kneel back from high pulley, hold rope handles pinned tightly beside forehead/temples, hips locked vertical.',
      'Curl your ribcage smoothly downward toward your pelvis (rounding upper/mid spine)—keep hips completely still.',
      'Exhale fully squeezing abs hard at bottom crunch, then uncurl slowly under tension back upright.',
    ],
    stepCaptionsAr: [
      'اركع بعيداً قليلاً عن الكابل العلوي مع تثبيت طرفي الحبل بجانب الجبهة أو الأذنين وثبات الوركين.',
      'اطوِ القفص الصدري للأسفل باتجاه الحوض (بثني العمود الفقري) دون إرجاع الأرداف للخلف.',
      'أفرغ النفس واعصر عضلات البطن بشدة في الأسفل، ثم اصعد ببطء مع إبقاء البطن مشدوداً.',
    ],
    simpleExplanationEn:
      'The abdominal wall flexes the spine—bringing your ribs closer to your pelvis—not the hips. Lock your hips upright and imagine curling your torso into a ball toward your belly button while keeping your hands glued beside your head so your arms cannot pull the rope.',
    simpleExplanationAr:
      'وظيفة عضلات البطن هي ثني العمود الفقري وتقريب القفص الصدري من الحوض، وليس ثني مفصل الورك. لذلك ثبّت وركيك عموديين دون الجلوس للخلف على كعبيك، وثبّت الحبل بجانب جبهتك، ثم اطوِ جذعك للأسفل نحو السرة مع إفراغ النفس بالكامل في الأسفل لتشعر بتركيز مباشر في البطن.',
    tipsEn: [
      'Glue the rope handles directly against your forehead/ears so biceps and lats cannot take over.',
      'Breathe all air out sharply as you crunch down to maximize deep abdominal contraction.',
      'Stop returning upward before your lower back arches or weight plates clank down.',
    ],
    tipsAr: [
      'ثبّت اليدين ملاصقتين تماماً للجبهة أو الأذنين حتى لا تسحب الحبل بالذراعين أو الظهر.',
      'ازفر الهواء بالكامل أثناء الطي للأسفل لمضاعفة عصر عضلات البطن.',
      'اصعد بتحكم وتوقف قبل ارتخاء الشد أو تقوّس ظهرك للخلف.',
    ],
    avoidEn: [
      'Sitting backward toward your heels and bowing straight down with a rigid flat back (all hip flexors).',
      'Pulling the rope downward past your face using your arms.',
      'Loading heavy stacks that lift you right off your knees.',
    ],
    avoidAr: [
      'الجلوس للخلف على الكعبين والانحناء بظهر مستقيم لأن ذلك يشغّل عضلات الورك لا البطن.',
      'سحب الحبل بالذراعين للأعلى والأسفل مع إبعاد اليدين عن الرأس.',
      'وضع وزن ثقيل جداً يرفع جسمك عن الأرض ويفقدك الثبات.',
    ],
  },
  'hanging-leg-raise': {
    stepImage: stepLegRaise,
    stepCaptionsEn: [
      'Hang calmly from overhead bar with shoulders gently engaged (depressed) so torso stays completely still.',
      'Lift legs—or bent knees—upward, then finish by curling your pelvis upward toward your ribcage.',
      'Lower slowly under control all the way down without swinging backward behind your body.',
    ],
    stepCaptionsAr: [
      'تعلّق بالبار العلوي مع شد خفيف للكتفين والبطن لإيقاف أي تأرجح قبل البدء.',
      'ارفع الساقين (أو الركبتين مثنيتين للمبتدئ) للأعلى، ثم أدر حوضك للأعلى نحو الصدر.',
      'انزل ببطء وتحكم كامل دون ترك الساقين تتأرجحان للخلف أسفل البار.',
    ],
    simpleExplanationEn:
      'Lifting your legs just to 90° works mainly your hip flexors; the real abdominal magic happens in the final upward curl when you tilt your pelvis and tailbone up toward your chest. Control both the curl upward and the slow descent to eliminate momentum and sculpt the lower abdominals.',
    simpleExplanationAr:
      'رفع الساقين حتى الزاوية القائمة (90°) يشغّل منطقة الورك أكثر من البطن؛ أما العمل الحقيقي لعضلات البطن فيبدأ في الجزء الأخير حين ترفع حوضك للأعلى قليلاً نحو صدرك. النزول البطيء يمنع التأرجح ويركّز الحمل على أسفل البطن.',
    tipsEn: [
      'Bend knees smoothly toward your chest ("hanging knee-to-chest raise") if straight legs prevent pelvic curl.',
      'Imagine showing the soles of your shoes toward the ceiling at the top of the rep.',
      'Use lifting straps if grip gives out before your abs do.',
    ],
    tipsAr: [
      'ابدأ بثني الركبتين ورفعهما نحو الصدر إذا لم تستطع رفع الحوض للأعلى بساقين مستقيمتين.',
      'احرص على توجيه أسفل الحوض والركبتين نحو السقف في أعلى نقطة من التكرار.',
      'استخدم أربطة المساعدة للقبضة إذا ضعفت قبضتك قبل إجهاد عضلات البطن.',
    ],
    avoidEn: [
      'Using momentum swing to kick legs up wildly.',
      'Stopping at horizontal 90° and lowering immediately without curling the pelvis.',
      'Dropping legs fast so your body swings like a pendulum.',
    ],
    avoidAr: [
      'تأرجح الجسم للخلف ثم دفع الساقين بالاندفاع الحركي.',
      'الاكتفاء برفع الساقين للأمام 90° دون رفع الحوض للأعلى نحو الصدر.',
      'ترك الساقين تسقطان سريعاً مما يسبب اهتزازاً مستمراً.',
    ],
  },
  'plank-hold': {
    stepImage: stepPlankHold,
    stepCaptionsEn: [
      'Start on forearms with elbows directly beneath shoulders, then lift knees off the mat onto your toes in one straight line.',
      'Squeeze glutes, quads, and abs simultaneously while keeping hips level—never sagging or piking.',
      'Hold steady breathing evenly through nose/mouth—stop the set if your lower back starts sagging.',
    ],
    stepCaptionsAr: [
      'ارتكز على الساعدين تحت الكتفين مباشرة، ابدأ من الركبتين ثم ارفع جسمك على أصابع القدمين بخط مستقيم تماماً.',
      'اشدد الأرداف والفخذين والبطن معاً مع إبقاء الجسم مستقيماً دون هبوط أو ارتفاع في الوركين.',
      'حافظ على التنفس الهادئ والانتظام في الثبات، وأنهِ الجولة فور بدء هبوط أسفل الظهر.',
    ],
    simpleExplanationEn:
      'A plank is an active total-body brace against gravity trying to sag your spine downward—never a passive rest on your joints. Squeezing your glutes hard while subtly pulling your elbows toward your toes transforms a light hold into an intense deep-core contraction in just 20–40 seconds.',
    simpleExplanationAr:
      'البلانك تمرين ثبات نشط لمقاومة هبوط الظهر نحو الأرض وليس مجرد استناد ساكن على المرفقين. ابدأ بوضع ساعديك تحت كتفيك، ثم ارفع ركبتيك لتقف على أصابع القدمين بخط مستقيم مع شد البطن والأرداف والفخذين بقوة لمدة 20–40 ثانية.',
    tipsEn: [
      'Tuck your pelvis slightly under (posterior tilt) by squeezing glutes—this locks abs tight.',
      'Push your forearms gently away from the floor so shoulder blades stay wide and solid.',
      'Stop the timer as soon as form cracks; quality 30s beats sloppy 2-minute sagging.',
    ],
    tipsAr: [
      'اشدد الأرداف للداخل قليلاً مع سحب البطن نحو الظهر؛ فهذه الوضعية تشغّل البطن بأقصى قوة.',
      'ادفع الأرض بساعديك قليلاً للأعلى حتى لا يغوص صدرك بين كتفيك.',
      'أنهِ التكرار بمجرد فقدان استقامة الظهر؛ 30 ثانية متقنة أفضل من دقيقتين بظهر مقوّس.',
    ],
    avoidEn: [
      'Letting your lower back sag into an arch toward the floor.',
      'Pushing hips high up into a tent/pyramid to make the hold easy.',
      'Holding your breath stiffly or dropping your head down toward your chest.',
    ],
    avoidAr: [
      'سقوط البطن وتقوّس أسفل الظهر للأسفل نحو الأرض.',
      'رفع الوركين للأعلى بشكل هرمي لتخفيف العبء عن البطن.',
      'حبس النفس أو تدلي الرأس للأسفل بعيداً عن استقامة العمود الفقري.',
    ],
  },
  'resistance-band-pallof-press': {
    stepImage: stepPallofPress,
    stepCaptionsEn: [
      'Anchor band at chest height, step sideways into a balanced athletic stance until band carries firm tension.',
      'Hold handle against center of sternum, brace core, and press hands straight forward—fighting sideways twist.',
      'Hold arms extended steady for 2 full seconds keeping shoulders & hips square, then return to chest.',
    ],
    stepCaptionsAr: [
      'ثبّت حبل المقاومة بمستوى الصدر وقف جانبياً في وقفة متزنة مع الابتعاد حتى يصبح الحبل مشدوداً بوضوح.',
      'أمسك المقبض أمام منتصف الصدر، اشدد البطن، وادفع يديك للأمام باستقامة مقاوماً سحب الحبل للجانب.',
      'ثبّت ذراعيك ممدودتين لمدة ثانيتين مع استقامة الكتفين والوركين تماماً ثم عُد للصدر.',
    ],
    simpleExplanationEn:
      'Standing sideways while the band pulls laterally forces your obliques and deep core stabilizers to fire hard so your torso does not twist. As you press your hands straight out from your chest, the lever lengthens and rotational demand spikes—building functional spinal stability.',
    simpleExplanationAr:
      'وقوفك جانبياً بينما يسحبك الحبل نحو الجهة الأخرى يجبر عضلات الخواصر والبطن العميقة على الانقباض بقوة لمنع التفاف الجذع. عند دفع يديك للأمام باستقامة تزداد قوة العزم التي تحاول لَفّك، فتتدرّب عضلات الجذع على حماية عمودك الفقري ضد الدوران.',
    tipsEn: [
      'Keep knees softly unlocked and weight centered evenly over both feet.',
      'Press directly straight out from the center line of your chest—not angled toward the anchor.',
      'Complete equal sets facing both left and right sides.',
    ],
    tipsAr: [
      'اثنِ الركبتين قليلاً جداً ووزّع وزنك بالتساوي على القدمين.',
      'ادفع المقبض باستقامة تماماً للأمام أمام منتصف صدرك دون انحراف نحو نقطة التثبيت.',
      'نفّذ نفس عدد الجولات والتكرارات لكل من الجانب الأيمن والأيسر.',
    ],
    avoidEn: [
      'Allowing your chest, shoulders, or hips to twist toward the band anchor.',
      'Leaning sideways with your body weight instead of resisting through the core.',
      'Rushing hands in and out without pausing 1–2s at full extension.',
    ],
    avoidAr: [
      'السماح للكتفين أو الوركين بالالتفاف نحو جهة الحبل.',
      'الميلان بالجسم للجانب البعيد لتعويض نقص شد البطن.',
      'الدفع السريع ذهاباً وإياباً دون ثبات في وضع الامتداد.',
    ],
  },
  'machine-ab-crunch': {
    stepImage: stepMachineAbCrunch,
    stepCaptionsEn: [
      'Sit upright with ankles anchored under the bottom rollers, shoulders against pads, and hands lightly gripping the handles.',
      'Exhale and curl your ribcage smoothly forward and downward toward your pelvis—keep arms relaxed as hooks.',
      'Hold peak abdominal contraction for 1 second, then uncurl slowly back without letting the weight stack slam.',
    ],
    stepCaptionsAr: [
      'اجلس باستقامة مع تثبيت الكاحلين أسفل الوسادات السفلية وإسناد الكتفين للوسادة وإمساك المقابض برفق.',
      'ازفر واطوِ القفص الصدري للأمام وللأسفل نحو الحوض دون شد المقابض بقوة الذراعين.',
      'ثبّت عصر المعدة لمدة ثانية في الأسفل ثم عد ببطء دون ترك الأوزان ترتطم ببعضها.',
    ],
    simpleExplanationEn:
      'Seated ab crunch machines guide spinal flexion along a stable arc so you can safely overload your abdominal muscles just like any other muscle group. Focus on curling your upper chest down toward your belly button rather than pulling downward with your arms or leaning with stiff hips.',
    simpleExplanationAr:
      'يوفر جهاز طحن المعدة مساراً ثابتاً لثني العمود الفقري مما يسمح بتحميل عضلات البطن بأوزان تدريجية آمنة مثل أي عضلة أخرى. ركز على تقريب قفصك الصدري من منطقة السرة عبر انقباض البطن نفسه، واجعل يديك لمجرد تثبيت المقابض لا للسحب.',
    tipsEn: [
      'Adjust the seat so the machine pivot sits right beside your mid-abdomen/waist.',
      'Breathe all air out as you crunch downward to deepen abdominal engagement.',
      'Control the backward return over 2–3 seconds without resting between reps.',
    ],
    tipsAr: [
      'اضبط المقعد بحيث يتحاذى محور الجهاز مع منتصف البطن أو الخصر.',
      'أفرغ الهواء بالكامل أثناء الطي للأسفل لتعظيم انقباض عضلات البطن.',
      'عد للخلف ببطء خلال 2–3 ثوانٍ وتجنب إرخاء الشد تماماً بين التكرارات.',
    ],
    avoidEn: [
      'Yanking handles forward using biceps, shoulders, and lats.',
      'Bending neck violently chin-to-chest while keeping the mid-back straight.',
      'Slamming plates back down after every repetition.',
    ],
    avoidAr: [
      'سحب المقابض بقوة الذراعين والكتفين بدلاً من انثناء الجذع.',
      'ثني الرقبة بقوة للأمام مع بقاء الظهر والبطن مفرودين دون حركة حقيقية.',
      'ترك الأوزان تهبط بسرعة وترتطم في نهاية كل تكرار.',
    ],
  },
};

export function getExerciseQuickGuide(exercise: Exercise): ExerciseQuickGuide {
  const mapped = EXERCISE_GUIDES[exercise.id];
  if (mapped) return mapped;

  // Fallback for custom user-created exercises
  return {
    stepCaptionsEn: [
      exercise.startingPositionEn || 'Establish a stable posture with core braced and balanced grip.',
      exercise.instructionsEn[0] || 'Control the lowering/stretching phase over 2–3 seconds smoothly.',
      exercise.instructionsEn[1] || 'Drive through the target muscle without swinging and return smoothly.',
    ],
    stepCaptionsAr: [
      exercise.startingPositionAr || 'اضبط وضعية ثابتة ومتزنة مع شد البطن وقبضة محكمة.',
      exercise.instructionsAr[0] || 'تحكم في مرحلة النزول أو الإطالة ببطء خلال 2–3 ثوانٍ.',
      exercise.instructionsAr[1] || 'ادفع أو اسحب بتركيز العضلة المستهدفة دون أرجحة ثم عد بسلاسة.',
    ],
    simpleExplanationEn:
      exercise.startingPositionEn ||
      `Controlled resistance movement targeting ${exercise.primaryMuscles.join(', ')} through full joint range.`,
    simpleExplanationAr:
      exercise.startingPositionAr ||
      'تمرين مقاومة منضبط يستهدف العضلات المحددة بمدى حركي كامل وتحكم في المسار دون اندفاع.',
    tipsEn: [
      exercise.instructionsEn[0] || 'Set a stable posture and brace your core before starting.',
      exercise.instructionsEn[1] || 'Control the lowering phase smoothly over 2–3 seconds.',
      exercise.breathingEn || 'Exhale smoothly during effort and breathe evenly between reps.',
    ],
    tipsAr: [
      exercise.instructionsAr[0] || 'ابدأ بوضعية ثابتة ومتزنة مع شد عضلات الجذع.',
      exercise.instructionsAr[1] || 'تحكم في مرحلة النزول ببطء خلال 2–3 ثوانٍ.',
      exercise.breathingAr || 'ازفر أثناء الدفع أو السحب وتنفّس بانتظام بين التكرارات.',
    ],
    avoidEn: [
      exercise.commonMistakesEn[0] || 'Using body momentum or swinging to lift heavier weight.',
      exercise.commonMistakesEn[1] || 'Cutting range of motion short of a clean stretch.',
      exercise.safetyEn || 'Losing joint alignment or letting posture break under fatigue.',
    ],
    avoidAr: [
      exercise.commonMistakesAr[0] || 'استخدام الاندفاع وأرجحة الجسم لرفع وزن زائد.',
      exercise.commonMistakesAr[1] || 'تقصير المدى الحركي وإهمال الإطالة الكاملة.',
      exercise.safetyAr || 'فقدان استقامة المفاصل أو الوضعية الصحيحة عند الإرهاق.',
    ],
  };
}
