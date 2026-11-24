import { Language, MovementPattern, MuscleGroup } from '../types/ironlog';

export interface MuscleAnatomyInfo {
  id: MuscleGroup;
  anatomicalEn: string;
  anatomicalAr: string;
  commonEn: string;
  commonAr: string;
  subHeadsEn: string;
  subHeadsAr: string;
  locationEn: string;
  locationAr: string;
  functionEn: string;
  functionAr: string;
}

export const ANATOMY_MUSCLES: Record<MuscleGroup, MuscleAnatomyInfo> = {
  chest: {
    id: 'chest',
    anatomicalEn: 'Pectoralis Major & Minor',
    anatomicalAr: 'العضلة الصدرية الكبرى والصغرى',
    commonEn: 'Chest',
    commonAr: 'الصدر',
    subHeadsEn: 'Clavicular (upper), Sternal (mid), Costal (lower)',
    subHeadsAr: 'الألياف الترقوية (العلوية)، القصية (الوسطى)، والضلعية (السفلية)',
    locationEn: 'Broad fan-shaped musculature spanning the anterior ribcage from sternum and clavicle to the upper humerus.',
    locationAr: 'عضلة عريضة تغطي الجزء الأمامي من القفص الصدري، تمتد من الترقوة وعظمة القص إلى أعلى عظمة العضد.',
    functionEn: 'Horizontal shoulder adduction, shoulder flexion (clavicular head), and internal rotation of the upper arm.',
    functionAr: 'تقريب الذراع أفقياً أمام الجسم، ثني الكتف للأمام (الجزء العلوي)، وتدوير العضد للداخل.',
  },
  back: {
    id: 'back',
    anatomicalEn: 'Latissimus Dorsi, Trapezius, Rhomboids & Erector Spinae',
    anatomicalAr: 'العضلة الظهرية العريضة، الترابيس، المعينات، وباسطات العمود الفقري',
    commonEn: 'Back',
    commonAr: 'الظهر',
    subHeadsEn: 'Lats, Upper/Mid/Lower Traps, Rhomboids, Teres Major, Spinal Erectors',
    subHeadsAr: 'الظهرية العريضة (المجنص)، الترابيس العلوي والمتوسط والسفلي، المعينات، وناصبات الفقار',
    locationEn: 'Multi-layered posterior torso complex spanning from the base of the skull and spine to the iliac crest and humerus.',
    locationAr: 'مجموعة عضلية متعددة الطبقات تغطي كامل الجهة الخلفية للجذع من الرقبة والكتفين وحتى أسفل الظهر والحوض.',
    functionEn: 'Shoulder extension and adduction (pulling), scapular retraction and depression, and spinal extension/bracing.',
    functionAr: 'سحب الذراعين للأسفل وللخلف، تقريب وخفض لوحي الكتف، وتثبيت وبسط العمود الفقري.',
  },
  shoulders: {
    id: 'shoulders',
    anatomicalEn: 'Deltoideus (Anterior, Lateral, Posterior Heads) & Rotator Cuff',
    anatomicalAr: 'العضلة الدالية (الأمامية، الجانبية، الخلفية) وعضلات الكف المدورة',
    commonEn: 'Shoulders',
    commonAr: 'الأكتاف',
    subHeadsEn: 'Anterior, Lateral (Acromial), Posterior (Spinal) heads',
    subHeadsAr: 'الرأس الأمامي، الرأس الجانبي (الأخرمي)، والرأس الخلفي',
    locationEn: 'Three-headed cap enveloping the glenohumeral shoulder joint from clavicle and acromion to the deltoid tuberosity.',
    locationAr: 'عضلة ثلاثية الرؤوس تغلف مفصل الكتف وتربط الترقوة ولوح الكتف بأعلى الذراع.',
    functionEn: 'Arm abduction (lateral head), shoulder flexion (anterior head), horizontal abduction/external rotation support (posterior head).',
    functionAr: 'رفع الذراع جانبياً (الرأس الجانبي)، الدفع للأمام والأعلى (الأمامي)، والسحب للخلف وتوازن المفصل (الخلفي).',
  },
  biceps: {
    id: 'biceps',
    anatomicalEn: 'Biceps Brachii & Brachialis',
    anatomicalAr: 'العضلة ذات الرأسين العضدية والعضدية العميقة (البراكياليس)',
    commonEn: 'Biceps',
    commonAr: 'البايسبس',
    subHeadsEn: 'Long Head (outer peak), Short Head (inner fullness), Brachialis underneath',
    subHeadsAr: 'الرأس الطويل (الخارجي)، الرأس القصير (الداخلي)، والعضلة العضدية العميقة',
    locationEn: 'Anterior upper arm spanning from the scapula across both shoulder and elbow joints to the radius.',
    locationAr: 'تقع في الجهة الأمامية للعضد، وتمتد من لوح الكتف عبر مفصلي الكتف والمرفق إلى الساعد.',
    functionEn: 'Elbow flexion, forearm supination (turning palm upward), and secondary shoulder flexion.',
    functionAr: 'ثني مفصل المرفق، تدوير راحة اليد للأعلى، والمساعدة البسيطة في رفع الذراع للأمام.',
  },
  triceps: {
    id: 'triceps',
    anatomicalEn: 'Triceps Brachii',
    anatomicalAr: 'العضلة ثلاثية الرؤوس العضدية',
    commonEn: 'Triceps',
    commonAr: 'الترايسبس',
    subHeadsEn: 'Long Head (crosses shoulder), Lateral Head (outer horseshoe), Medial Head',
    subHeadsAr: 'الرأس الطويل، الرأس الجانبي الخارجي، والرأس الإنسي العميق',
    locationEn: 'Occupies ~60% of upper arm mass along the posterior humerus, inserting at the ulna olecranon.',
    locationAr: 'تشكل الجزء الأكبر من كتلة العضد في الجهة الخلفية للذراع وتمتد من لوح الكتف والعضد حتى المرفق.',
    functionEn: 'Primary elbow extension (straightening the arm) and shoulder extension assistance via the long head.',
    functionAr: 'بسط وفرد مفصل المرفق في جميع تمارين الدفع وعزل الذراع الخلفي.',
  },
  forearms: {
    id: 'forearms',
    anatomicalEn: 'Brachioradialis, Wrist Flexors & Extensors',
    anatomicalAr: 'العضدية الكعبرية وعضلات قابضات وباسطات الساعد',
    commonEn: 'Forearms',
    commonAr: 'السواعد',
    subHeadsEn: 'Brachioradialis, Anterior Flexor group, Posterior Extensor group',
    subHeadsAr: 'العضدية الكعبرية، قابضات المعصم والأصابع، وباسطات المعصم',
    locationEn: 'Lower arm musculature between the elbow and wrist controlling hand grip and wrist position.',
    locationAr: 'تغطي المسافة بين المرفق والمعصم وتتحكم في قوة القبضة واستقرار المعصم.',
    functionEn: 'Grip strength, wrist flexion/extension, forearm pronation/supination, and neutral-grip elbow flexion.',
    functionAr: 'تأمين القبضة القوية على البار والدامبل، ثني ومد المعصم، ودعم تمارين السحب والمطرقة.',
  },
  quadriceps: {
    id: 'quadriceps',
    anatomicalEn: 'Quadriceps Femoris',
    anatomicalAr: 'عضلة الفخذ رباعية الرؤوس',
    commonEn: 'Quadriceps',
    commonAr: 'الفخذ الأمامي',
    subHeadsEn: 'Rectus Femoris, Vastus Lateralis, Vastus Medialis (VMO), Vastus Intermedius',
    subHeadsAr: 'المستقيمة الفخذية، المتسعة الوحشية (الخارجية)، المتسعة الإنسية، والوسيطة',
    locationEn: 'Large four-headed anterior thigh group covering the femur down to the patellar tendon.',
    locationAr: 'أربع عضلات ضخمة تغطي الجهة الأمامية للفخذ وتصل إلى رضفة الركبة.',
    functionEn: 'Primary knee extension in squats, lunges, and leg extensions; rectus femoris also assists hip flexion.',
    functionAr: 'فرد مفصل الركبة في القرفصاء والدفع والرفرفة الأمامية، مع مساهمة في ثني الورك.',
  },
  hamstrings: {
    id: 'hamstrings',
    anatomicalEn: 'Biceps Femoris, Semitendinosus & Semimembranosus',
    anatomicalAr: 'العضلة ذات الرأسين الفخذية، نصف الوترية، ونصف الغشائية',
    commonEn: 'Hamstrings',
    commonAr: 'الفخذ الخلفي',
    subHeadsEn: 'Biceps Femoris (long/short heads), Semitendinosus, Semimembranosus',
    subHeadsAr: 'ثنائية الرؤوس الفخذية، نصف الوترية، ونصف الغشائية',
    locationEn: 'Posterior thigh muscles running from the ischial tuberosity across hip and knee joints to the tibia/fibula.',
    locationAr: 'تقع في الجهة الخلفية للفخذ وتربط عظمة الحوض بالساق عبر مفصلي الورك والركبة.',
    functionEn: 'Hip extension (hinging movements like RDL) and knee flexion (leg curls).',
    functionAr: 'بسط مفصل الورك في تمارين الديدلفت والانحناء، وثني مفصل الركبة في أجهزة الكيرل.',
  },
  glutes: {
    id: 'glutes',
    anatomicalEn: 'Gluteus Maximus, Medius & Minimus',
    anatomicalAr: 'عضلات الألوية الكبرى والوسطى والصغرى',
    commonEn: 'Glutes',
    commonAr: 'الألوية',
    subHeadsEn: 'Gluteus Maximus (upper & lower fibers), Gluteus Medius, Gluteus Minimus',
    subHeadsAr: 'الألوية الكبرى (العلوية والسفلية)، الألوية الوسطى (لتوازن الحوض)، والصغرى',
    locationEn: 'Posterior and lateral pelvic musculature connecting the pelvis and sacrum to the femur.',
    locationAr: 'تغطي الجهة الخلفية والجانبية للحوض وتتحكم في قوة دفع الورك واستقراره.',
    functionEn: 'Powerful hip extension, external hip rotation, and frontal-plane pelvic stabilization during squats/split squats.',
    functionAr: 'مد ودفع الورك للأمام، تدوير الفخذ للخارج، وتثبيت الحوض في الحركات الثنائية والأحادية.',
  },
  calves: {
    id: 'calves',
    anatomicalEn: 'Gastrocnemius & Soleus',
    anatomicalAr: 'عضلة السمانة التوأمية والنعلية',
    commonEn: 'Calves',
    commonAr: 'السمانة',
    subHeadsEn: 'Gastrocnemius (biarticular medial/lateral heads) & Soleus (deep monoarticular)',
    subHeadsAr: 'العضلة التوأمية (برأسيها الداخلي والخارجي) والعضلة النعلية العميقة',
    locationEn: 'Posterior lower leg converging into the Achilles tendon at the calcaneus (heel).',
    locationAr: 'الجهة الخلفية للساق السفلى وتلتقي في وتر العرقوب المتصل بالكعب.',
    functionEn: 'Ankle plantarflexion (lifting onto toes); gastrocnemius dominates with straight knees, soleus with bent knees.',
    functionAr: 'دفع مقدمة القدم للأسفل (الوقوف على الأصابع)؛ التوأمية تبرز مع استقامة الركبة والنعلية مع ثنيها.',
  },
  abdominals: {
    id: 'abdominals',
    anatomicalEn: 'Rectus Abdominis, Obliques & Transverse Abdominis',
    anatomicalAr: 'المستقيمة البطنية، المائلتان، والمستعرضة البطنية',
    commonEn: 'Abdominals & Core',
    commonAr: 'البطن والجذع',
    subHeadsEn: 'Rectus Abdominis, External/Internal Obliques, Transverse Abdominis',
    subHeadsAr: 'عضلة البطن المستقيمة، العضلات المائلة الجانبية، والعضلة المستعرضة العميقة',
    locationEn: 'Anterior and lateral abdominal wall wrapping between lower ribs and pelvis.',
    locationAr: 'تغطي جدار البطن الأمامي والجانبي بين الأضلاع السفلية والحوض.',
    functionEn: 'Spinal flexion, anti-rotation/anti-extension core bracing, and intra-abdominal pressure during compound lifts.',
    functionAr: 'ثني العمود الفقري للأمام، مقاومة الدوران والتقوّس، وتوليد ضغط داخلي يحمي الظهر أثناء الرفع.',
  },
};

export function explainMuscleRole(
  muscle: MuscleGroup,
  role: 'primary' | 'secondary' | 'stabilizer' | 'neutral',
  pattern: MovementPattern,
  lang: Language
): string {
  const info = ANATOMY_MUSCLES[muscle];
  if (role === 'neutral') {
    return lang === 'ar'
      ? `مرجع تشريحي عام: لا تتحمّل العبء الأساسي في هذا التمرين؛ وظيفتها الحيوية هي ${info.functionAr}`
      : `Reference anatomy (non-targeted here): primary joint function is ${info.functionEn.charAt(0).toLowerCase() + info.functionEn.slice(1)}`;
  }
  if (role === 'primary') {
    if (lang === 'ar') {
      return `عضلة أساسية محرّكة: تتولى العبء الميكانيكي الأكبر في هذا التمرين عبر ${info.functionAr.replace(/\.$/, '')}.`;
    }
    return `Primary mover: generates the main force through ${info.functionEn.charAt(0).toLowerCase() + info.functionEn.slice(1)}`;
  }
  if (role === 'secondary') {
    if (lang === 'ar') {
      return `عضلة مساعدة (Synergist): تسهم في إتمام المسار الحركي ودفع المقاومة مع العضلة الأساسية.`;
    }
    return `Secondary synergist: assists the primary target to complete joint torque along the movement path.`;
  }

  // Stabilizer explanations contextualized by pattern
  const isBraceCore =
    muscle === 'abdominals' &&
    ['squat', 'hinge', 'overhead_press', 'row', 'bench_press', 'lunge'].includes(pattern);
  if (isBraceCore) {
    return lang === 'ar'
      ? 'مثبّت جوهري: يحافظ على ضغط الجذع الداخلي ويمنع تقوّس أو التواء العمود الفقري تحت الحمل.'
      : 'Core stabilizer: maintains intra-abdominal pressure and keeps the spine rigid against shear or flexion.';
  }
  if (muscle === 'forearms') {
    return lang === 'ar'
      ? 'مثبّت للقبضة والمعصم: ينقل القوة بين اليد والأداة ويحافظ على استقامة المفصل.'
      : 'Grip & wrist stabilizer: secures the bar/handle and aligns wrist force transmission.';
  }
  return lang === 'ar'
    ? 'عضلة مثبّتة: تنقبض أيزومترياً للحفاظ على استقرار المفاصل المجاورة طوال التكرار.'
    : 'Joint stabilizer: contracts isometrically to keep adjacent joints aligned while prime movers work.';
}
