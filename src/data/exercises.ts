import { Exercise } from '../types/ironlog';

export const BUILTIN_EXERCISES: Exercise[] = [
  // CHEST
  {
    id: 'barbell-bench-press',
    nameEn: 'Barbell Flat Bench Press',
    nameAr: 'بنش مستوي وسط',
    primaryMuscles: ['chest'],
    secondaryMuscles: ['shoulders', 'triceps'],
    equipment: 'barbell',
    category: 'compound',
    difficulty: 'intermediate',
    startingPositionEn: 'Lie flat on the bench with eyes under the bar. Plant feet firmly on the floor, retract and depress shoulder blades into the bench, and grip the bar slightly wider than shoulder-width.',
    startingPositionAr: 'استلقِ على المقعد المستوي بحيث تكون عيناك أسفل البار مباشرة. ثبّت قدميك بقوة على الأرض، اسحب لوحي الكتف للخلف وللأسفل، وأمسك البار بقبضة أعرض قليلاً من عرض الكتفين.',
    instructionsEn: [
      'Unrack the bar with locked elbows and position it directly over your mid-chest.',
      'Lower the bar under control toward the lower-mid sternum while keeping elbows tucked at roughly 45 degrees.',
      'Lightly touch the chest without bouncing the bar.',
      'Drive feet into the floor and press the bar up and slightly back toward the starting position over the shoulders.'
    ],
    instructionsAr: [
      'ارفع البار عن الحامل بمرفقين مستقيمين وثبّته فوق منتصف الصدر.',
      'أنزل البار بتحكم نحو منتصف الصدر مع إبقاء المرفقين بزاوية تقارب 45 درجة.',
      'المس الصدر برفق دون ارتداد أو قفز للبار.',
      'ادفع الأرض بقدميك وارفع البار للأعلى وللخلف قليلاً حتى نقطة البداية فوق الكتفين.'
    ],
    breathingEn: 'Inhale deeply and brace your core before lowering the bar; exhale steadily as you press past the sticking point.',
    breathingAr: 'خذ شهيقاً عميقاً واشدد عضلات الجذع قبل إنزال البار، ثم ازفر بثبات أثناء الدفع بعد تجاوز أصعب نقطة.',
    commonMistakesEn: [
      'Flaring elbows out to 90 degrees, increasing shoulder stress.',
      'Bouncing the bar off the chest or lifting hips off the bench.',
      'Losing scapular retraction at the top of the press.'
    ],
    commonMistakesAr: [
      'فتح المرفقين بزاوية 90 درجة مما يزيد الضغط على مفصل الكتف.',
      'ضرب البار بالصدر للارتداد أو رفع الأرداف عن المقعد.',
      'فقدان ثبات لوحي الكتف في أعلى الحركة.'
    ],
    safetyEn: 'Use safety pins or a spotter when lifting heavy sets. Keep wrists stacked vertically over forearms.',
    safetyAr: 'استخدم حواجز الأمان أو شريك مساعدة عند رفع الأوزان الثقيلة، وحافظ على استقامة المعصمين فوق الساعدين.',
    alternativeIds: ['dumbbell-bench-press', 'smith-bench-press', 'chest-press-machine']
  },
  {
    id: 'incline-dumbbell-press',
    nameEn: 'Incline Dumbbell Press',
    nameAr: 'ضغط دمبلص عالي',
    primaryMuscles: ['chest'],
    secondaryMuscles: ['shoulders', 'triceps'],
    equipment: 'dumbbell',
    category: 'compound',
    difficulty: 'beginner',
    startingPositionEn: 'Set an adjustable bench to 30–45 degrees. Sit back with dumbbells resting over your upper chest, palms facing forward, and feet planted flat.',
    startingPositionAr: 'اضبط المقعد المائل بزاوية 30 إلى 45 درجة. اجلس بإحكام مع حمل الدامبل فوق أعلى الصدر، راحتا اليد للأمام، والقدمان ثابتتان على الأرض.',
    instructionsEn: [
      'Retract shoulder blades and brace your torso against the bench pad.',
      'Press both dumbbells upward along a slight inward arc until arms are nearly extended.',
      'Lower slowly over 2–3 seconds until dumbbells reach upper-chest level with a deep chest stretch.',
      'Pause briefly at the bottom before pressing back up.'
    ],
    instructionsAr: [
      'اسحب لوحي الكتف للخلف وثبّت جذعك على مسند المقعد.',
      'ادفع الدامبل للأعلى في قوس طفيف للداخل حتى يقترب المرفقان من الاستقامة.',
      'أنزل الوزن ببطء خلال 2–3 ثوانٍ حتى مستوى أعلى الصدر مع الشعور بتمدد واضح.',
      'توقف لحظة في الأسفل قبل الدفع مجدداً.'
    ],
    breathingEn: 'Inhale during the controlled descent; exhale during the press.',
    breathingAr: 'شهيق أثناء النزول المتحكم به، وزفير أثناء الدفع للأعلى.',
    commonMistakesEn: [
      'Setting the bench incline too steep (above 45 degrees), shifting load onto front delts.',
      'Clanking dumbbells together loudly at the top and losing tension.'
    ],
    commonMistakesAr: [
      'رفع زاوية المقعد أكثر من 45 درجة مما يحوّل التركيز إلى الكتف الأمامي.',
      'اصطدام الدامبل ببعضهما في الأعلى وفقدان التوتر العضلي.'
    ],
    safetyEn: 'Kick dumbbells up with your thighs to get into position safely; lower them to your knees after the final rep.',
    safetyAr: 'ارفع الدامبل بمساعدة الفخذين عند البداية، وأنزلهما على الركبتين بأمان بعد آخر تكرار.',
    alternativeIds: ['barbell-bench-press', 'smith-bench-press', 'cable-chest-fly']
  },
  {
    id: 'cable-chest-fly',
    nameEn: 'Standing Cable Chest Fly',
    nameAr: 'جمع أسلاك',
    primaryMuscles: ['chest'],
    secondaryMuscles: ['shoulders'],
    equipment: 'cable',
    category: 'isolation',
    difficulty: 'beginner',
    startingPositionEn: 'Set cable pulleys at chest height. Hold handles, step forward into a staggered stance for stability, keep a slight bend in the elbows, and open arms wide.',
    startingPositionAr: 'اضبط بكرات الكابل على مستوى الصدر. أمسك المقبضين وتقدم خطوة للأمام بوضعية متزنة، مع ثني طفيف في المرفقين وفتح الذراعين للخارج.',
    instructionsEn: [
      'Keep your chest lifted and shoulders pressed down away from your ears.',
      'Sweep both arms forward in a wide hugging arc until your hands meet in front of your sternum.',
      'Squeeze the pectoral muscles hard for 1 second at peak contraction.',
      'Return slowly along the same arc until you feel a controlled stretch across the chest.'
    ],
    instructionsAr: [
      'حافظ على رفع الصدر وخفض الكتفين بعيداً عن الأذنين.',
      'اجمع الذراعين للأمام في مسار قوسي واسع حتى تلتقي اليدان أمام منتصف الصدر.',
      'اعصر عضلة الصدر بقوة لمدة ثانية واحدة عند أقصى انقباض.',
      'عد ببطء في نفس المسار حتى تشعر بتمدد مريح ومسيطر عليه في الصدر.'
    ],
    breathingEn: 'Exhale while bringing handles together; inhale as your arms open back.',
    breathingAr: 'ازفر أثناء جمع المقبضين معاً، وخذ شهيقاً أثناء فتح الذراعين.',
    commonMistakesEn: [
      'Bending and straightening the elbows excessively, turning the fly into a press.',
      'Using momentum by leaning the torso heavily forward.'
    ],
    commonMistakesAr: [
      'ثني وفرد المرفقين بشكل مبالغ فيه مما يحوّل التمرين من تفتيح إلى دفع.',
      'استخدام اندفاع الجذع للأمام بدلاً من عزل عضلة الصدر.'
    ],
    safetyEn: 'Do not allow the shoulders to roll forward past neutral on the eccentric stretch.',
    safetyAr: 'تجنب سحب الكتفين للأمام أو للخلف بشكل مفرط عند أقصى تمدد لتجنب إجهاد المفصل.',
    alternativeIds: ['pec-deck-machine', 'incline-dumbbell-press']
  },
  {
    id: 'smith-bench-press',
    nameEn: 'Smith Machine Flat Press',
    nameAr: 'بنش مستوي وسط سميث',
    primaryMuscles: ['chest'],
    secondaryMuscles: ['shoulders', 'triceps'],
    equipment: 'smith_machine',
    category: 'compound',
    difficulty: 'beginner',
    startingPositionEn: 'Center a flat bench inside the Smith machine so the bar aligns over your mid-chest. Retract shoulder blades and grip symmetrically.',
    startingPositionAr: 'ضع المقعد المستوي في منتصف جهاز السميث بحيث يوازي البار منتصف الصدر. اسحب لوحي الكتف للخلف وأمسك البار بتوازن.',
    instructionsEn: [
      'Rotate the bar to unhook the safety latches.',
      'Lower the bar smoothly to the mid-chest with elbows angled ~45 degrees.',
      'Press forcefully back up without locking elbows harshly.'
    ],
    instructionsAr: [
      'أدر البار لتحرير أقفال الأمان.',
      'أنزل البار بسلاسة إلى منتصف الصدر مع إبقاء المرفقين بزاوية 45 درجة.',
      'ادفع البار للأعلى بقوة دون قفل المرفقين بعنف.'
    ],
    breathingEn: 'Inhale down, exhale on the press.',
    breathingAr: 'شهيق عند النزول، زفير عند الدفع.',
    commonMistakesEn: ['Misaligning the bench so the bar lands near the neck or stomach.'],
    commonMistakesAr: ['وضع المقعد بمحاذاة خاطئة تجعل البار ينزل باتجاه الرقبة أو البطن.'],
    safetyEn: 'Always set the mechanical safety stops just below chest touch height.',
    safetyAr: 'اضبط مصدّات الأمان السفلية دائماً أسفل مستوى ملامسة الصدر مباشرة.',
    alternativeIds: ['barbell-bench-press', 'chest-press-machine']
  },
  {
    id: 'chest-press-machine',
    nameEn: 'Seated Chest Press Machine',
    nameAr: 'ضغط صدر',
    primaryMuscles: ['chest'],
    secondaryMuscles: ['shoulders', 'triceps'],
    equipment: 'machine',
    category: 'compound',
    difficulty: 'beginner',
    startingPositionEn: 'Adjust seat height so handles align with mid-chest. Sit firmly against the backrest with shoulder blades retracted.',
    startingPositionAr: 'اضبط ارتفاع المقعد بحيث تتحاذى المقابض مع منتصف الصدر، وثبّت ظهرك ولوحي الكتف على المسند.',
    instructionsEn: [
      'Grasp handles firmly and press forward smoothly until elbows are nearly extended.',
      'Control the return back until a deep stretch is felt without letting the weight stack slam.'
    ],
    instructionsAr: [
      'أمسك المقابض بقوة وادفع للأمام بسلاسة حتى يقترب الذراعان من الاستقامة.',
      'تحكم في الرجوع للخلف حتى تشعر بتمدد الصدر دون ترك الأوزان ترتطم ببعضها.'
    ],
    breathingEn: 'Exhale on the push, inhale on the return.',
    breathingAr: 'زفير عند الدفع، شهيق عند الرجوع.',
    commonMistakesEn: ['Protracting shoulders forward off the pad at lockout.'],
    commonMistakesAr: ['تقديم الكتفين للأمام وفصلهما عن المسند في نهاية الدفع.'],
    safetyEn: 'Use the foot lever if provided to bring handles into a safe starting range.',
    safetyAr: 'استخدم دواسة القدم إن وجدت لوضع المقابض في نطاق بداية آمن للكتفين.',
    alternativeIds: ['barbell-bench-press', 'push-ups']
  },
  {
    id: 'push-ups',
    nameEn: 'Standard Push-Up',
    nameAr: 'بوش اب',
    primaryMuscles: ['chest'],
    secondaryMuscles: ['shoulders', 'triceps'],
    equipment: 'bodyweight',
    category: 'compound',
    difficulty: 'beginner',
    startingPositionEn: 'Start in a rigid high plank with hands slightly wider than shoulders, glutes squeezed, and body forming a straight line.',
    startingPositionAr: 'ابدأ بوضعية الارتكاز العلوي مع وضع اليدين أعرض قليلاً من الكتفين وشد عضلات البطن والأرداف في خط مستقيم.',
    instructionsEn: [
      'Lower your chest toward the floor by bending elbows at roughly 45 degrees.',
      'Pause lightly just above the floor while maintaining a rigid torso.',
      'Push the floor away cleanly back to plank position.'
    ],
    instructionsAr: [
      'أنزل صدرك نحو الأرض بثني المرفقين بزاوية 45 درجة تقريباً.',
      'توقف لحظة قبل ملامسة الأرض مع الحفاظ على استقامة الجسم بالكامل.',
      'ادفع الأرض بقوة للعودة إلى وضعية البداية.'
    ],
    breathingEn: 'Inhale as you lower; exhale as you press up.',
    breathingAr: 'شهيق أثناء النزول، زفير أثناء الصعود.',
    commonMistakesEn: ['Sagging the lower back or flaring elbows wide.'],
    commonMistakesAr: ['تقوّس أسفل الظهر للأسفل أو فتح المرفقين للخارج كثيراً.'],
    safetyEn: 'Elevate hands on a bench to reduce load if needed.',
    safetyAr: 'يمكنك وضع اليدين على مقعد مرتفع لتقليل المقاومة إذا لزم الأمر.',
    alternativeIds: ['chest-press-machine', 'resistance-band-chest-press']
  },
  {
    id: 'resistance-band-chest-press',
    nameEn: 'Resistance Band Chest Press',
    nameAr: 'دفع صدر بحبل المقاومة',
    primaryMuscles: ['chest'],
    secondaryMuscles: ['shoulders', 'triceps'],
    equipment: 'resistance_bands',
    category: 'compound',
    difficulty: 'beginner',
    startingPositionEn: 'Anchor a resistance band behind you at chest height or loop it around your upper back. Step forward into a split stance with handles at chest level.',
    startingPositionAr: 'ثبّت حبل المقاومة خلفك على مستوى الصدر أو مرّره خلف أعلى الظهر، وتقدم بقدم للأمام لثبات التوازن.',
    instructionsEn: [
      'Press both hands forward and slightly inward until arms extend.',
      'Hold peak contraction briefly, then return slowly against band tension.'
    ],
    instructionsAr: [
      'ادفع اليدين للأمام وللداخل قليلاً حتى استقامة الذراعين.',
      'ثبّت الانقباض لحظة ثم عد ببطء مع مقاومة الحبل.'
    ],
    breathingEn: 'Exhale while pressing forward; inhale on return.',
    breathingAr: 'زفير عند الدفع، شهيق عند الرجوع.',
    commonMistakesEn: ['Allowing the band to snap arms back uncontrollably.'],
    commonMistakesAr: ['ترك الحبل يسحب الذراعين للخلف بسرعة دون تحكم.'],
    safetyEn: 'Inspect band anchor and tubing for tears before each set.',
    safetyAr: 'افحص نقطة التثبيت وسلامة الحبل المطاطي قبل كل جولة.',
    alternativeIds: ['push-ups', 'cable-chest-fly']
  },

  // BACK
  {
    id: 'barbell-bent-over-row',
    nameEn: 'Barbell Bent-Over Row',
    nameAr: 'تجديف بار منحني',
    primaryMuscles: ['back'],
    secondaryMuscles: ['biceps', 'forearms', 'shoulders'],
    equipment: 'barbell',
    category: 'compound',
    difficulty: 'intermediate',
    startingPositionEn: 'Stand with feet hip-width apart, grip the bar just outside your knees, hinge at the hips until your torso is at roughly 45 degrees with a neutral spine.',
    startingPositionAr: 'قف بقدمين بعرض الورك، أمسك البار أعرض قليلاً من الركبتين، وانحنِ من مفصل الورك بزاوية تقارب 45 درجة مع استقامة العمود الفقري.',
    instructionsEn: [
      'Brace your core and keep your neck neutral.',
      'Pull the bar toward your lower sternum / upper abdomen by driving elbows back and squeezing shoulder blades.',
      'Pause briefly at the top against your torso.',
      'Lower the bar under full control until arms are extended without rounding your lower back.'
    ],
    instructionsAr: [
      'اشدد عضلات الجذع وحافظ على استقامة الرقبة.',
      'اسحب البار نحو أسفل الصدر أو أعلى البطن بدفع المرفقين للخلف وضم لوحي الكتف.',
      'ثبّت لحظة عند ملامسة الجذع.',
      'أنزل البار بتحكم كامل حتى استقامة الذراعين دون تقوّس أسفل الظهر.'
    ],
    breathingEn: 'Inhale and brace before pulling; exhale at the top or during lowering.',
    breathingAr: 'شهيق وشد للبطن قبل السحب، وزفير عند أعلى نقطة أو أثناء الإنزال.',
    commonMistakesEn: [
      'Rounding the lumbar spine under heavy load.',
      'Using excessive torso heave to swing the weight up.'
    ],
    commonMistakesAr: [
      'تقوّس أسفل الظهر تحت الوزن الثقيل.',
      'استخدام تأرجح الجذع للأعلى لرفع الوزن بالاندفاع.'
    ],
    safetyEn: 'Maintain a braced neutral lower back throughout every rep.',
    safetyAr: 'حافظ على استقامة وشد أسفل الظهر طوال جميع التكرارات.',
    alternativeIds: ['chest-supported-row-machine', 'single-arm-dumbbell-row', 'seated-cable-row']
  },
  {
    id: 'lat-pulldown',
    nameEn: 'Wide-Grip Lat Pulldown',
    nameAr: 'سحب بكرة عمودي عريض',
    primaryMuscles: ['back'],
    secondaryMuscles: ['biceps', 'forearms'],
    equipment: 'cable',
    category: 'compound',
    difficulty: 'beginner',
    startingPositionEn: 'Lock thighs firmly under the knee pad. Grip the bar slightly wider than shoulder-width with palms facing forward and arms extended overhead.',
    startingPositionAr: 'ثبّت الفخذين أسفل وسادة الركبة، وأمسك البار بقبضة أعرض قليلاً من الكتفين مع فرد الذراعين للأعلى.',
    instructionsEn: [
      'Initiate the pull by depressing your shoulder blades downward.',
      'Pull the bar smoothly to your upper chest while leaning back very slightly (10–15 degrees).',
      'Squeeze your lats at the bottom, then extend arms slowly back to a full overhead stretch.'
    ],
    instructionsAr: [
      'ابدأ السحب بخفض لوحي الكتف للأسفل أولاً.',
      'اسحب البار بسلاسة نحو أعلى الصدر مع ميلان طفيف جداً للخلف (10–15 درجة).',
      'شد عضلات الظهر في الأسفل، ثم ارفع الذراعين ببطء لتمديد الظهر بالكامل.'
    ],
    breathingEn: 'Exhale as you pull the bar down; inhale as you return overhead.',
    breathingAr: 'زفير أثناء سحب البار للأسفل، وشهيق أثناء الصعود.',
    commonMistakesEn: [
      'Pulling the bar behind the neck, risking cervical and shoulder strain.',
      'Swinging the torso backward excessively on every rep.'
    ],
    commonMistakesAr: [
      'سحب البار خلف الرقبة مما يضع ضغطاً غير آمن على الرقبة والكتف.',
      'إرجاع الجذع للخلف بشكل مبالغ فيه مع كل تكرار.'
    ],
    safetyEn: 'Always pull in front of the face to the upper clavicle/chest area.',
    safetyAr: 'اسحب البار دائماً أمام الوجه نحو أعلى الصدر والترقوة.',
    alternativeIds: ['pull-ups', 'seated-cable-row']
  },
  {
    id: 'seated-cable-row',
    nameEn: 'Seated Cable Row',
    nameAr: 'سحب بكرة جالس',
    primaryMuscles: ['back'],
    secondaryMuscles: ['biceps', 'forearms', 'shoulders'],
    equipment: 'cable',
    category: 'compound',
    difficulty: 'beginner',
    startingPositionEn: 'Sit upright on the bench with feet on the platform and knees slightly bent. Hold the V-bar or straight handle with a neutral spine.',
    startingPositionAr: 'اجلس باستقامة على المقعد مع تثبيت القدمين وثني الركبتين قليلاً. أمسك المقبض مع استقامة الظهر.',
    instructionsEn: [
      'Pull the handle toward your lower abdomen while driving elbows straight back close to your sides.',
      'Squeeze your shoulder blades together for 1 second without shrugging.',
      'Extend arms slowly forward allowing a controlled scapular stretch without rounding the lower back.'
    ],
    instructionsAr: [
      'اسحب المقبض نحو أسفل البطن مع إرجاع المرفقين بمحاذاة الجانبين.',
      'اجمع لوحي الكتف معاً لمدة ثانية دون رفع الكتفين للأعلى.',
      'افرد الذراعين للأمام ببطء لتمديد الظهر العلوي دون تقوّس أسفل الظهر.'
    ],
    breathingEn: 'Exhale on the pull; inhale on the controlled stretch.',
    breathingAr: 'زفير عند السحب، شهيق عند الإرجاع.',
    commonMistakesEn: ['Shrugging shoulders toward ears or rocking forward and back excessively.'],
    commonMistakesAr: ['رفع الكتفين نحو الأذنين أو التأرجح المفرط بالجذع للأمام والخلف.'],
    safetyEn: 'Keep lumbar spine braced and stable throughout the set.',
    safetyAr: 'حافظ على ثبات واستقامة أسفل الظهر طوال الجولة.',
    alternativeIds: ['barbell-bent-over-row', 'single-arm-dumbbell-row', 'chest-supported-row-machine']
  },
  {
    id: 'single-arm-dumbbell-row',
    nameEn: 'Single-Arm Dumbbell Row',
    nameAr: 'سحب مفرد منحني',
    primaryMuscles: ['back'],
    secondaryMuscles: ['biceps', 'forearms'],
    equipment: 'dumbbell',
    category: 'compound',
    difficulty: 'beginner',
    startingPositionEn: 'Place one knee and hand on a flat bench with your torso parallel to the floor. Hold a dumbbell in the opposite hand hanging straight down.',
    startingPositionAr: 'ضع ركبة ويداً على مقعد مستوٍ بحيث يكون الجذع موازياً للأرض، واحمل الدامبل باليد الأخرى مع استرخاء الكتف للأسفل.',
    instructionsEn: [
      'Pull the dumbbell back in an arc toward your hip pocket, leading with the elbow.',
      'Pause at the top with your lat contracted.',
      'Lower slowly to full arm extension and repeat all reps before switching sides.'
    ],
    instructionsAr: [
      'اسحب الدامبل في قوس نحو مستوى الورك بقيادة المرفق.',
      'توقف لحظة في الأعلى مع عصر عضلة الظهر.',
      'أنزل الدامبل ببطء حتى فرد الذراع بالكامل وأكمل التكرارات قبل تبديل الجانب.'
    ],
    breathingEn: 'Exhale as you row up; inhale as you lower.',
    breathingAr: 'زفير عند السحب للأعلى، شهيق عند الإنزال.',
    commonMistakesEn: ['Twisting the torso violently to heave the dumbbell up.'],
    commonMistakesAr: ['لف الجذع بعنف لرفع الدامبل بالاندفاع بدلاً من عضلة الظهر.'],
    safetyEn: 'Keep hips square to the floor and avoid twisting the lower back.',
    safetyAr: 'حافظ على توازن الوركين باتجاه الأرض وتجنب التفاف أسفل الظهر.',
    alternativeIds: ['barbell-bent-over-row', 'seated-cable-row']
  },
  {
    id: 'pull-ups',
    nameEn: 'Pull-Ups',
    nameAr: 'عقلة',
    primaryMuscles: ['back'],
    secondaryMuscles: ['biceps', 'forearms'],
    equipment: 'bodyweight',
    category: 'compound',
    difficulty: 'intermediate',
    startingPositionEn: 'Hang from an overhead bar with an overhand grip slightly wider than shoulder-width, core braced, and shoulder blades slightly depressed.',
    startingPositionAr: 'تعلّق بالبار العلوي بقبضة أمامية أعرض قليلاً من الكتفين مع شد البطن وخفض لوحي الكتف قليلاً.',
    instructionsEn: [
      'Drive elbows down toward your ribs to pull your chest toward the bar.',
      'Rise until your chin clearly passes above the bar.',
      'Lower under control over 2–3 seconds to a full hang.'
    ],
    instructionsAr: [
      'ادفع المرفقين للأسفل نحو الأضلاع لرفع الصدر باتجاه البار.',
      'استمر بالصعود حتى يتجاوز الذقن مستوى البار بوضوح.',
      'انزل بتحكم خلال 2–3 ثوانٍ حتى فرد الذراعين.'
    ],
    breathingEn: 'Exhale on the pull up; inhale on the controlled descent.',
    breathingAr: 'زفير عند الصعود، شهيق عند النزول.',
    commonMistakesEn: ['Kipping with the legs or performing half-reps without full extension.'],
    commonMistakesAr: ['استخدام تأرجح الساقين أو أداء نصف حركة دون فرد كامل في الأسفل.'],
    safetyEn: 'Use an assisted machine or resistance band if unable to achieve clean full-range reps.',
    safetyAr: 'استخدم جهاز المساعدة أو حبل المقاومة إذا لم تتمكن من أداء تكرارات كاملة بتحكم.',
    alternativeIds: ['lat-pulldown', 'resistance-band-row']
  },
  {
    id: 'chest-supported-row-machine',
    nameEn: 'Chest-Supported Row Machine',
    nameAr: 'سحب زوجي إسناد صدر',
    primaryMuscles: ['back'],
    secondaryMuscles: ['biceps', 'shoulders'],
    equipment: 'machine',
    category: 'compound',
    difficulty: 'beginner',
    startingPositionEn: 'Adjust seat and chest pad so your chest rests firmly on the support while reaching handles comfortably.',
    startingPositionAr: 'اضبط المقعد ومسند الصدر بحيث يستند صدرك بثبات مع وصول اليدين للمقابض براحة.',
    instructionsEn: [
      'Pull handles back, squeezing mid-back and lats together.',
      'Control the eccentric return until shoulder blades protract cleanly.'
    ],
    instructionsAr: [
      'اسحب المقابض للخلف مع عصر منتصف الظهر ولوحي الكتف.',
      'تحكم في الرجوع للأمام حتى تمدد لوحي الكتف بالكامل.'
    ],
    breathingEn: 'Exhale on pull, inhale on return.',
    breathingAr: 'زفير عند السحب، شهيق عند الرجوع.',
    commonMistakesEn: ['Lifting the chest off the pad to gain momentum.'],
    commonMistakesAr: ['رفع الصدر عن المسند للاستعانة بالظهر السفلي.'],
    safetyEn: 'Keep ribcage glued to the pad to isolate upper and mid-back.',
    safetyAr: 'أبقِ الصدر ملاصقاً للمسند لعزل عضلات الظهر بأمان.',
    alternativeIds: ['seated-cable-row', 'barbell-bent-over-row']
  },
  {
    id: 'resistance-band-row',
    nameEn: 'Seated Resistance Band Row',
    nameAr: 'سحب ظهر بحبل المقاومة',
    primaryMuscles: ['back'],
    secondaryMuscles: ['biceps', 'forearms'],
    equipment: 'resistance_bands',
    category: 'compound',
    difficulty: 'beginner',
    startingPositionEn: 'Sit tall with legs extended and loop the resistance band securely around the soles of your feet.',
    startingPositionAr: 'اجلس باستقامة مع مد الساقين ولف حبل المقاومة بإحكام حول باطن القدمين.',
    instructionsEn: [
      'Pull handles toward your waist while squeezing shoulder blades together.',
      'Return slowly under tension.'
    ],
    instructionsAr: [
      'اسحب المقبضين نحو الخصر مع ضم لوحي الكتف.',
      'عد ببطء مع الحفاظ على شد الحبل.'
    ],
    breathingEn: 'Exhale on pull; inhale on return.',
    breathingAr: 'زفير عند السحب، شهيق عند الرجوع.',
    commonMistakesEn: ['Slouching the spine forward.'],
    commonMistakesAr: ['تقوّس الظهر للأمام أثناء السحب.'],
    safetyEn: 'Ensure the band cannot slip off your shoes.',
    safetyAr: 'تأكد من ثبات الحبل أسفل القدمين حتى لا ينزلق.',
    alternativeIds: ['seated-cable-row', 'pull-ups']
  },

  // SHOULDERS
  {
    id: 'overhead-barbell-press',
    nameEn: 'Standing Barbell Overhead Press',
    nameAr: 'ضغط بار واقف',
    primaryMuscles: ['shoulders'],
    secondaryMuscles: ['triceps'],
    equipment: 'barbell',
    category: 'compound',
    difficulty: 'intermediate',
    startingPositionEn: 'Stand with feet shoulder-width apart. Hold the barbell resting across your front delts and upper chest, hands just outside shoulder-width, forearms vertical.',
    startingPositionAr: 'قف بقدمين بعرض الكتفين، واحمل البار على الكتفين الأماميين وأعلى الصدر بقبضة أعرض قليلاً من الكتفين مع استقامة الساعدين عمودياً.',
    instructionsEn: [
      'Squeeze glutes and brace your core tightly to prevent lower-back hyperextension.',
      'Slightly tuck your chin and press the bar straight overhead.',
      'As the bar passes your forehead, push your head slightly forward through the window until locked out directly over mid-foot.',
      'Lower under control back to the front rack position.'
    ],
    instructionsAr: [
      'اشدد عضلات الأرداف والبطن بقوة لمنع تقوّس أسفل الظهر.',
      'أرجع ذقنك للخلف قليلاً وادفع البار عمودياً للأعلى.',
      'بعد تجاوز الجبهة، قدّم رأسك قليلاً للأمام ليستقر البار فوق منتصف الجسم.',
      'أنزل البار بتحكم إلى نقطة البداية أمام الكتفين.'
    ],
    breathingEn: 'Inhale and brace at the bottom; exhale as you lock out or lower.',
    breathingAr: 'شهيق وشد للبطن في الأسفل، وزفير عند تمام الدفع أو النزول.',
    commonMistakesEn: [
      'Overarching the lower back into a standing incline press.',
      'Pressing the bar forward away from your center of gravity.'
    ],
    commonMistakesAr: [
      'تقوّس أسفل الظهر للخلف بشكل مبالغ فيه.',
      'دفع البار للأمام بعيداً عن خط التوازن العمودي.'
    ],
    safetyEn: 'Keep glutes and abs locked tight throughout the press.',
    safetyAr: 'حافظ على شد البطن والأرداف طوال الحركة لحماية أسفل الظهر.',
    alternativeIds: ['seated-dumbbell-shoulder-press', 'smith-overhead-press']
  },
  {
    id: 'seated-dumbbell-shoulder-press',
    nameEn: 'Seated Dumbbell Shoulder Press',
    nameAr: 'ضغط دمبلص جالس',
    primaryMuscles: ['shoulders'],
    secondaryMuscles: ['triceps'],
    equipment: 'dumbbell',
    category: 'compound',
    difficulty: 'beginner',
    startingPositionEn: 'Sit on an upright bench (80–85 degrees). Hold dumbbells at ear height with elbows angled slightly forward in the scapular plane.',
    startingPositionAr: 'اجلس على مقعد شبه عمودي (80–85 درجة)، واحمل الدامبل بمستوى الأذنين مع تقديم المرفقين قليلاً للأمام.',
    instructionsEn: [
      'Press both dumbbells overhead until arms are nearly extended without locking hard.',
      'Lower slowly back to ear/shoulder level under full control.'
    ],
    instructionsAr: [
      'ادفع الدامبل للأعلى حتى يقترب الذراعان من الاستقامة.',
      'أنزلهما ببطء وتحكم حتى مستوى الأذنين والكتفين.'
    ],
    breathingEn: 'Exhale while pressing up; inhale while lowering.',
    breathingAr: 'زفير عند الدفع للأعلى، شهيق عند الإنزال.',
    commonMistakesEn: ['Banging dumbbells together at the top or flaring elbows straight out to the sides.'],
    commonMistakesAr: ['صدم الدامبل ببعضهما في الأعلى أو فتح المرفقين للخلف تماماً.'],
    safetyEn: 'Keep lower back pressed against the upright pad.',
    safetyAr: 'أبقِ أسفل ظهرك مسنوداً على المقعد وتجنب تقويسه.',
    alternativeIds: ['overhead-barbell-press', 'smith-overhead-press']
  },
  {
    id: 'dumbbell-lateral-raise',
    nameEn: 'Dumbbell Lateral Raise',
    nameAr: 'نشر جانبي دمبلص',
    primaryMuscles: ['shoulders'],
    secondaryMuscles: [],
    equipment: 'dumbbell',
    category: 'isolation',
    difficulty: 'beginner',
    startingPositionEn: 'Stand tall holding light-to-moderate dumbbells at your sides with a soft bend in the elbows and torso leaned very slightly forward.',
    startingPositionAr: 'قف باستقامة مع حمل دامبل بوزن مناسب على الجانبين، مع ثني طفيف في المرفقين وميلان خفيف جداً للأمام.',
    instructionsEn: [
      'Raise both arms out to the sides in the scapular plane (slightly forward of midline) until arms reach shoulder height.',
      'Lead the movement with your elbows and wrists level, avoiding shrugging the traps.',
      'Lower slowly over 2–3 seconds resisting gravity.'
    ],
    instructionsAr: [
      'ارفع الذراعين للجانبين مع إمالة طفيفة للأمام حتى مستوى الكتفين.',
      'اجعل المرفقين يقودان الحركة دون رفع الكتفين للأعلى.',
      'أنزل الوزن ببطء خلال 2–3 ثوانٍ مع مقاومة الجاذبية.'
    ],
    breathingEn: 'Exhale as you raise; inhale as you lower.',
    breathingAr: 'زفير عند الرفع، شهيق عند الإنزال.',
    commonMistakesEn: [
      'Using excessive weight and swinging the hips.',
      'Internally rotating shoulders ("pouring pitchers"), which can irritate the rotator cuff.'
    ],
    commonMistakesAr: [
      'استخدام وزن ثقيل جداً والتأرجح بالوركين.',
      'تدوير الكتف للداخل بشكل مبالغ فيه مما يضغط على أوتار الكتف.'
    ],
    safetyEn: 'Keep thumbs level or slightly pointed up rather than down.',
    safetyAr: 'حافظ على استقامة اليدين أو توجيه الإبهام للأعلى قليلاً لحماية مفصل الكتف.',
    alternativeIds: ['cable-lateral-raise', 'machine-lateral-raise']
  },
  {
    id: 'cable-face-pull',
    nameEn: 'Cable Rope Face Pull',
    nameAr: 'سحب بكرة حبل أمام الوجه',
    primaryMuscles: ['shoulders'],
    secondaryMuscles: ['back'],
    equipment: 'cable',
    category: 'isolation',
    difficulty: 'beginner',
    startingPositionEn: 'Attach a rope to a pulley set at upper-chest or eye level. Grip the rope with thumbs pointing back toward you and step back into a staggered stance.',
    startingPositionAr: 'ثبّت الحبل على بكرة بمستوى أعلى الصدر أو العينين، أمسك طرفي الحبل بحيث يتجه الإبهامان نحوك وتراجع خطوة للثبات.',
    instructionsEn: [
      'Pull the rope toward your forehead while pulling the rope ends apart.',
      'Rotate your forearms upward at the end into a "double biceps" external rotation pose.',
      'Squeeze rear delts and upper back for 1 second, then extend smoothly.'
    ],
    instructionsAr: [
      'اسحب الحبل باتجاه الجبهة مع فتح طرفي الحبل للخارج.',
      'أدر الساعدين للأعلى في نهاية السحب لإشراك الكتف الخلفي والعضلات المدوّرة.',
      'ثبّت الانقباض ثانية ثم عد للأمام بسلاسة.'
    ],
    breathingEn: 'Exhale during the pull; inhale on extension.',
    breathingAr: 'زفير عند السحب، شهيق عند التمديد.',
    commonMistakesEn: ['Going too heavy and turning it into a lower-back row.'],
    commonMistakesAr: ['استخدام وزن ثقيل يحوّل التمرين إلى سحب بالظهر السفلي.'],
    safetyEn: 'Use moderate weight focused on rear delt control and shoulder health.',
    safetyAr: 'استخدم وزناً متوسطاً يتيح التحكم الكامل لصحة مفصل الكتف.',
    alternativeIds: ['rear-delt-machine-fly', 'cable-lateral-raise']
  },
  {
    id: 'cable-lateral-raise',
    nameEn: 'Single-Arm Cable Lateral Raise',
    nameAr: 'نشر بكرة جانبي',
    primaryMuscles: ['shoulders'],
    secondaryMuscles: [],
    equipment: 'cable',
    category: 'isolation',
    difficulty: 'beginner',
    startingPositionEn: 'Set pulley to lowest notch. Stand sideways to the stack, grip handle with far hand, and hold the frame lightly for balance.',
    startingPositionAr: 'اضبط البكرة على أدنى مستوى، قف جانبياً للجهاز وأمسك المقبض باليد البعيدة مع تثبيت اليد الأخرى بالإطار.',
    instructionsEn: [
      'Sweep arm outward smoothly up to shoulder height with a slight elbow bend.',
      'Control the descent back across your front thigh.'
    ],
    instructionsAr: [
      'ارفع الذراع للجانب بسلاسة حتى مستوى الكتف مع ثني طفيف للمرفق.',
      'أنزل الذراع بتحكم كامل حتى نقطة البداية.'
    ],
    breathingEn: 'Exhale on raise; inhale on return.',
    breathingAr: 'زفير عند الرفع، شهيق عند الإنزال.',
    commonMistakesEn: ['Leaning excessively or jerking the cable off the stack.'],
    commonMistakesAr: ['الميلان المفرط بالجسم أو شد الكابل بعنف وبسرعة.'],
    safetyEn: 'Keep tension smooth from the bottom position.',
    safetyAr: 'حافظ على حركة سلسة ومستمرة من بداية المدى الحركي.',
    alternativeIds: ['dumbbell-lateral-raise', 'machine-lateral-raise']
  },
  {
    id: 'smith-overhead-press',
    nameEn: 'Smith Machine Seated Shoulder Press',
    nameAr: 'ضغط أكتاف أمامي سميث',
    primaryMuscles: ['shoulders'],
    secondaryMuscles: ['triceps'],
    equipment: 'smith_machine',
    category: 'compound',
    difficulty: 'beginner',
    startingPositionEn: 'Position an upright bench inside the Smith machine so the bar travels smoothly just in front of your chin.',
    startingPositionAr: 'ضع مقعداً عمودياً داخل جهاز السميث بحيث يتحرك البار أمام الذقن مباشرة.',
    instructionsEn: [
      'Unlatch the bar and lower smoothly to chin/upper-chest level.',
      'Press directly upward until arms are near full extension.'
    ],
    instructionsAr: [
      'حرّر قفل الأمان وأنزل البار بسلاسة حتى مستوى الذقن أو أعلى الصدر.',
      'ادفع للأعلى باستقامة حتى يقترب الذراعان من الفرد الكامل.'
    ],
    breathingEn: 'Inhale down; exhale up.',
    breathingAr: 'شهيق عند النزول، زفير عند الدفع.',
    commonMistakesEn: ['Sitting too far forward or backward relative to the bar path.'],
    commonMistakesAr: ['الجلوس للأمام أو للخلف بعيداً عن مسار البار العمودي.'],
    safetyEn: 'Set lower safety stops at shoulder height.',
    safetyAr: 'اضبط مصدّات الأمان على مستوى الكتفين.',
    alternativeIds: ['seated-dumbbell-shoulder-press', 'overhead-barbell-press']
  },
  {
    id: 'machine-lateral-raise',
    nameEn: 'Machine Lateral Raise',
    nameAr: 'رفرفة جانبية على الجهاز',
    primaryMuscles: ['shoulders'],
    secondaryMuscles: [],
    equipment: 'machine',
    category: 'isolation',
    difficulty: 'beginner',
    startingPositionEn: 'Adjust seat so shoulder joint aligns with the machine pivot axis. Place forearms against the pads.',
    startingPositionAr: 'اضبط المقعد بحيث يتحاذى مفصل الكتف مع محور دوران الجهاز، وضع الساعدين على الوسادات.',
    instructionsEn: [
      'Drive elbows outward and upward until upper arms are parallel to the floor.',
      'Lower slowly without dropping the weight stack.'
    ],
    instructionsAr: [
      'ادفع المرفقين للخارج وللأعلى حتى يوازي الذراعان الأرض.',
      'أنزل بتحكم دون إسقاط الأوزان.'
    ],
    breathingEn: 'Exhale up; inhale down.',
    breathingAr: 'زفير عند الرفع، شهيق عند الإنزال.',
    commonMistakesEn: ['Shrugging traps during the lift.'],
    commonMistakesAr: ['رفع الكتفين نحو الأذنين أثناء الدفع.'],
    safetyEn: 'Align shoulder joint with the machine pivot.',
    safetyAr: 'تأكد من محاذاة الكتف مع محور الجهاز قبل البدء.',
    alternativeIds: ['dumbbell-lateral-raise', 'cable-lateral-raise']
  },
  {
    id: 'rear-delt-machine-fly',
    nameEn: 'Reverse Pec Deck Rear Delt Fly',
    nameAr: 'نشر فلاي خلفي',
    primaryMuscles: ['shoulders'],
    secondaryMuscles: ['back'],
    equipment: 'machine',
    category: 'isolation',
    difficulty: 'beginner',
    startingPositionEn: 'Sit facing the chest pad with handles adjusted forward and grip at shoulder height with palms facing down or inward.',
    startingPositionAr: 'اجلس مواجهاً لمسند الصدر، واضبط المقابض للأمام وأمسكها بمستوى الكتفين.',
    instructionsEn: [
      'Sweep arms backward in a wide arc until aligned with your torso.',
      'Control the return without letting shoulders roll forward.'
    ],
    instructionsAr: [
      'افتح الذراعين للخلف في قوس واسع حتى محاذاة الجذع.',
      'عد للأمام ببطء مع إبقاء التركيز على الكتف الخلفي.'
    ],
    breathingEn: 'Exhale back; inhale forward.',
    breathingAr: 'زفير عند السحب للخلف، شهيق عند الرجوع.',
    commonMistakesEn: ['Pinching shoulder blades aggressively like a mid-back row instead of sweeping out.'],
    commonMistakesAr: ['عصر لوحي الكتف بقوة زائدة مما يحوّل التركيز إلى منتصف الظهر.'],
    safetyEn: 'Keep chest lightly resting on the pad.',
    safetyAr: 'أبقِ الصدر ملامساً للمسند طوال التمرين.',
    alternativeIds: ['cable-face-pull']
  },

  // BICEPS
  {
    id: 'barbell-bicep-curl',
    nameEn: 'Standing Barbell Curl',
    nameAr: 'كيرل بار واقف',
    primaryMuscles: ['biceps'],
    secondaryMuscles: ['forearms'],
    equipment: 'barbell',
    category: 'isolation',
    difficulty: 'beginner',
    startingPositionEn: 'Stand upright with feet shoulder-width apart, gripping a straight or EZ bar with an underhand shoulder-width grip, elbows tucked close to your sides.',
    startingPositionAr: 'قف باستقامة وأمسك البار المستقيم أو المتعرج بقبضة سفلية بعرض الكتفين مع تثبيت المرفقين بجانب الجذع.',
    instructionsEn: [
      'Keep upper arms stationary against your sides.',
      'Curl the bar upward smoothly until biceps are fully contracted near shoulder level.',
      'Squeeze for 1 second, then lower under control over 2–3 seconds to full elbow extension.'
    ],
    instructionsAr: [
      'ثبّت العضدين بجانب الجسم دون تحريكهما للأمام أو الخلف.',
      'ارفع البار للأعلى بسلاسة حتى أقصى انقباض للبايسبس.',
      'ثبّت ثانية ثم أنزل البار ببطء خلال 2–3 ثوانٍ حتى فرد الذراع.'
    ],
    breathingEn: 'Exhale while curling up; inhale while lowering.',
    breathingAr: 'زفير عند الرفع، شهيق عند الإنزال.',
    commonMistakesEn: ['Swinging the hips backward to heave heavy weight.', 'Flaring elbows forward excessively.'],
    commonMistakesAr: ['تأرجح الظهر والوركين لرفع وزن زائد.', 'دفع المرفقين للأمام لرفع البار.'],
    safetyEn: 'Switch to an EZ-curl bar if straight bar causes wrist discomfort.',
    safetyAr: 'استخدم البار المتعرج إذا شعرت بأي ضغط على المعصمين.',
    alternativeIds: ['incline-dumbbell-curl', 'hammer-curl', 'cable-bicep-curl']
  },
  {
    id: 'incline-dumbbell-curl',
    nameEn: 'Incline Dumbbell Curl',
    nameAr: 'كيرل دمبلص مائل',
    primaryMuscles: ['biceps'],
    secondaryMuscles: ['forearms'],
    equipment: 'dumbbell',
    category: 'isolation',
    difficulty: 'intermediate',
    startingPositionEn: 'Set bench to 45–60 degrees. Sit back letting arms hang vertically behind your torso with palms facing forward.',
    startingPositionAr: 'اضبط المقعد بزاوية 45–60 درجة، واستند بظهرك مع ترك الذراعين يتدليان عمودياً للخلف وراحتا اليد للأمام.',
    instructionsEn: [
      'Keeping elbows pinned back, curl dumbbells upward without letting upper arms swing forward.',
      'Lower slowly to a deep long-head biceps stretch at the bottom.'
    ],
    instructionsAr: [
      'ثبّت المرفقين للخلف وارفع الدامبل للأعلى دون تحريك العضد للأمام.',
      'أنزل الوزن ببطء حتى أقصى تمدد للبايسبس في الأسفل.'
    ],
    breathingEn: 'Exhale up; inhale down.',
    breathingAr: 'زفير عند الرفع، شهيق عند الإنزال.',
    commonMistakesEn: ['Pulling elbows forward as soon as fatigue hits.'],
    commonMistakesAr: ['تحريك المرفقين للأمام عند الشعور بالتعب.'],
    safetyEn: 'Use controlled lighter weight to protect the anterior shoulder capsule.',
    safetyAr: 'اختر وزناً متوسطاً يتيح التحكم الكامل لحماية الكتف الأمامي.',
    alternativeIds: ['barbell-bicep-curl', 'cable-bicep-curl']
  },
  {
    id: 'hammer-curl',
    nameEn: 'Dumbbell Hammer Curl',
    nameAr: 'كيرل مطرقة (هامر)',
    primaryMuscles: ['biceps'],
    secondaryMuscles: ['forearms'],
    equipment: 'dumbbell',
    category: 'isolation',
    difficulty: 'beginner',
    startingPositionEn: 'Stand upright holding dumbbells with palms facing your thighs (neutral grip).',
    startingPositionAr: 'قف باستقامة واحمل الدامبل بحيث تتجه راحتا اليدين نحو الفخذين بقبضة محايدة.',
    instructionsEn: [
      'Curl the weights up while maintaining a neutral thumb-up grip.',
      'Pause briefly at the top and lower smoothly to full extension.'
    ],
    instructionsAr: [
      'ارفع الدامبل للأعلى مع الحفاظ على توجيه الإبهام للأعلى طوال الحركة.',
      'ثبّت لحظة ثم أنزل بسلاسة حتى استقامة الذراع.'
    ],
    breathingEn: 'Exhale up; inhale down.',
    breathingAr: 'زفير عند الرفع، شهيق عند الإنزال.',
    commonMistakesEn: ['Rotating wrists into supination instead of keeping neutral grip.'],
    commonMistakesAr: ['لف المعصم للخارج بدلاً من الحفاظ على وضعية المطرقة المحايدة.'],
    safetyEn: 'Avoid torso swing.',
    safetyAr: 'تجنب تأرجح الجذع.',
    alternativeIds: ['barbell-bicep-curl', 'cable-bicep-curl']
  },
  {
    id: 'cable-bicep-curl',
    nameEn: 'Low-Pulley Cable Curl',
    nameAr: 'كيرل سلك',
    primaryMuscles: ['biceps'],
    secondaryMuscles: ['forearms'],
    equipment: 'cable',
    category: 'isolation',
    difficulty: 'beginner',
    startingPositionEn: 'Stand facing a low pulley with a straight or EZ attachment, elbows tucked at your sides.',
    startingPositionAr: 'قف مواجهاً للبكرة السفلية وأمسك المقبض مع تثبيت المرفقين بجانب الجذع.',
    instructionsEn: [
      'Curl the handle smoothly toward your shoulders maintaining constant cable tension.',
      'Lower slowly under control without letting plates touch.'
    ],
    instructionsAr: [
      'اسحب المقبض للأعلى باتجاه الكتفين مع الحفاظ على توتر الكابل المستمر.',
      'أنزل ببطء وتحكم دون ترك الأوزان ترتطم.'
    ],
    breathingEn: 'Exhale up; inhale down.',
    breathingAr: 'زفير عند الرفع، شهيق عند الإنزال.',
    commonMistakesEn: ['Standing too close to the pulley or leaning back.'],
    commonMistakesAr: ['الوقوف قريباً جداً من البكرة أو الميل للخلف.'],
    safetyEn: 'Keep wrists neutral and strong.',
    safetyAr: 'حافظ على استقامة المعصمين.',
    alternativeIds: ['barbell-bicep-curl', 'machine-preacher-curl']
  },
  {
    id: 'machine-preacher-curl',
    nameEn: 'Machine Preacher Curl',
    nameAr: 'كيرل لاري جهاز',
    primaryMuscles: ['biceps'],
    secondaryMuscles: ['forearms'],
    equipment: 'machine',
    category: 'isolation',
    difficulty: 'beginner',
    startingPositionEn: 'Adjust seat height so armpits rest comfortably over the top edge of the angled pad, back of upper arms flat on the pad.',
    startingPositionAr: 'اضبط المقعد بحيث يستقر الإبطان أعلى حافة الوسادة المائلة وتلتصق العضدان بالمسند.',
    instructionsEn: [
      'Curl handles upward smoothly to peak contraction.',
      'Lower under control to near full extension without hyperextending elbows.'
    ],
    instructionsAr: [
      'ارفع المقابض للأعلى بسلاسة حتى أقصى انقباض.',
      'أنزل بتحكم حتى يقترب الذراعان من الاستقامة دون قفل المفصل بعنف.'
    ],
    breathingEn: 'Exhale up; inhale down.',
    breathingAr: 'زفير عند الرفع، شهيق عند الإنزال.',
    commonMistakesEn: ['Dropping rapidly into elbow hyperextension at the bottom.'],
    commonMistakesAr: ['الإنزال السريع الذي قد يضغط على وتر المرفق في الأسفل.'],
    safetyEn: 'Control the bottom inch of every rep carefully.',
    safetyAr: 'تحكم في الجزء السفلي من الحركة ببطء لتجنب الضغط على مفصل المرفق.',
    alternativeIds: ['cable-bicep-curl', 'incline-dumbbell-curl']
  },

  // TRICEPS
  {
    id: 'cable-tricep-pushdown',
    nameEn: 'Cable Triceps Rope Pushdown',
    nameAr: 'تراي بكرة حبل',
    primaryMuscles: ['triceps'],
    secondaryMuscles: [],
    equipment: 'cable',
    category: 'isolation',
    difficulty: 'beginner',
    startingPositionEn: 'Attach a rope to a high pulley. Tuck elbows firmly against your ribs, hinge slightly forward, and start with forearms slightly above parallel.',
    startingPositionAr: 'ثبّت الحبل في البكرة العلوية، الصق المرفقين بجانبي الجذع، وانحنِ قليلاً للأمام.',
    instructionsEn: [
      'Extend your elbows downward, spreading the rope ends slightly apart at the bottom for a strong triceps lockout.',
      'Hold contraction for 1 second.',
      'Allow forearms to rise back up under control until just above 90 degrees without elbows drifting forward.'
    ],
    instructionsAr: [
      'افرد المرفقين للأسفل مع فتح طرفي الحبل للخارج قليلاً عند تمام الفرد.',
      'ثبّت الانقباض لمدة ثانية واحدة.',
      'اسمح للساعدين بالصعود بتحكم حتى زاوية أكبر بقليل من 90 درجة دون تحريك المرفقين.'
    ],
    breathingEn: 'Exhale on the pushdown; inhale on the return.',
    breathingAr: 'زفير عند الدفع للأسفل، شهيق عند الصعود.',
    commonMistakesEn: ['Letting elbows flare wide or push forward/back like a shoulder press.'],
    commonMistakesAr: ['تحريك المرفقين للأمام والخلف واستخدام وزن الجسم للدفع.'],
    safetyEn: 'Keep elbows pinned at your sides as fixed hinges.',
    safetyAr: 'أبقِ المرفقين ثابتين بجانبك كمفصل دوران وحيد.',
    alternativeIds: ['overhead-cable-tricep-extension', 'ez-bar-skullcrusher', 'bench-dips']
  },
  {
    id: 'overhead-cable-tricep-extension',
    nameEn: 'Overhead Cable Triceps Extension',
    nameAr: 'تراي حبل خلف الرأس',
    primaryMuscles: ['triceps'],
    secondaryMuscles: [],
    equipment: 'cable',
    category: 'isolation',
    difficulty: 'intermediate',
    startingPositionEn: 'Set pulley around waist or lower-chest height with a rope. Face away, step into a split stance, and hold the rope behind your head with elbows pointing forward-up.',
    startingPositionAr: 'اضبط البكرة بمستوى الخصر أو أسفل الصدر مع الحبل، قف بظهرك للجهاز وخذ خطوة للأمام مع إمساك الحبل خلف الرأس.',
    instructionsEn: [
      'Extend elbows forward and upward until arms are straight.',
      'Lower slowly behind your head for a full long-head triceps stretch.'
    ],
    instructionsAr: [
      'افرد المرفقين للأمام وللأعلى حتى استقامة الذراعين.',
      'أنزل الحبل ببطء خلف الرأس لتحقيق تمدد كامل للرأس الطويل من الترايسبس.'
    ],
    breathingEn: 'Exhale on extension; inhale on the stretch.',
    breathingAr: 'زفير عند الفرد، شهيق عند التمديد خلف الرأس.',
    commonMistakesEn: ['Flaring elbows excessively wide or overarching the lower back.'],
    commonMistakesAr: ['فتح المرفقين للخارج كثيراً أو تقوّس أسفل الظهر.'],
    safetyEn: 'Brace abs firmly throughout.',
    safetyAr: 'اشدد عضلات البطن طوال الجولة لحماية الظهر.',
    alternativeIds: ['cable-tricep-pushdown', 'ez-bar-skullcrusher']
  },
  {
    id: 'ez-bar-skullcrusher',
    nameEn: 'Lying Barbell Triceps Extension',
    nameAr: 'تراي نائم خلف الرأس',
    primaryMuscles: ['triceps'],
    secondaryMuscles: [],
    equipment: 'barbell',
    category: 'isolation',
    difficulty: 'intermediate',
    startingPositionEn: 'Lie flat on a bench holding a straight or EZ bar directly over your chest/forehead with arms angled slightly back.',
    startingPositionAr: 'استلقِ على المقعد المستوي حاملاً البار فوق الصدر مع إمالة طفيفة للذراعين للخلف.',
    instructionsEn: [
      'Keep upper arms steady and bend elbows to lower the bar smoothly toward or just behind your forehead.',
      'Extend triceps forcefully back to the starting angle.'
    ],
    instructionsAr: [
      'ثبّت العضدين واثنِ المرفقين لإنزال البار بتحكم نحو الجبهة أو خلفها قليلاً.',
      'افرد الترايسبس بقوة للعودة إلى زاوية البداية.'
    ],
    breathingEn: 'Inhale down; exhale as you extend.',
    breathingAr: 'شهيق عند النزول، زفير عند الفرد.',
    commonMistakesEn: ['Allowing elbows to flare wide or dropping too fast.'],
    commonMistakesAr: ['فتح المرفقين للخارج أو إنزال البار بسرعة غير آمنة.'],
    safetyEn: 'Lower slightly behind the forehead to keep continuous tension and protect elbows.',
    safetyAr: 'أنزل البار خلف الجبهة قليلاً لإبقاء التوتر مستمراً وحماية المرفقين.',
    alternativeIds: ['overhead-cable-tricep-extension', 'dumbbell-tricep-kickback']
  },
  {
    id: 'dumbbell-tricep-kickback',
    nameEn: 'Bent-Over Dumbbell Kickback',
    nameAr: 'كيك باك دمبلص للترايسبس',
    primaryMuscles: ['triceps'],
    secondaryMuscles: [],
    equipment: 'dumbbell',
    category: 'isolation',
    difficulty: 'beginner',
    startingPositionEn: 'Support one hand and knee on a bench, torso parallel to the floor, upper arm pinned parallel to your torso.',
    startingPositionAr: 'أسند يداً وركبة على المقعد بحيث يكون الجذع موازياً للأرض والعضد مثبتاً بمحاذاة الجذع.',
    instructionsEn: [
      'Extend the forearm straight back until the arm is fully straight and parallel to the floor.',
      'Squeeze triceps briefly, then bend elbow back to 90 degrees.'
    ],
    instructionsAr: [
      'افرد الساعد للخلف حتى يستقيم الذراع تماماً بموازاة الأرض.',
      'اعصر الترايسبس لحظة ثم اثنِ المرفق ببطء إلى زاوية 90 درجة.'
    ],
    breathingEn: 'Exhale on kickback; inhale on return.',
    breathingAr: 'زفير عند الفرد للخلف، شهيق عند الرجوع.',
    commonMistakesEn: ['Dropping the elbow or swinging the upper arm.'],
    commonMistakesAr: ['إسقاط المرفق للأسفل أو تأرجح العضد.'],
    safetyEn: 'Use a light-to-moderate dumbbell for strict isolation.',
    safetyAr: 'استخدم وزناً مناسباً يتيح الثبات التام للمرفق.',
    alternativeIds: ['cable-tricep-pushdown', 'bench-dips']
  },
  {
    id: 'bench-dips',
    nameEn: 'Bench Tricep Dips',
    nameAr: 'غطس تراي مقعد',
    primaryMuscles: ['triceps'],
    secondaryMuscles: ['chest', 'shoulders'],
    equipment: 'bodyweight',
    category: 'compound',
    difficulty: 'intermediate',
    startingPositionEn: 'Place your hands on the edge of a sturdy bench behind you with shoulders pressed down away from your ears and feet planted with knees slightly bent or legs extended.',
    startingPositionAr: 'ارتكز بيديك على حافة المقعد خلفك مع خفض الكتفين بعيداً عن الأذنين، وضع قدميك على الأرض مع ثني خفيف للركبتين أو مد الساقين للأمام.',
    instructionsEn: [
      'Keep torso relatively upright and elbows tucked back as you lower until elbows reach ~90 degrees.',
      'Press powerfully through your palms to full extension.'
    ],
    instructionsAr: [
      'حافظ على استقامة الجذع نسبياً وتوجيه المرفقين للخلف أثناء النزول حتى زاوية 90 درجة.',
      'ادفع بقوة عبر راحتي اليدين للعودة للأعلى.'
    ],
    breathingEn: 'Inhale down; exhale up.',
    breathingAr: 'شهيق عند النزول، زفير عند الدفع.',
    commonMistakesEn: ['Dropping too deep and rolling shoulders forward.'],
    commonMistakesAr: ['النزول العميق المفرط الذي يدفع الكتفين للأمام.'],
    safetyEn: 'Stop descent when upper arms are parallel to the floor.',
    safetyAr: 'توقف في النزول عندما يوازي العضدان الأرض لحماية الكتف.',
    alternativeIds: ['cable-tricep-pushdown', 'ez-bar-skullcrusher']
  },
  {
    id: 'machine-tricep-extension',
    nameEn: 'Seated Machine Triceps Extension (Neutral Grip)',
    nameAr: 'تراي مطرقة جهاز',
    primaryMuscles: ['triceps'],
    secondaryMuscles: [],
    equipment: 'machine',
    category: 'isolation',
    difficulty: 'beginner',
    startingPositionEn: 'Adjust seat height so your armpits clear the top of the angled arm pad comfortably and both upper arms and elbows rest flat on the pad. Grip the dual neutral (hammer) handles with thumbs up.',
    startingPositionAr: 'اضبط ارتفاع المقعد بحيث تستقر العضدان والمرفقان بثبات على وسادة المسند المائل أمامك، وأمسك المقبضين بقبضة مطرقة محايدة (الإبهامان للأعلى).',
    instructionsEn: [
      'Keep your elbows anchored on the pad and torso steady without hunching forward.',
      'Extend both forearms forward along the lever arc until arms reach smooth near-full extension.',
      'Squeeze the triceps firmly for 1 second at lockout, then bend elbows back slowly into a deep stretch.'
    ],
    instructionsAr: [
      'ثبّت مرفقيك وعضديك على المسند المائل دون تحريك الكتفين أو انحناء الظهر.',
      'ادفع المقبضين للأمام بمد الساعدين على مسار الجهاز حتى يقترب الذراعان من الاستقامة.',
      'اعصر عضلة الترايسبس ثانية في الأمام، ثم عد ببطء وتحكم حتى أقصى ثني مريح للمرفق.'
    ],
    breathingEn: 'Exhale while extending forward; inhale during the controlled return.',
    breathingAr: 'زفير عند الدفع للأمام، وشهيق أثناء الرجوع البطيء للخلف.',
    commonMistakesEn: [
      'Lifting elbows off the angled pad to push with shoulders or bodyweight.',
      'Letting the weight stack slam down at the end of the return.'
    ],
    commonMistakesAr: [
      'رفع المرفقين عن المسند والاستعانة بوزن الجسم والكتفين في الدفع.',
      'ترك الأوزان ترتطم بسرعة في نهاية الرجوع دون تحكم.'
    ],
    safetyEn: 'Align your elbow joints near the machine pivot axis and avoid snapping elbows hard at lockout.',
    safetyAr: 'حاذِ مفصل المرفق مع محور دوران الجهاز وتجنب قفل المرفق بعنف في نهاية الدفع.',
    alternativeIds: ['cable-tricep-pushdown', 'overhead-cable-tricep-extension', 'ez-bar-skullcrusher']
  },

  // FOREARMS
  {
    id: 'barbell-wrist-curl',
    nameEn: 'Seated Barbell Wrist Curl',
    nameAr: 'ساعد بار جالس',
    primaryMuscles: ['forearms'],
    secondaryMuscles: [],
    equipment: 'barbell',
    category: 'isolation',
    difficulty: 'beginner',
    startingPositionEn: 'Sit on a bench with forearms resting along your thighs and wrists hanging just past your knees, palms facing up.',
    startingPositionAr: 'اجلس على المقعد مع إسناد الساعدين على الفخذين وبروز المعصمين أمام الركبتين وراحة اليد للأعلى.',
    instructionsEn: [
      'Let the bar roll gently toward your fingertips, extending the wrist.',
      'Curl fingers and wrists upward smoothly, squeezing forearm flexors.'
    ],
    instructionsAr: [
      'اسمح للبار بالنزول برفق نحو أطراف الأصابع مع مد المعصم.',
      'اثنِ الأصابع والمعصم للأعلى بسلاسة مع شد عضلات الساعد.'
    ],
    breathingEn: 'Exhale as you curl; inhale as you lower.',
    breathingAr: 'زفير عند الثني للأعلى، شهيق عند الإنزال.',
    commonMistakesEn: ['Lifting forearms off the thighs or using jerking momentum.'],
    commonMistakesAr: ['رفع الساعدين عن الفخذين أو استخدام حركة سريعة مفاجئة.'],
    safetyEn: 'Use moderate loads to avoid wrist tendon irritation.',
    safetyAr: 'استخدم أوزاناً معتدلة لحماية أوتار المعصم.',
    alternativeIds: ['reverse-dumbbell-wrist-curl', 'hammer-curl']
  },
  {
    id: 'reverse-dumbbell-wrist-curl',
    nameEn: 'Dumbbell Reverse Wrist Extension',
    nameAr: 'سحب سواعد أسفل',
    primaryMuscles: ['forearms'],
    secondaryMuscles: [],
    equipment: 'dumbbell',
    category: 'isolation',
    difficulty: 'beginner',
    startingPositionEn: 'Rest forearms flat across a bench (or on your thighs) with palms facing down holding light dumbbells.',
    startingPositionAr: 'أسند الساعدين على مقعد مستوٍ (أو على الفخذين) مع توجيه راحتي اليدين للأسفل وحمل دامبل خفيف.',
    instructionsEn: [
      'Extend wrists upward toward the ceiling while keeping forearms stationary.',
      'Lower slowly under control.'
    ],
    instructionsAr: [
      'ارفع ظهر اليدين للأعلى نحو السقف مع ثبات الساعدين.',
      'أنزل ببطء وتحكم كامل.'
    ],
    breathingEn: 'Exhale up; inhale down.',
    breathingAr: 'زفير عند الرفع، شهيق عند الإنزال.',
    commonMistakesEn: ['Using too much weight resulting in partial reps.'],
    commonMistakesAr: ['استخدام وزن ثقيل يقلل المدى الحركي.'],
    safetyEn: 'Keep movements smooth and pain-free.',
    safetyAr: 'حافظ على حركة سلسة وخالية من ألم المعصم.',
    alternativeIds: ['barbell-wrist-curl']
  },

  // QUADRICEPS
  {
    id: 'barbell-back-squat',
    nameEn: 'Barbell Back Squat',
    nameAr: 'دبني بار',
    primaryMuscles: ['quadriceps', 'glutes'],
    secondaryMuscles: ['hamstrings'],
    equipment: 'barbell',
    category: 'compound',
    difficulty: 'intermediate',
    startingPositionEn: 'Set the bar across your upper traps/rear delts. Stand with feet shoulder-width apart, toes turned slightly out (15–30 degrees), chest proud.',
    startingPositionAr: 'ثبّت البار على أعلى الظهر والكتفين (الترابيس). قف بقدمين بعرض الكتفين مع توجيه الأصابع للخارج قليلاً (15–30 درجة) وصدر مرفوع.',
    instructionsEn: [
      'Take a deep diaphragmatic breath and brace your core 360 degrees.',
      'Initiate by breaking at the hips and knees simultaneously, tracking knees in line with toes.',
      'Descend until hip crease reaches at least parallel with the knees while keeping heels planted.',
      'Drive forcefully through mid-foot back to full standing lock.'
    ],
    instructionsAr: [
      'خذ شهيقاً عميقاً واشدد عضلات البطن والجذع بالكامل.',
      'ابدأ النزول بثني الوركين والركبتين معاً مع توجيه الركبتين بمحاذاة أصابع القدم.',
      'انزل حتى يصل مفصل الورك إلى مستوى الركبة أو أدنى مع ثبات الكعبين على الأرض.',
      'ادفع بقوة عبر منتصف القدم للعودة إلى الوقوف باستقامة.'
    ],
    breathingEn: 'Inhale and brace before descending; hold brace through the bottom and exhale near lockout.',
    breathingAr: 'شهيق وشد قبل النزول، وحافظ على الثبات في الأسفل ثم ازفر عند الاقتراب من الوقوف.',
    commonMistakesEn: [
      'Knees caving inward (valgus) during the ascent.',
      'Heels lifting off the floor or excessive forward torso collapse.'
    ],
    commonMistakesAr: [
      'انحراف الركبتين للداخل أثناء الدفع للأعلى.',
      'ارتفاع الكعبين عن الأرض أو انحناء الجذع للأمام بشكل مبالغ فيه.'
    ],
    safetyEn: 'Always squat inside a rack with properly set safety spotter arms.',
    safetyAr: 'تدرّب دائماً داخل القفص مع ضبط حواجز الأمان على الارتفاع المناسب.',
    alternativeIds: ['leg-press-machine', 'smith-squat', 'dumbbell-goblet-squat']
  },
  {
    id: 'leg-press-machine',
    nameEn: '45-Degree Leg Press',
    nameAr: 'دفع ماكنة',
    primaryMuscles: ['quadriceps'],
    secondaryMuscles: ['glutes', 'hamstrings'],
    equipment: 'machine',
    category: 'compound',
    difficulty: 'beginner',
    startingPositionEn: 'Sit firmly in the seat with lower back and tailbone pressed flat against the pad. Place feet shoulder-width apart on the sled.',
    startingPositionAr: 'اجلس بثبات مع إلصاق أسفل الظهر والأرداف بالمسند تماماً، وضع القدمين بعرض الكتفين على المنصة.',
    instructionsEn: [
      'Release safety catches and lower the sled smoothly until knees approach a deep bend without your tailbone curling off the seat.',
      'Press through heels and mid-foot back up, stopping just short of locking knees hard.'
    ],
    instructionsAr: [
      'حرّر أقفال الأمان وأنزل المنصة بتحكم حتى ثني عميق للركبتين دون ارتفاع أسفل الظهر عن المقعد.',
      'ادفع عبر الكعبين ومنتصف القدم للأعلى مع التوقف قبل قفل الركبتين بعنف.'
    ],
    breathingEn: 'Inhale on the descent; exhale on the press.',
    breathingAr: 'شهيق عند النزول، زفير عند الدفع.',
    commonMistakesEn: ['Locking knees aggressively at the top.', 'Letting the lower back round off the pad at the bottom.'],
    commonMistakesAr: ['قفل مفصل الركبة بقوة في الأعلى.', 'ارتفاع أسفل الظهر عن المسند في نهاية النزول.'],
    safetyEn: 'Never place hands on your knees to assist; keep handles gripped firmly.',
    safetyAr: 'أمسك المقابض الجانبية بإحكام وتجنب وضع اليدين على الركبتين، وأعد تأمين الأقفال بعد الانتهاء.',
    alternativeIds: ['barbell-back-squat', 'smith-squat']
  },
  {
    id: 'leg-extension-machine',
    nameEn: 'Seated Leg Extension',
    nameAr: 'سيقان أمامي',
    primaryMuscles: ['quadriceps'],
    secondaryMuscles: [],
    equipment: 'machine',
    category: 'isolation',
    difficulty: 'beginner',
    startingPositionEn: 'Align your knee joint with the machine pivot axis. Set the shin pad comfortably just above your ankles.',
    startingPositionAr: 'حاذِ مفصل الركبة مع محور الجهاز، واضبط وسادة الساق أعلى الكاحلين مباشرة.',
    instructionsEn: [
      'Extend both knees smoothly until legs are straight, squeezing quads hard for 1 second.',
      'Lower slowly over 2–3 seconds to full knee flexion.'
    ],
    instructionsAr: [
      'افرد الساقين للأعلى بسلاسة حتى الاستقامة مع عصر العضلة الأمامية لمدة ثانية.',
      'أنزل ببطء خلال 2–3 ثوانٍ.'
    ],
    breathingEn: 'Exhale as you extend; inhale as you lower.',
    breathingAr: 'زفير عند الفرد للأعلى، شهيق عند الإنزال.',
    commonMistakesEn: ['Kicking the weight up rapidly using momentum.'],
    commonMistakesAr: ['رفع الوزن للأعلى باندفاع مفاجئ دون تحكم.'],
    safetyEn: 'Hold side handles to keep hips anchored to the seat.',
    safetyAr: 'تمسّك بالمقابض الجانبية لتثبيت الحوض في المقعد.',
    alternativeIds: ['dumbbell-goblet-squat', 'leg-press-machine']
  },
  {
    id: 'dumbbell-goblet-squat',
    nameEn: 'Dumbbell Goblet Squat',
    nameAr: 'سكوات دمبلص',
    primaryMuscles: ['quadriceps'],
    secondaryMuscles: ['glutes'],
    equipment: 'dumbbell',
    category: 'compound',
    difficulty: 'beginner',
    startingPositionEn: 'Hold one dumbbell vertically against your upper chest, elbows tucked under the weight, feet slightly wider than shoulder-width.',
    startingPositionAr: 'احمل دامبل عمودياً أمام أعلى الصدر مع ضم المرفقين أسفله، والوقوف بقدمين أعرض قليلاً من الكتفين.',
    instructionsEn: [
      'Sit straight down between your knees while keeping torso upright.',
      'Drive through your entire foot back to standing.'
    ],
    instructionsAr: [
      'انزل باستقامة الجذع بين الركبتين حتى عمق مريح.',
      'ادفع عبر كامل القدم للعودة للوقوف.'
    ],
    breathingEn: 'Inhale down; exhale up.',
    breathingAr: 'شهيق عند النزول، زفير عند الصعود.',
    commonMistakesEn: ['Letting the dumbbell pull the upper back into rounding.'],
    commonMistakesAr: ['تقوّس أعلى الظهر للأمام بسبب ثقل الدامبل.'],
    safetyEn: 'Keep elbows tucked close to ribcage.',
    safetyAr: 'أبقِ المرفقين قريبين من القفص الصدري.',
    alternativeIds: ['barbell-back-squat', 'smith-squat']
  },
  {
    id: 'smith-squat',
    nameEn: 'Smith Machine Squat',
    nameAr: 'دبني سميث',
    primaryMuscles: ['quadriceps'],
    secondaryMuscles: ['glutes', 'hamstrings'],
    equipment: 'smith_machine',
    category: 'compound',
    difficulty: 'beginner',
    startingPositionEn: 'Place bar across upper traps, step feet slightly forward (10–15 cm) of the vertical bar path for balanced knee travel.',
    startingPositionAr: 'ضع البار على أعلى الظهر والكتفين (الترابيس)، وقدّم القدمين قليلاً للأمام عن خط البار العمودي.',
    instructionsEn: [
      'Unlatch the bar and squat straight down under control.',
      'Drive back up smoothly through mid-foot and heels.'
    ],
    instructionsAr: [
      'حرّر قفل الأمان وانزل في القرفصاء بتحكم كامل.',
      'ادفع للأعلى بسلاسة عبر منتصف القدم والكعبين.'
    ],
    breathingEn: 'Inhale down; exhale up.',
    breathingAr: 'شهيق عند النزول، زفير عند الصعود.',
    commonMistakesEn: ['Placing feet too far behind or excessively far forward.'],
    commonMistakesAr: ['وضع القدمين للخلف كثيراً مما يضغط على الركبة والظهر.'],
    safetyEn: 'Lock safety stops just below your deepest squat depth.',
    safetyAr: 'اضبط مصدّات الأمان أسفل أقصى عمق نزول لك.',
    alternativeIds: ['barbell-back-squat', 'leg-press-machine']
  },

  // HAMSTRINGS
  {
    id: 'romanian-deadlift',
    nameEn: 'Barbell Romanian Deadlift (RDL)',
    nameAr: 'ديدليفت روماني',
    primaryMuscles: ['hamstrings', 'glutes'],
    secondaryMuscles: ['back', 'forearms'],
    equipment: 'barbell',
    category: 'compound',
    difficulty: 'intermediate',
    startingPositionEn: 'Hold the barbell at hip height with a shoulder-width overhand grip, knees softly unlocked (~15 degrees), shoulders retracted, spine neutral.',
    startingPositionAr: 'قف ممسكاً البار أمام الوركين بقبضة بعرض الكتفين، مع ثني خفيف وثابت في الركبتين واستقامة الظهر.',
    instructionsEn: [
      'Push your hips straight backward while keeping the bar gliding smoothly down your thighs and shins.',
      'Lower only as far as your hamstring flexibility allows without rounding your lower back (usually mid-shin).',
      'Pause briefly at full hamstring stretch, then drive hips forward by squeezing glutes and hamstrings to stand tall.'
    ],
    instructionsAr: [
      'ادفع الوركين للخلف أفقياً مع إبقاء البار ملاصقاً للفخذين والساقين أثناء النزول.',
      'انزل حتى أقصى تمدد للعضلة الخلفية دون تقوّس أسفل الظهر (عادة حتى منتصف الساق).',
      'توقف لحظة ثم ادفع الوركين للأمام بشد الأرداف والخلفية للعودة للوقوف.'
    ],
    breathingEn: 'Inhale and brace before hinging; exhale as you drive hips back to standing.',
    breathingAr: 'شهيق وشد للبطن قبل الانحناء، وزفير عند الدفع للوقوف.',
    commonMistakesEn: ['Rounding the lumbar spine to force the bar to the floor.', 'Bending knees into a squat instead of hinging at the hips.'],
    commonMistakesAr: ['تقوّس أسفل الظهر للوصول للأرض.', 'ثني الركبتين كثيراً وتحويل التمرين إلى قرفصاء.'],
    safetyEn: 'Keep the bar touching or within 1 cm of your legs throughout the entire rep.',
    safetyAr: 'أبقِ البار قريباً جداً من ساقيك طوال الحركة لحماية أسفل الظهر.',
    alternativeIds: ['lying-leg-curl', 'dumbbell-rdl']
  },
  {
    id: 'lying-leg-curl',
    nameEn: 'Lying / Seated Leg Curl Machine',
    nameAr: 'سيقان خلفي',
    primaryMuscles: ['hamstrings'],
    secondaryMuscles: [],
    equipment: 'machine',
    category: 'isolation',
    difficulty: 'beginner',
    startingPositionEn: 'Align knees with the machine pivot. Adjust roller pad just above your Achilles/heels and keep hips pressed firmly into the bench.',
    startingPositionAr: 'حاذِ الركبتين مع محور دوران الجهاز، واضبط الوسادة أعلى الكعبين مباشرة مع تثبيت الحوض على المقعد.',
    instructionsEn: [
      'Curl heels toward your glutes smoothly without lifting your hips off the pad.',
      'Hold peak contraction briefly, then lower slowly over 2–3 seconds to full extension.'
    ],
    instructionsAr: [
      'اثنِ الساقين بسحب الكعبين نحو الأرداف دون رفع الحوض عن المقعد.',
      'ثبّت الانقباض لحظة ثم أنزل ببطء خلال 2–3 ثوانٍ.'
    ],
    breathingEn: 'Exhale on the curl; inhale on the return.',
    breathingAr: 'زفير عند السحب، شهيق عند الإنزال.',
    commonMistakesEn: ['Arching the lower back and lifting hips to swing the pad up.'],
    commonMistakesAr: ['تقوّس أسفل الظهر ورفع الحوض للمساعدة في الرفع.'],
    safetyEn: 'Keep toes dorsiflexed or neutral and control the eccentric phase.',
    safetyAr: 'تحكم في مرحلة النزول ببطء وتجنب إفلات الوزن.',
    alternativeIds: ['romanian-deadlift', 'dumbbell-rdl']
  },
  {
    id: 'dumbbell-rdl',
    nameEn: 'Dumbbell Romanian Deadlift',
    nameAr: 'ديدليفت دمبلص',
    primaryMuscles: ['hamstrings', 'glutes'],
    secondaryMuscles: ['back', 'forearms'],
    equipment: 'dumbbell',
    category: 'compound',
    difficulty: 'beginner',
    startingPositionEn: 'Stand tall holding dumbbells in front of your thighs, knees softly unlocked, shoulders pulled back.',
    startingPositionAr: 'قف باستقامة ممسكاً بالدامبل أمام الفخذين مع ثني طفيف ثابت في الركبتين.',
    instructionsEn: [
      'Hinge hips back keeping dumbbells sliding close along your legs until mid-shin.',
      'Drive hips forward smoothly to return upright.'
    ],
    instructionsAr: [
      'ادفع الوركين للخلف مع تمرير الدامبل بمحاذاة الساقين حتى منتصف الساق.',
      'ادفع الوركين للأمام للوقوف باستقامة.'
    ],
    breathingEn: 'Inhale down; exhale up.',
    breathingAr: 'شهيق عند النزول، زفير عند الصعود.',
    commonMistakesEn: ['Letting dumbbells drift forward away from the shins.'],
    commonMistakesAr: ['ابتعاد الدامبل للأمام بعيداً عن الساقين.'],
    safetyEn: 'Keep spine neutral from neck to tailbone.',
    safetyAr: 'حافظ على استقامة العمود الفقري بالكامل.',
    alternativeIds: ['romanian-deadlift', 'lying-leg-curl']
  },

  // GLUTES
  {
    id: 'barbell-hip-thrust',
    nameEn: 'Barbell Hip Thrust',
    nameAr: 'هيب ثرست بالبار للأرداف',
    primaryMuscles: ['glutes'],
    secondaryMuscles: ['hamstrings', 'quadriceps'],
    equipment: 'barbell',
    category: 'compound',
    difficulty: 'intermediate',
    startingPositionEn: 'Rest upper back (just below shoulder blades) against a secure bench. Place a padded barbell across your hip crease, feet flat so shins are vertical at the top.',
    startingPositionAr: 'أسند أعلى الظهر (أسفل لوحي الكتف) على حافة المقعد، وضع البار المبطن فوق ثنية الورك مع تثبيت القدمين.',
    instructionsEn: [
      'Keep chin tucked slightly and ribcage down (avoid overarching lower back).',
      'Drive through your heels to lift hips until thighs and torso form a flat tabletop parallel to the floor.',
      'Squeeze glutes forcefully for 1–2 seconds at the top, then lower hips under control.'
    ],
    instructionsAr: [
      'اخفض ذقنك قليلاً نحو الصدر وحافظ على ثبات القفص الصدري.',
      'ادفع عبر الكعبين لرفع الوركين حتى يصبح الجذع والفخذان بمستوى أفقي موازٍ للأرض.',
      'اعصر عضلات الأرداف بقوة لمدة ثانية أو ثانيتين في الأعلى ثم أنزل بتحكم.'
    ],
    breathingEn: 'Inhale before thrusting; exhale and squeeze at the top.',
    breathingAr: 'شهيق قبل الدفع، وزفير مع العصر في الأعلى.',
    commonMistakesEn: ['Hyperextending the lower back at lockout instead of posterior pelvic tilt.', 'Feet placed too close or too far from the bench.'],
    commonMistakesAr: ['تقوّس أسفل الظهر في الأعلى بدلاً من عصر الأرداف.', 'وضع القدمين قريباً جداً أو بعيداً جداً عن المقعد.'],
    safetyEn: 'Always use a thick barbell pad and anchor the bench firmly against a wall or rack.',
    safetyAr: 'استخدم بطانة إسفنجية للبار وثبّت المقعد جيداً حتى لا ينزلق.',
    alternativeIds: ['cable-glute-kickback', 'bodyweight-bulgarian-split-squat']
  },
  {
    id: 'cable-glute-kickback',
    nameEn: 'Cable Glute Kickback',
    nameAr: 'كيك باك بكرة',
    primaryMuscles: ['glutes'],
    secondaryMuscles: ['hamstrings'],
    equipment: 'cable',
    category: 'isolation',
    difficulty: 'beginner',
    startingPositionEn: 'Attach an ankle strap to a low pulley. Face the machine, hold the frame for stability with torso slightly leaned forward.',
    startingPositionAr: 'ثبّت حبل الكاحل في البكرة السفلية، قف مواجهاً للجهاز وأمسك الإطار للثبات مع ميلان طفيف للأمام.',
    instructionsEn: [
      'Kick the strapped leg straight back and slightly upward by contracting your glute.',
      'Pause briefly at full hip extension without twisting or arching your lower back, then return slowly.'
    ],
    instructionsAr: [
      'ادفع الساق للخلف وللأعلى قليلاً عبر انقباض عضلة الأرداف.',
      'ثبّت لحظة عند أقصى امتداد دون تقوّس أسفل الظهر، ثم عد ببطء.'
    ],
    breathingEn: 'Exhale on kickback; inhale on return.',
    breathingAr: 'زفير عند الدفع للخلف، شهيق عند الرجوع.',
    commonMistakesEn: ['Swinging the leg using momentum and arching the lower back.'],
    commonMistakesAr: ['تأرجح الساق وتقوّس أسفل الظهر لرفع الوزن.'],
    safetyEn: 'Keep core braced so movement comes strictly from the hip.',
    safetyAr: 'اشدد البطن لتكون الحركة من مفصل الورك فقط.',
    alternativeIds: ['barbell-hip-thrust', 'bodyweight-bulgarian-split-squat']
  },
  {
    id: 'bodyweight-bulgarian-split-squat',
    nameEn: 'Bulgarian Split Squat (Dumbbell / Bodyweight)',
    nameAr: 'سكوات بلغاري',
    primaryMuscles: ['glutes', 'quadriceps'],
    secondaryMuscles: ['hamstrings'],
    equipment: 'bodyweight',
    category: 'compound',
    difficulty: 'intermediate',
    startingPositionEn: 'Stand ~2 feet in front of a bench holding dumbbells at your sides (or bodyweight), resting the top of your rear foot on the bench behind you. Lean torso slightly forward for glute emphasis or upright for quads.',
    startingPositionAr: 'قف أمام مقعد ممسكاً بالدامبل على الجانبين (أو بوزن الجسم)، وضع مشط القدم الخلفية فوق المقعد خلفك، مع ميلان طفيف للأمام للأرداف أو استقامة للفخذ الأمامي.',
    instructionsEn: [
      'Lower your back knee straight down toward the floor under control until front thigh is at least parallel.',
      'Drive firmly through the front foot to return to standing.'
    ],
    instructionsAr: [
      'أنزل الركبة الخلفية باتجاه الأرض بتحكم حتى يوازي الفخذ الأمامي الأرض.',
      'ادفع بقوة عبر القدم الأمامية للعودة للوقوف.'
    ],
    breathingEn: 'Inhale down; exhale up.',
    breathingAr: 'شهيق عند النزول، زفير عند الصعود.',
    commonMistakesEn: ['Standing on a tightrope (feet directly behind each other) causing balance loss.'],
    commonMistakesAr: ['وضع القدمين على خط مستقيم واحد مما يُفقدك التوازن.'],
    safetyEn: 'Keep front knee tracking cleanly over the second/third toe.',
    safetyAr: 'وجّه الركبة الأمامية بمحاذاة أصابع القدم.',
    alternativeIds: ['barbell-hip-thrust', 'leg-press-machine']
  },

  // CALVES
  {
    id: 'standing-calf-raise-machine',
    nameEn: 'Standing Calf Raise',
    nameAr: 'كولف',
    primaryMuscles: ['calves'],
    secondaryMuscles: [],
    equipment: 'machine',
    category: 'isolation',
    difficulty: 'beginner',
    startingPositionEn: 'Place balls of your feet firmly on the edge of the step with shoulders under the pads and knees nearly straight.',
    startingPositionAr: 'ضع مقدمة القدمين على حافة الدرجة مع تثبيت الكتفين أسفل الوسادات واستقامة الركبتين تقريباً.',
    instructionsEn: [
      'Lower your heels slowly to a deep calf stretch and pause for 1–2 seconds at the bottom to eliminate bounce.',
      'Drive up onto your toes as high as possible and squeeze calves for 1 second.'
    ],
    instructionsAr: [
      'أنزل الكعبين ببطء إلى أقصى تمدد وتوقف ثانية في الأسفل لإلغاء الارتداد.',
      'ارتفع على أطراف الأصابع لأقصى مدى ممكن واعصر السمانة لمدة ثانية.'
    ],
    breathingEn: 'Inhale on the stretch; exhale as you raise up.',
    breathingAr: 'شهيق عند التمدد، زفير عند الرفع.',
    commonMistakesEn: ['Bouncing rapidly through the Achilles tendon without pausing at the bottom.'],
    commonMistakesAr: ['الارتداد السريع في الأسفل دون توقف وتحكم.'],
    safetyEn: 'Avoid locking knees violently; keep soft control.',
    safetyAr: 'تحكم في كل تكرار ببطء وتجنب قفل الركبتين بعنف.',
    alternativeIds: ['smith-standing-calf-raise']
  },
  {
    id: 'smith-standing-calf-raise',
    nameEn: 'Smith Machine Calf Raise',
    nameAr: 'كولف واقف سميث',
    primaryMuscles: ['calves'],
    secondaryMuscles: [],
    equipment: 'smith_machine',
    category: 'isolation',
    difficulty: 'beginner',
    startingPositionEn: 'Place a stable calf block or plates under the Smith bar. Rest bar on traps and stand with balls of feet on the block edge.',
    startingPositionAr: 'ضع منصة مرتفعة ثابتة أسفل بار السميث، وضع البار على الكتفين ومقدمة القدمين على حافة المنصة.',
    instructionsEn: [
      'Lower heels slowly into a deep stretch, pause briefly, then press all the way up onto toes.'
    ],
    instructionsAr: [
      'أنزل الكعبين ببطء للتمدد الكامل ثم ادفع للأعلى بأقصى مدى على أطراف الأصابع.'
    ],
    breathingEn: 'Inhale down; exhale up.',
    breathingAr: 'شهيق عند النزول، زفير عند الصعود.',
    commonMistakesEn: ['Using an unstable block or bouncing reps.'],
    commonMistakesAr: ['استخدام منصة غير ثابتة أو التسرع في التكرارات.'],
    safetyEn: 'Set safety stops at hip/mid-thigh height.',
    safetyAr: 'اضبط مصدّات الأمان على ارتفاع آمن.',
    alternativeIds: ['standing-calf-raise-machine']
  },

  // ABDOMINALS
  {
    id: 'cable-crunch',
    nameEn: 'Kneeling Cable Rope Crunch',
    nameAr: 'طحن معدة حبل',
    primaryMuscles: ['abdominals'],
    secondaryMuscles: [],
    equipment: 'cable',
    category: 'isolation',
    difficulty: 'beginner',
    startingPositionEn: 'Attach a rope to a high pulley, kneel on a mat, and hold the rope ends beside your temples/ears with hips locked upright.',
    startingPositionAr: 'ثبّت الحبل في البكرة العلوية، اركع على الأرضية وأمسك الحبل بجانب الرأس مع تثبيت الوركين للأعلى.',
    instructionsEn: [
      'Keep your hips stationary and flex your spine forward, curling your ribs down toward your pelvis.',
      'Squeeze abdominals hard at the bottom, then return slowly under tension.'
    ],
    instructionsAr: [
      'ثبّت الوركين واثنِ العمود الفقري للأمام بسحب القفص الصدري نحو الحوض.',
      'اعصر عضلات البطن بقوة في الأسفل ثم عد ببطء وتحكم.'
    ],
    breathingEn: 'Exhale forcefully as you crunch down; inhale as you return.',
    breathingAr: 'ازفر بقوة أثناء الانقباض للأسفل، وخذ شهيقاً عند الصعود.',
    commonMistakesEn: ['Sitting back onto the heels, turning the crunch into a hip hinge.'],
    commonMistakesAr: ['إرجاع الأرداف للخلف نحو الكعبين مما يقلل عمل عضلات البطن.'],
    safetyEn: 'Focus on spinal flexion rather than pulling with your arms.',
    safetyAr: 'ركز على انثناء الجذع وليس السحب بالذراعين.',
    alternativeIds: ['hanging-leg-raise', 'plank-hold']
  },
  {
    id: 'hanging-leg-raise',
    nameEn: 'Hanging Knee / Leg Raise',
    nameAr: 'رفع جذع',
    primaryMuscles: ['abdominals'],
    secondaryMuscles: [],
    equipment: 'bodyweight',
    category: 'isolation',
    difficulty: 'intermediate',
    startingPositionEn: 'Hang cleanly from a pull-up bar with straight arms and minimal body swing.',
    startingPositionAr: 'تعلّق ببار العقلة باستقامة الذراعين وتثبيت الجسم دون تأرجح.',
    instructionsEn: [
      'Curl your pelvis upward toward your ribcage while raising knees or straight legs above hip height.',
      'Lower slowly back down without swinging.'
    ],
    instructionsAr: [
      'ارفع الركبتين أو الساقين للأعلى مع رفع الحوض قليلاً نحو الصدر لتشغيل عضلات البطن بقوة.',
      'أنزل الساقين ببطء وتحكم دون تأرجح.'
    ],
    breathingEn: 'Exhale as legs rise; inhale as they lower.',
    breathingAr: 'زفير عند الرفع، شهيق عند الإنزال.',
    commonMistakesEn: ['Only lifting to 90 degrees with hip flexors without curling the pelvis.'],
    commonMistakesAr: ['رفع الساقين فقط بمفصل الورك دون تدوير الحوض لتفعيل البطن.'],
    safetyEn: 'Use elbow straps if grip fatigues before abdominals.',
    safetyAr: 'يمكنك استخدام أحزمة المرفقين إذا تعبت القبضة قبل البطن.',
    alternativeIds: ['cable-crunch', 'plank-hold']
  },
  {
    id: 'plank-hold',
    nameEn: 'Forearm Plank',
    nameAr: 'بلانك',
    primaryMuscles: ['abdominals'],
    secondaryMuscles: [],
    equipment: 'bodyweight',
    category: 'isolation',
    difficulty: 'beginner',
    startingPositionEn: 'Rest on forearms with elbows directly beneath shoulders, toes planted, body forming a straight rigid line.',
    startingPositionAr: 'ارتكز على الساعدين مع وضع المرفقين أسفل الكتفين مباشرة، وتثبيت أصابع القدم في خط جسم مستقيم.',
    instructionsEn: [
      'Squeeze glutes, quads, and brace abs tightly as if preparing for an impact.',
      'Hold steady without letting hips sag or pike up.'
    ],
    instructionsAr: [
      'اشدد عضلات البطن والأرداف والفخذين بقوة.',
      'حافظ على الثبات دون هبوط الوركين أو ارتفاعهما.'
    ],
    breathingEn: 'Breathe steadily and shallowly while maintaining core tension.',
    breathingAr: 'تنفّس بانتظام وهدوء مع إبقاء شد البطن مستمراً.',
    commonMistakesEn: ['Dropping the lower back into lumbar arch.'],
    commonMistakesAr: ['هبوط أسفل الظهر وتقوّسه للأسفل.'],
    safetyEn: 'Stop the set if form breaks and lower back takes over.',
    safetyAr: 'أنهِ الجولة إذا شعرت بإجهاد في أسفل الظهر بدلاً من البطن.',
    alternativeIds: ['cable-crunch', 'resistance-band-pallof-press']
  },
  {
    id: 'resistance-band-pallof-press',
    nameEn: 'Resistance Band Pallof Press',
    nameAr: 'بالوف بريس بحبل المقاومة للبطن',
    primaryMuscles: ['abdominals'],
    secondaryMuscles: [],
    equipment: 'resistance_bands',
    category: 'isolation',
    difficulty: 'beginner',
    startingPositionEn: 'Anchor band sideways at chest height, step out to create tension, and hold handle at the center of your sternum with both hands.',
    startingPositionAr: 'ثبّت حبل المقاومة جانبياً بمستوى الصدر، ابتعد لخلق شد مناسب، وأمسك المقبض بكلتا اليدين أمام منتصف الصدر.',
    instructionsEn: [
      'Press hands straight forward resisting the band’s pull to rotate your torso.',
      'Hold 2 seconds with straight arms, then bring hands back to sternum.'
    ],
    instructionsAr: [
      'ادفع اليدين للأمام باستقامة مع مقاومة قوة سحب الحبل ومنع التفاف الجذع.',
      'ثبّت ثانيتين ثم أعد اليدين إلى منتصف الصدر.'
    ],
    breathingEn: 'Exhale during press out; inhale on return.',
    breathingAr: 'زفير عند الدفع للأمام، شهيق عند الرجوع.',
    commonMistakesEn: ['Allowing hips or shoulders to twist toward the anchor.'],
    commonMistakesAr: ['السماح للكتفين أو الوركين بالالتفاف نحو نقطة التثبيت.'],
    safetyEn: 'Keep knees soft and glutes engaged.',
    safetyAr: 'حافظ على ثني خفيف للركبتين وشد الأرداف.',
    alternativeIds: ['plank-hold', 'cable-crunch']
  },
  {
    id: 'machine-ab-crunch',
    nameEn: 'Seated Ab Crunch Machine',
    nameAr: 'طحن معدة جهاز',
    primaryMuscles: ['abdominals'],
    secondaryMuscles: [],
    equipment: 'machine',
    category: 'isolation',
    difficulty: 'beginner',
    startingPositionEn: 'Adjust the seat height so the pivot aligns near your mid-abdomen. Sit upright with shoulders resting against the upper pads, ankles tucked behind the lower roller pads, and hands gripping the front handles beside your shoulders.',
    startingPositionAr: 'اضبط ارتفاع المقعد ليتحاذى محور الدوران مع منتصف البطن. اجلس باستقامة مع إسناد الكتفين للوسائد العلوية، وتثبيت الكاحلين خلف وسادات الأرجل السفلية، وإمساك المقبضين قرب الكتفين.',
    instructionsEn: [
      'Brace your core and curl your ribcage smoothly forward and downward toward your pelvis by flexing your spine.',
      'Hold the peak abdominal squeeze at the bottom for 1 full second without pulling with your arms.',
      'Return slowly under control to the upright starting position while maintaining tension on your abs.'
    ],
    instructionsAr: [
      'اشدد عضلات البطن واطوِ القفص الصدري للأمام وللأسفل باتجاه الحوض عبر ثني العمود الفقري.',
      'ثبّت عصر عضلات البطن في الأسفل لمدة ثانية واحدة دون شد المقابض بالذراعين.',
      'عد ببطء وتحكم إلى وضعية البداية مع إبقاء التوتر مستمراً على عضلات المعدة.'
    ],
    breathingEn: 'Exhale forcefully as you crunch forward; inhale smoothly as you return upright.',
    breathingAr: 'ازفر بقوة أثناء الطي للأمام، وخذ شهيقاً بهدوء عند العودة للخلف.',
    commonMistakesEn: [
      'Pulling the handles down with your arms instead of curling your torso with your abs.',
      'Letting the weight stack slam down rapidly between reps.'
    ],
    commonMistakesAr: [
      'سحب المقابض بقوة الذراعين والكتفين بدلاً من طي الجذع بعضلات البطن.',
      'إفلات الوزن للخلف بسرعة وارتطام الألواح بين التكرارات.'
    ],
    safetyEn: 'Keep your neck relaxed and let your ribcage—not your head—lead the crunch.',
    safetyAr: 'أبقِ الرقبة مسترخية ولا تشد الرأس للأمام، بل اجعل الحركة من طي القفص الصدري فقط.',
    alternativeIds: ['cable-crunch', 'hanging-leg-raise', 'plank-hold']
  },
  // ADDED FOUNDATIONAL & CLASSIC BODYBUILDING / STRENGTH EXERCISES
  {
    id: 'dumbbell-bench-press',
    nameEn: 'Dumbbell Flat Bench Press',
    nameAr: 'بنش دمبلص مستوي',
    primaryMuscles: ['chest'],
    secondaryMuscles: ['shoulders', 'triceps'],
    equipment: 'dumbbell',
    category: 'compound',
    difficulty: 'beginner',
    startingPositionEn: 'Sit on a flat bench holding dumbbells on your thighs, kick back carefully into a supine position with feet planted, shoulder blades retracted, and dumbbells stacked over mid-chest.',
    startingPositionAr: 'اجلس على المقعد المستوي مع إسناد الدامبل على الفخذين، استلقِ للخلف بثبات القدمين على الأرض، اسحب لوحي الكتف للخلف، وثبّت الدامبل فوق منتصف الصدر.',
    instructionsEn: [
      'Lower dumbbells slowly with elbows tucked roughly 45 degrees until upper arms sit just below bench height.',
      'Feel a clean stretch across the pectorals without losing shoulder position.',
      'Press vertically upward and slightly inward along a smooth arc without clanking weights together.'
    ],
    instructionsAr: [
      'أنزل الدامبل بتحكم مع إبقاء المرفقين بزاوية 45 درجة حتى يتوازى العضد مع مستوى الصدر أو يتجاوزه قليلاً.',
      'اشعر بتمدد واضح في الصدر مع الحفاظ على ثبات الكتفين على المقعد.',
      'ادفع للأعلى وللداخل قليلاً دون اصطدام الدامبل ببعضهما في القمة.'
    ],
    breathingEn: 'Inhale on the controlled descent; exhale as you drive through the press.',
    breathingAr: 'شهيق أثناء النزول المتحكم به، وزفير أثناء الدفع للأعلى.',
    commonMistakesEn: [
      'Letting dumbbells drift too far toward the neck or flaring elbows at 90 degrees.',
      'Dropping elbows rapidly without eccentric control.'
    ],
    commonMistakesAr: [
      'إمالة الدامبل نحو الرقبة أو فتح المرفقين بزاوية 90 درجة.',
      'إسقاط الوزن بسرعة دون تحكم أثناء النزول.'
    ],
    safetyEn: 'Keep wrists neutral and finish sets by bringing knees up to meet the dumbbells before sitting up.',
    safetyAr: 'حافظ على استقامة المعصمين وأنهِ الجولة برفع الركبتين لتسند عليهما الدامبل قبل النهوض.',
    alternativeIds: ['barbell-bench-press', 'chest-press-machine', 'push-ups']
  },
  {
    id: 'incline-barbell-press',
    nameEn: 'Incline Barbell Bench Press',
    nameAr: 'بنش أعلى وسط',
    primaryMuscles: ['chest'],
    secondaryMuscles: ['shoulders', 'triceps'],
    equipment: 'barbell',
    category: 'compound',
    difficulty: 'intermediate',
    startingPositionEn: 'Lie on a 30–45° incline bench with eyes beneath the barbell. Plant feet firmly, depress shoulder blades, and grip slightly wider than shoulder-width.',
    startingPositionAr: 'استلقِ على مقعد مائل بزاوية 30–45 درجة مع وضع العينين أسفل البار. ثبّت القدمين بالأرض واسحب لوحي الكتف للخلف وأمسك البار بقبضة أعرض قليلاً من الكتفين.',
    instructionsEn: [
      'Unrack the bar and hold steady directly over the upper chest (clavicular region).',
      'Lower cleanly toward the upper chest right below the collarbone while keeping elbows at 45 degrees.',
      'Touch lightly and press directly upward above the shoulder line.'
    ],
    instructionsAr: [
      'ارفع البار عن الحامل وثبّته فوق أعلى الصدر.',
      'أنزل البار بتحكم نحو أعلى الصدر أسفل الترقوة مباشرة مع الحفاظ على زاوية المرفقين 45 درجة.',
      'المس لمساً خفيفاً ثم ادفع باستقامة للأعلى فوق خط الكتفين.'
    ],
    breathingEn: 'Inhale and brace prior to lowering; exhale through the upper-chest drive.',
    breathingAr: 'شهيق عميق وشد الجذع قبل النزول، وزفير أثناء الدفع.',
    commonMistakesEn: [
      'Lowering the bar onto the lower sternum or throat.',
      'Setting the bench steeper than 45 degrees, turning the press into a front-delt lift.'
    ],
    commonMistakesAr: [
      'إنزال البار لأسفل الصدر أو نحو الرقبة.',
      'رفع زاوية المقعد أكثر من 45 درجة مما ينقل الحمل للكتف الأمامي.'
    ],
    safetyEn: 'Use rack safeties or a spotter; avoid thumb-less suicide grips.',
    safetyAr: 'استخدم حواجز الأمان أو شريك مساعدة، وتجنب القبضة المفتوحة دون الإبهام.',
    alternativeIds: ['incline-dumbbell-press', 'smith-bench-press', 'barbell-bench-press']
  },
  {
    id: 'pec-deck-machine',
    nameEn: 'Pec Deck Machine Fly',
    nameAr: 'فلاي فراشة (جمع صدر)',
    primaryMuscles: ['chest'],
    secondaryMuscles: ['shoulders'],
    equipment: 'machine',
    category: 'isolation',
    difficulty: 'beginner',
    startingPositionEn: 'Adjust seat height so handles align with mid-chest. Sit tall with shoulder blades gently pinned against the backrest and slight elbow softness.',
    startingPositionAr: 'اضبط ارتفاع المقعد لتكون المقابض بمستوى منتصف الصدر. اجلس باستقامة مع إسناد لوحي الكتف للمسند وثني طفيف جداً في المرفقين.',
    instructionsEn: [
      'Sweep both arms inward in a wide hugging arc until handles nearly meet at chest midline.',
      'Squeeze the pectorals deliberately for one second at peak contraction.',
      'Control the return smoothly until a comfortable chest stretch without letting shoulders roll forward.'
    ],
    instructionsAr: [
      'اجمع الذراعين للداخل في قوس واسع حتى تقترب المقابض عند منتصف الصدر.',
      'اعصر عضلة الصدر بتركيز لمدة ثانية في قمة الانقباض.',
      'عد ببطء وتحكم حتى تمدد مريح دون تقدم الكتفين للأمام.'
    ],
    breathingEn: 'Exhale while bringing arms together; inhale cleanly during the stretch phase.',
    breathingAr: 'زفير عند ضم الذراعين، وشهيق عند الفتح والتمدد.',
    commonMistakesEn: [
      'Shrugging shoulders upward or sliding back off the pad during peak squeeze.',
      'Setting handles too far behind torso mobility range.'
    ],
    commonMistakesAr: [
      'رفع الكتفين للأعلى أو انفصال الظهر عن المسند أثناء الضم.',
      'ضبط مدى المقابض للخلف بشكل مفرط يرهق مفصل الكتف.'
    ],
    safetyEn: 'Select pin range just comfortable for healthy shoulder external rotation.',
    safetyAr: 'اضبط مدى البداية على درجة مريحة لمرونة مفصل الكتف.',
    alternativeIds: ['cable-chest-fly', 'chest-press-machine']
  },
  {
    id: 'chest-dips',
    nameEn: 'Parallel Bar Chest Dips',
    nameAr: 'غطس متوازي صدر',
    primaryMuscles: ['chest', 'triceps'],
    secondaryMuscles: ['shoulders'],
    equipment: 'bodyweight',
    category: 'compound',
    difficulty: 'intermediate',
    startingPositionEn: 'Grasp parallel dip bars with arms locked, depress shoulders away from ears, lean torso forward ~20–30°, and cross ankles softly behind you.',
    startingPositionAr: 'أمسك قضبان المتوازي بذراعين مستقيمتين، اخفض الكتفين بعيداً عن الأذنين، أمل الجذع للأمام بنحو 20–30 درجة، واثنِ الساقين للخلف.',
    instructionsEn: [
      'Bend elbows cleanly while leaning slightly forward until shoulders sit just below elbow height (or comfortable ROM).',
      'Maintain tension through the chest and triceps at the bottom without dropping into the joint.',
      'Press powerfully back up to locked elbows while preserving shoulder depression.'
    ],
    instructionsAr: [
      'اثنِ المرفقين بتحكم مع إمالة الجذع للأمام قليلاً حتى يصل الكتفان لمستوى المرفقين تقريباً.',
      'حافظ على توتر الصدر والترايسبس في الأسفل دون السقوط على المفصل.',
      'ادفع بقوة للأعلى حتى استقامة الذراعين مع بقاء الكتفين منخفضين.'
    ],
    breathingEn: 'Inhale during descent; exhale sharply through lockout.',
    breathingAr: 'شهيق أثناء النزول، وزفير قوي عند الصعود.',
    commonMistakesEn: [
      'Dropping too deep beyond anterior shoulder mobility.',
      'Shrugging traps upward toward ears at top or bottom.'
    ],
    commonMistakesAr: [
      'النزول لعمق مفرط يتجاوز مرونة الكتف الأمامي.',
      'رفع الأكتاف نحو الأذنين في الأعلى أو الأسفل.'
    ],
    safetyEn: 'Use an assisted dip station or resistance band until you perform 10 clean bodyweight reps.',
    safetyAr: 'استخدم جهاز المساعدة أو حبل المقاومة حتى تتقن 10 تكرارات كاملة بوزن الجسم.',
    alternativeIds: ['bench-dips', 'push-ups', 'cable-chest-fly']
  },
  {
    id: 'chin-ups',
    nameEn: 'Underhand Chin-Ups',
    nameAr: 'عقلة معكوسة',
    primaryMuscles: ['back', 'biceps'],
    secondaryMuscles: ['forearms'],
    equipment: 'bodyweight',
    category: 'compound',
    difficulty: 'intermediate',
    startingPositionEn: 'Grip the pull-up bar with palms facing you (supinated) at shoulder width, hang with chest subtly lifted and core braced.',
    startingPositionAr: 'أمسك بار العقلة بقبضة معكوسة (راحتا اليد نحوك) بعرض الكتفين، تعلّق مع رفع خفيف للصدر وشد البطن.',
    instructionsEn: [
      'Depress shoulder blades first, then drive elbows downward toward your front ribs.',
      'Pull chest smoothly toward the bar without swinging knees or crane-necking chin.',
      'Lower evenly over 2–3 seconds to a full controlled hang.'
    ],
    instructionsAr: [
      'اخفض لوحي الكتف أولاً ثم اسحب المرفقين للأسفل نحو الأضلاع الأمامية.',
      'ارفع الصدر بثبات نحو البار دون أرجحة الساقين أو مد الرقبة.',
      'أنزل جسمك بتحكم خلال 2–3 ثوانٍ حتى الاستقامة الكاملة.'
    ],
    breathingEn: 'Exhale while pulling up; inhale during controlled lowering.',
    breathingAr: 'زفير عند السحب للأعلى، وشهيق عند النزول المتحكم به.',
    commonMistakesEn: [
      'Stopping half-way down before full lat & bicep stretch.',
      'Using excessive hip kipping momentum.'
    ],
    commonMistakesAr: [
      'عدم استكمال النزول لإطالة الظهر والبايسبس.',
      'الاعتماد على أرجحة الحوض لصعود التكرار.'
    ],
    safetyEn: 'Avoid locking shoulders passively into a limp hang if you experience shoulder instability.',
    safetyAr: 'تجنب إرخاء الكتفين بالكامل في الأسفل إذا كان لديك ضعف في ثبات مفصل الكتف.',
    alternativeIds: ['pull-ups', 'lat-pulldown', 'barbell-bicep-curl']
  },
  {
    id: 'pendlay-row',
    nameEn: 'Pendlay Barbell Row',
    nameAr: 'سحب بار منحني',
    primaryMuscles: ['back'],
    secondaryMuscles: ['biceps', 'shoulders', 'forearms'],
    equipment: 'barbell',
    category: 'compound',
    difficulty: 'advanced',
    startingPositionEn: 'Set the barbell resting on the floor (bumper plates or blocks at mid-shin height). Hinge torso nearly parallel to the floor with flat lower back and shoulder-width overhand grip.',
    startingPositionAr: 'ضع البار مستنداً على الأرض بأوزان قياسية. انحنِ بالجذع ليقارب التوازي مع الأرض مع استقامة تامة لأسفل الظهر وقبضة علوية بعرض الكتفين.',
    instructionsEn: [
      'Brace core sharply and pull the bar explosively off the floor straight toward the lower sternum.',
      'Keep torso angle fixed—do not heave hips upward to yank the bar.',
      'Lower the bar cleanly back to a dead stop on the floor, reset posture, and repeat each rep strictly.'
    ],
    instructionsAr: [
      'اشدد الجذع والظهر بقوة واسحب البار مباشرة وبثبات من الأرض نحو أسفل الصدر.',
      'حافظ على ثبات زاوية الظهر دون رفعه للأعلى للمساعدة.',
      'أعد البار ليتوقف تماماً على الأرض في كل تكرار ثم أعد التثبيت وكرر.'
    ],
    breathingEn: 'Inhale and brace against the dead stop on the floor; exhale sharply at top or reset.',
    breathingAr: 'شهيق وشد الجذع قبل كل سحبة من الأرض، وزفير عند إعادة البار.',
    commonMistakesEn: [
      'Rising into an upright torso angle to lift heavier weights.',
      'Rounding the lumbar spine at the start off the floor.'
    ],
    commonMistakesAr: [
      'رفع زاوية الجذع للأعلى لتسهيل السحب.',
      'تقوّس أسفل الظهر عند الانطلاق من الأرض.'
    ],
    safetyEn: 'Lighter weights can rest on low blocks so the bar clears mid-shin height cleanly.',
    safetyAr: 'استخدم قوالب رفع تحت الأوزان الخفيفة للحفاظ على الارتفاع الصحيح للبار.',
    alternativeIds: ['barbell-bent-over-row', 'chest-supported-row-machine', 'seated-cable-row']
  },
  {
    id: 'conventional-deadlift',
    nameEn: 'Conventional Barbell Deadlift',
    nameAr: 'ديدليفت',
    primaryMuscles: ['back', 'glutes', 'hamstrings'],
    secondaryMuscles: ['quadriceps', 'forearms'],
    equipment: 'barbell',
    category: 'compound',
    difficulty: 'advanced',
    startingPositionEn: 'Stand with mid-foot directly beneath the barbell, feet hip-width apart. Grip bar just outside legs, bring shins to bar, lift chest, engage lats firmly, and lock neutral spine.',
    startingPositionAr: 'قف بحيث يكون منتصف القدم تحت البار مباشرة بفتحة بعرض الورك. أمسك البار خارج الساقين مباشرة، قرّب الساقين للبار، ارفع الصدر، شد عضلات الظهر وتحت الإبطين، وحافظ على استقامة العمود الفقري.',
    instructionsEn: [
      'Pull slack cleanly out of the bar until you feel tension across hamstrings and back, without jerking.',
      'Push the floor away with your legs while keeping the bar dragging closely along shins and thighs.',
      'Once the bar passes the knees, drive hips forward cleanly to stand tall—without hyperextending the lower back.',
      'Push hips back first to guide the bar straight down close to the body to a controlled floor stop.'
    ],
    instructionsAr: [
      'شد جسمك وخذ وضع الاستعداد على البار قبل رفعه لتشعر بشد الظهر والفخذ الخلفي دون خطف مفاجئ.',
      'ادفع الأرض بقدميك مع إبقاء البار ملاصقاً للساقين والفخذين أثناء الصعود.',
      'بعد تجاوز الركبتين ادفع الورك للأمام للوقوف باستقامة دون تقوّس أسفل الظهر للخلف.',
      'ارجع بالورك أولاً ثم اثنِ الركبتين لإعادة البار بتحكم تام إلى الأرض.'
    ],
    breathingEn: 'Take a big belly breath and brace 360° against your torso before pulling; hold through the pull, then exhale smoothly after lockout or at the floor.',
    breathingAr: 'خذ شهيقاً عميقاً واشدد البطن والجذع بالكامل قبل السحب، واحتفظ بالثبات حتى استقامة الوقوف.',
    commonMistakesEn: [
      'Jerking the bar off the floor with a rounded lumbar spine.',
      'Letting the bar drift inches forward away from the shins.',
      'Hyperextending backward sharply at the lockout.'
    ],
    commonMistakesAr: [
      'خطف البار من الأرض مع تقوّس أسفل الظهر.',
      'ابتعاد البار عن الساقين للأمام.',
      'المبالغة في إرجاع الظهر للخلف عند نهاية الرفعة.'
    ],
    safetyEn: 'Prioritize spinal neutrality above load. Stop the set immediately if lumbar form breaks.',
    safetyAr: 'أولوية استقامة العمود الفقري تعلو على مقدار الوزن؛ أوقف الجولة فوراً إذا انحنى أسفل الظهر.',
    alternativeIds: ['romanian-deadlift', 'barbell-hip-thrust', 'barbell-back-squat']
  },
  {
    id: 'barbell-front-squat',
    nameEn: 'Barbell Front Squat',
    nameAr: 'دبني أمامي',
    primaryMuscles: ['quadriceps', 'glutes'],
    secondaryMuscles: [],
    equipment: 'barbell',
    category: 'compound',
    difficulty: 'advanced',
    startingPositionEn: 'Rest the barbell across the anterior deltoid shelf right against the base of the neck, elbows driven high forward, torso upright, and feet shoulder-width.',
    startingPositionAr: 'ثبّت البار على الكتفين الأماميين بمحاذاة قاعدة الرقبة، مع رفع المرفقين عالياً للأمام، واستقامة الجذع، ووقفة بعرض الكتفين.',
    instructionsEn: [
      'Brace core upright and initiate descent by breaking smoothly at knees and hips simultaneously.',
      'Keep elbows lifted high throughout the bottom hole so the torso stays vertical.',
      'Drive through full foot tripod straight upward maintaining upright posture.'
    ],
    instructionsAr: [
      'اشدد البطن وابدأ النزول بثني الركبتين والورك معاً مع بقاء الجذع منتصباً.',
      'حافظ على ارتفاع المرفقين طوال النزول لمنع سقوط البار للأمام.',
      'ادفع بكامل باطن القدم للأعلى مع ثبات استقامة الظهر والمرفقين.'
    ],
    breathingEn: 'Inhale deeply and brace torso upright before descending; exhale past the sticking point.',
    breathingAr: 'شهيق عميق وشد الجذع للأعلى قبل النزول، وزفير بعد تجاوز منتصف الصعود.',
    commonMistakesEn: [
      'Letting elbows drop, causing upper back rounding and bar roll-off.',
      'Heels lifting off the floor from limited ankle dorsiflexion.'
    ],
    commonMistakesAr: [
      'هبوط المرفقين مما يؤدي لتقوّس أعلى الظهر وانزلاق البار.',
      'ارتفاع الكعبين عن الأرض بسبب قلة مرونة الكاحل.'
    ],
    safetyEn: 'Use clean-grip, cross-arm grip, or wrist straps looped on the bar if wrist mobility is restricted.',
    safetyAr: 'استخدم المسكة الكلاسيكية أو المتقاطعة أو أحزمة المعصم إذا كانت مرونة الرسغ محدودة.',
    alternativeIds: ['barbell-back-squat', 'dumbbell-goblet-squat', 'leg-press-machine']
  },
  {
    id: 'overhead-barbell-tricep-extension',
    nameEn: 'Seated Overhead EZ-Bar / Barbell Triceps Extension',
    nameAr: 'تراي جالس خلف الرأس',
    primaryMuscles: ['triceps'],
    secondaryMuscles: [],
    equipment: 'barbell',
    category: 'isolation',
    difficulty: 'intermediate',
    startingPositionEn: 'Sit upright on a short-back utility bench gripping a barbell or EZ-bar overhead with hands narrower than shoulder-width and elbows pointing forward/upward.',
    startingPositionAr: 'اجلس باستقامة على مقعد داعم ممسكاً بالبار المستقيم أو المتعرج فوق الرأس بقبضة أضيق من الكتفين مع توجيه المرفقين للأمام وللأعلى.',
    instructionsEn: [
      'Keep upper arms locked vertically beside ears and bend solely at the elbows.',
      'Lower the bar smoothly behind your head until triceps achieve a full deep stretch.',
      'Extend elbows cleanly overhead without flaring arms sideways.'
    ],
    instructionsAr: [
      'ثبّت الذراعين العلويين عمودياً بمحاذاة الأذنين وحرّك مفصل المرفق فقط.',
      'أنزل البار ببطء خلف الرأس حتى تشعر بتمدد عميق في الرأس الطويل للترايسبس.',
      'افرد المرفقين للأعلى بسلاسة دون فتحهما للخارج.'
    ],
    breathingEn: 'Inhale on the slow descent behind the head; exhale during elbow extension.',
    breathingAr: 'شهيق أثناء النزول البطيء خلف الرأس، وزفير عند الفرد للأعلى.',
    commonMistakesEn: [
      'Flaring elbows wide outward and turning it into an awkward shoulder press.',
      'Over-arching the lower back when fatigue sets in.'
    ],
    commonMistakesAr: [
      'فتح المرفقين للخارج بشكل مبالغ فيه.',
      'تقوّس أسفل الظهر عند الإجهاد.'
    ],
    safetyEn: 'Warm up elbows thoroughly with light cable pushdowns first before heavy overhead loads.',
    safetyAr: 'سخّن مفاصل المرفق جيداً بالدفع الخفيف بالكابل قبل الأوزان العلوية الثقيلة.',
    alternativeIds: ['overhead-cable-tricep-extension', 'ez-bar-skullcrusher', 'cable-tricep-pushdown']
  },
  {
    id: 'seated-calf-raise',
    nameEn: 'Seated Calf Raise Machine',
    nameAr: 'كولف جالس',
    primaryMuscles: ['calves'],
    secondaryMuscles: [],
    equipment: 'machine',
    category: 'isolation',
    difficulty: 'beginner',
    startingPositionEn: 'Sit on the calf machine placing balls of feet securely on the edge of the lower platform and locking the padded knee lever snugly above knees.',
    startingPositionAr: 'اجلس على جهاز السمانة مع وضع مقدمة القدمين بثبات على الحافة وتثبيت الوسادة فوق الركبتين مباشرة.',
    instructionsEn: [
      'Release the safety catch and lower heels all the way down into a full 1–2 second stretch.',
      'Drive forcefully up onto the balls of your feet targeting full plantar flexion.',
      'Pause briefly at the top squeeze, then descend with deliberate control.'
    ],
    instructionsAr: [
      'حرّر قفل الأمان وأنزل الكعبين للأسفل لأقصى تمدد مع ثبات ثانية إلى ثانيتين.',
      'ادفع بقوة للأعلى على أمشاط القدمين حتى أقصى انقباض.',
      'توقف لحظة في القمة ثم انزل بتحكم وبطء.'
    ],
    breathingEn: 'Inhale on the deep stretch; exhale during the upward drive.',
    breathingAr: 'شهيق أثناء التمدد السفلي، وزفير عند الدفع للأعلى.',
    commonMistakesEn: [
      'Bouncing rapidly out of the bottom using Achilles tendon recoil.',
      'Cutting bottom range of motion short.'
    ],
    commonMistakesAr: [
      'الارتداد السريع من الأسفل بالاعتماد على وتر العرقوب بدلاً من العضلة.',
      'تقليص المدى الحركي في النزول.'
    ],
    safetyEn: 'Secure the safety catch completely before removing your feet.',
    safetyAr: 'تأكد من إعادة قفل الأمان تماماً قبل إبعاد القدمين عن المنصة.',
    alternativeIds: ['standing-calf-raise-machine', 'smith-standing-calf-raise']
  }
];
