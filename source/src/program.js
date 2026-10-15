/* Training programme: exercise library and the six workouts. These are the starting
   defaults; once the app runs, the plan lives in saved data and can be edited. */

const MUSCLES = {
  chestUpper: 'Upper chest', chestMid: 'Chest', frontDelts: 'Front delts', sideDelts: 'Side delts',
  rearDelts: 'Rear delts', biceps: 'Biceps', triceps: 'Triceps', forearms: 'Forearms', traps: 'Traps',
  lats: 'Lats', upperBack: 'Upper back', lowerBack: 'Lower back', abs: 'Abs', obliques: 'Obliques',
  glutes: 'Glutes', abductors: 'Outer hips', adductors: 'Inner thighs', quads: 'Quads',
  hamstrings: 'Hamstrings', calves: 'Calves',
};

// Muscle groups used for the set breakdown (upper chest and chest count as one)
const GROUP_OF = { chestUpper: 'chest', chestMid: 'chest' };
const GROUP_NAMES = { chest: 'Chest' };
const groupOf = m => GROUP_OF[m] || m;
const groupName = g => GROUP_NAMES[g] || MUSCLES[g];

// key: [name, category, main muscles, supporting muscles, counts toward set totals]
const EXERCISE_DEFAULTS = {
  smithInclinePress: ['Smith incline press', 'push', 'chestUpper frontDelts', 'chestMid triceps'],
  inclineMachinePress: ['Incline machine press', 'push', 'chestUpper frontDelts', 'chestMid triceps'],
  inclineDbPress: ['Incline dumbbell press', 'push', 'chestUpper frontDelts', 'chestMid triceps'],
  inclineBarbellBench: ['Incline bench press', 'push', 'chestUpper frontDelts', 'chestMid triceps'],
  flatMachinePress: ['Flat machine press', 'push', 'chestMid chestUpper', 'frontDelts triceps'],
  smithFlatPress: ['Smith flat press', 'push', 'chestMid chestUpper', 'frontDelts triceps'],
  barbellBench: ['Flat bench press', 'push', 'chestMid chestUpper', 'frontDelts triceps'],
  inclineMachineFly: ['Incline machine fly', 'push', 'chestUpper', 'chestMid frontDelts'],
  inclineDbFly: ['Incline dumbbell fly', 'push', 'chestUpper', 'chestMid frontDelts'],
  flatMachineFly: ['Flat machine fly', 'push', 'chestMid chestUpper', 'frontDelts'],
  flatDbFly: ['Flat dumbbell fly', 'push', 'chestMid chestUpper', 'frontDelts'],
  chestDips: ['Chest dips', 'push', 'chestMid triceps', 'frontDelts'],
  seatedMachineShoulderPress: ['Seated machine shoulder press', 'push', 'frontDelts sideDelts', 'triceps'],
  dbShoulderPress: ['Dumbbell shoulder press', 'push', 'frontDelts sideDelts', 'triceps'],
  militaryPress: ['Military press', 'push', 'frontDelts sideDelts', 'triceps'],
  standingMachineShoulderPress: ['Standing machine shoulder press', 'push', 'frontDelts sideDelts', 'triceps'],
  cableLateral: ['Single-arm cable lateral raise', 'push', 'sideDelts', 'traps'],
  seatedDbLateral: ['Seated dumbbell lateral raise', 'push', 'sideDelts', 'traps'],
  overheadCableTriceps: ['Overhead cable triceps extension', 'push', 'triceps', ''],
  overheadDbTriceps: ['Overhead dumbbell triceps extension', 'push', 'triceps', ''],
  vbarPushdown: ['V-bar triceps pushdown', 'push', 'triceps', ''],

  machineShrug: ['Machine shrugs', 'pull', 'traps', '', false],
  dbShrug: ['Dumbbell shrugs', 'pull', 'traps', 'forearms', false],
  overheadPulldown: ['Machine overhead pull-down', 'pull', 'lats', 'biceps upperBack'],
  widePulldown: ['Wide-grip pull-down', 'pull', 'lats', 'upperBack biceps'],
  closeGripPulldownNeutral: ['Close-grip pull-down, neutral grip', 'pull', 'lats', 'biceps upperBack'],
  closeGripPulldownOverhand: ['Close-grip pull-down, overhand', 'pull', 'lats', 'biceps upperBack'],
  lowRowOverhand: ['Low machine row, overhand', 'pull', 'upperBack lats', 'rearDelts biceps'],
  lowRowNeutral: ['Low machine row, neutral grip', 'pull', 'lats upperBack', 'biceps'],
  chestSupportedRow: ['Chest-supported wide-grip row', 'pull', 'upperBack rearDelts', 'lats biceps'],
  highRow: ['High row machine', 'pull', 'lats upperBack', 'rearDelts biceps'],
  seatedCableRow: ['Seated close-grip cable row', 'pull', 'upperBack lats', 'biceps rearDelts'],
  tbarRow: ['T-bar row', 'pull', 'upperBack lats', 'rearDelts biceps lowerBack'],
  rearDeltDbFly: ['Rear delt dumbbell fly', 'pull', 'rearDelts', 'upperBack'],
  rearCableCrossover: ['Rear cable crossover', 'pull', 'rearDelts', 'upperBack'],
  singleArmRearFly: ['Single-arm cable reverse fly', 'pull', 'rearDelts', 'upperBack'],
  reverseMachineFly: ['Reverse machine fly', 'pull', 'rearDelts', 'upperBack'],
  facePull: ['Face pulls', 'pull', 'rearDelts upperBack', 'traps'],
  machinePreacher: ['Machine preacher curl', 'pull', 'biceps', 'forearms'],
  dbPreacher: ['Dumbbell preacher curl', 'pull', 'biceps', 'forearms'],
  armBlasterCurl: ['Arm blaster curl', 'pull', 'biceps', 'forearms'],
  altDbCurl: ['Alternating dumbbell curl', 'pull', 'biceps', 'forearms'],
  hammerCurl: ['Hammer curl', 'pull', 'biceps forearms', ''],
  wristCurl: ['Wrist curl, palms up', 'pull', 'forearms', '', false],
  reverseWristCurl: ['Reverse wrist curl, palms down', 'pull', 'forearms', '', false],

  standingCalf: ['Standing calf raise', 'legs', 'calves', '', false],
  seatedCalf: ['Seated calf raise', 'legs', 'calves', '', false],
  sldl: ['Dumbbell stiff-leg deadlift', 'legs', 'hamstrings glutes', 'lowerBack'],
  adduction: ['Adduction machine', 'legs', 'adductors', ''],
  abduction: ['Abduction machine', 'legs', 'abductors', 'glutes'],
  machineSquat: ['Machine squat', 'legs', 'quads', 'glutes adductors'],
  legPress: ['Leg press', 'legs', 'quads', 'glutes adductors'],
  legExtension: ['Leg extension', 'legs', 'quads', ''],
  hipThrust: ['Hip thrust machine', 'legs', 'glutes', 'hamstrings'],
  barbellSquat: ['Barbell squat', 'legs', 'quads glutes', 'adductors lowerBack'],
  hackSquat: ['Hack squat', 'legs', 'quads', 'glutes'],
  machineLegCurl: ['Machine leg curl', 'legs', 'hamstrings', 'calves'],
  lyingLegCurl: ['Lying leg curl', 'legs', 'hamstrings', 'calves'],

  declineSitup: ['Decline sit-up', 'abs', 'abs obliques', '', false],
  crunch: ['Crunches', 'abs', 'abs', '', false],
  cableCrunch: ['Cable crunches', 'abs', 'abs', 'obliques', false],
  legRaise: ['Leg raises', 'abs', 'abs', '', false],
};

const WORKOUT_DEFAULTS = [
  { id: 'pushA', name: 'Push A', cat: 'push', abs: true },
  { id: 'pullA', name: 'Pull A', cat: 'pull', abs: true },
  { id: 'legsA', name: 'Legs A', cat: 'legs', abs: false },
  { id: 'pushB', name: 'Push B', cat: 'push', abs: true },
  { id: 'pullB', name: 'Pull B', cat: 'pull', abs: true },
  { id: 'legsB', name: 'Legs B', cat: 'legs', abs: false },
];

// [slot id, name, exercise key or [[option label, exercise key], ...], sets, note, superset group]
// sets: a number of working sets, or 'N+d' for N working sets followed by a drop set
const PROGRAM_DEFAULTS = {
  pushA: [
    ['inclinePress', 'Incline press', [['Smith 30°', 'smithInclinePress'], ['Machine', 'inclineMachinePress'], ['Dumbbells', 'inclineDbPress']], 3, '30° incline on the Smith'],
    ['flatPress', 'Flat press', [['Machine', 'flatMachinePress'], ['Smith', 'smithFlatPress'], ['Barbell', 'barbellBench']], 3],
    ['inclineFly', 'Incline chest fly', [['Machine', 'inclineMachineFly'], ['Dumbbells', 'inclineDbFly']], 3],
    ['shoulderPress', 'Shoulder press', [['Seated machine', 'seatedMachineShoulderPress'], ['Dumbbells', 'dbShoulderPress'], ['Military press', 'militaryPress']], 3],
    ['cableLateral', 'Single-arm cable lateral raise', 'cableLateral', 4, 'Lean inwards'],
    ['overheadTriceps', 'Overhead triceps extension', [['Cable V-bar', 'overheadCableTriceps'], ['Dumbbell', 'overheadDbTriceps']], 3],
    ['pushdown', 'V-bar triceps pushdown', 'vbarPushdown', 2],
  ],
  pullA: [
    ['shrugs', 'Machine shrugs', 'machineShrug', 4],
    ['overheadPulldown', 'Machine overhead pull-down', 'overheadPulldown', 3],
    ['widePulldown', 'Wide-grip pull-down', 'widePulldown', 3],
    ['lowRow', 'Low machine row', [['Overhand', 'lowRowOverhand'], ['Neutral grip', 'lowRowNeutral']], 3],
    ['chestSupportedRow', 'Chest-supported wide-grip row', 'chestSupportedRow', 3],
    ['highRow', 'High row machine', 'highRow', 2],
    ['rearDeltFly', 'Rear delt fly', [['Dumbbells', 'rearDeltDbFly'], ['Cable crossover', 'rearCableCrossover'], ['Single-arm cable', 'singleArmRearFly']], 3],
    ['facePull', 'Face pulls', 'facePull', 3],
    ['machinePreacher', 'Machine preacher curl', 'machinePreacher', 4],
    ['altCurl', 'Alternating dumbbell curl', 'altDbCurl', 3],
  ],
  legsA: [
    ['standingCalf', 'Standing calf raise', 'standingCalf', 4],
    ['sldl', 'Dumbbell stiff-leg deadlift', 'sldl', 3],
    ['adduction', 'Adduction machine', 'adduction', 3, 'Knees inwards'],
    ['machineSquat', 'Machine squat', 'machineSquat', 3, 'Close foot stance'],
    ['legPress', 'Leg press', 'legPress', 3, 'The one next to the window'],
    ['legExtension', 'Leg extension', 'legExtension', 3],
  ],
  pushB: [
    ['seatedDbLateral', 'Seated dumbbell lateral raise', 'seatedDbLateral', '4+d', 'Drop set straight after set 4'],
    ['seatedShoulderPress', 'Seated machine shoulder press', 'seatedMachineShoulderPress', 3],
    ['standingShoulderPress', 'Standing machine shoulder press', 'standingMachineShoulderPress', '3+d', 'Drop set on the last set'],
    ['inclineBench', 'Incline bench press', [['Barbell', 'inclineBarbellBench'], ['Smith', 'smithInclinePress']], 3],
    ['flatMachinePress', 'Flat machine press', 'flatMachinePress', 3],
    ['dips', 'Chest dips', 'chestDips', 3],
    ['flatFly', 'Flat chest fly', [['Machine', 'flatMachineFly'], ['Dumbbells', 'flatDbFly']], 3],
    ['overheadDbTriceps', 'Overhead dumbbell triceps extension', 'overheadDbTriceps', 3],
    ['pushdown', 'V-bar triceps pushdown', 'vbarPushdown', 3],
  ],
  pullB: [
    ['dbShrugs', 'Dumbbell shrugs', 'dbShrug', 3],
    ['closeGripPulldown', 'Close-grip pull-down', [['Neutral grip', 'closeGripPulldownNeutral'], ['Overhand', 'closeGripPulldownOverhand']], 3],
    ['highRow', 'High row machine', 'highRow', 3],
    ['seatedCableRow', 'Seated close-grip cable row', 'seatedCableRow', 3, 'V-grip'],
    ['tbarRow', 'T-bar row', 'tbarRow', 3],
    ['reverseFly', 'Reverse fly', [['Machine', 'reverseMachineFly'], ['Single-arm cable', 'singleArmRearFly']], 3],
    ['preacherCurl', 'Preacher curl', [['Dumbbell', 'dbPreacher'], ['Arm blaster', 'armBlasterCurl']], 3],
    ['hammerCurl', 'Hammer curl', 'hammerCurl', 2],
    ['wristCurl', 'Wrist curl, palms up', 'wristCurl', 3, '', 'wrist'],
    ['reverseWristCurl', 'Reverse wrist curl, palms down', 'reverseWristCurl', 3, '', 'wrist'],
  ],
  legsB: [
    ['seatedCalf', 'Seated calf raise', 'seatedCalf', 4],
    ['hipThrust', 'Hip thrust machine', 'hipThrust', 3],
    ['abduction', 'Abduction machine', 'abduction', 3, 'Push outwards'],
    ['barbellSquat', 'Barbell squat', 'barbellSquat', 3],
    ['hackSquat', 'Hack squat', 'hackSquat', 3, 'Close stance'],
    ['legCurl', 'Leg curl', [['Machine', 'machineLegCurl'], ['Lying', 'lyingLegCurl']], 3],
    ['legExtension', 'Leg extension', 'legExtension', 2, 'Both sets to failure'],
  ],
  abs: [
    ['declineSitup', 'Decline sit-up', 'declineSitup', 3, 'Elbow to knee'],
    ['crunch', 'Crunches', 'crunch', 3],
    ['cableCrunch', 'Cable crunches', 'cableCrunch', 3],
    ['legRaise', 'Leg raises', 'legRaise', 3],
  ],
};
