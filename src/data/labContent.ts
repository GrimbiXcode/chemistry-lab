// Sprachabhängige Inhalte der Labore – getrennt von den Komponenten,
// damit sie per Sprachdatei übersetzt werden können.

export const PH_SUBSTANCES = [
  { id: 'magensaeure', ph: 1.5 },
  { id: 'zitronensaft', ph: 2.4 },
  { id: 'cola', ph: 2.8 },
  { id: 'essig', ph: 3.0 },
  { id: 'regenwasser', ph: 5.6 },
  { id: 'milch', ph: 6.6 },
  { id: 'wasser_rein', ph: 7.0 },
  { id: 'blut', ph: 7.4 },
  { id: 'backpulver', ph: 8.4 },
  { id: 'seife', ph: 10.0 },
  { id: 'ammoniak', ph: 11.5 },
  { id: 'natronlauge', ph: 14.0 },
] as const

export type PhSubstanceId = (typeof PH_SUBSTANCES)[number]['id']

export const PH_SORT_TASKS = [
  { id: 'zitronensaft' as PhSubstanceId, cat: 'sauer' as const },
  { id: 'wasser_rein' as PhSubstanceId, cat: 'neutral' as const },
  { id: 'seife' as PhSubstanceId, cat: 'basisch' as const },
  { id: 'essig' as PhSubstanceId, cat: 'sauer' as const },
  { id: 'natronlauge' as PhSubstanceId, cat: 'basisch' as const },
]

export const ATOM_TASKS = [
  { z: 2, mass: 4, tipId: 'atomtip1' },
  { z: 6, mass: 12, tipId: 'atomtip2' },
  { z: 11, mass: 23, tipId: 'atomtip3' },
] as const

export const HUNTS = [
  { clueId: 'hunt1', answer: 10 },
  { clueId: 'hunt2', answer: 11 },
  { clueId: 'hunt3', answer: 17 },
] as const

export const NA_STEP_IDS = ['nastep1', 'nastep2', 'nastep3', 'nastep4'] as const
export const H2_TEXT_IDS = ['h2step1', 'h2step2', 'h2step3'] as const

export const BOND_PAIRS = [
  { aId: 'el_na', bId: 'el_cl', typesId: 'met_nonmet', answer: 'ion' as const, whyId: 'bondwhy1' },
  { aId: 'el_h', bId: 'el_h', typesId: 'nonmet_nonmet', answer: 'atom' as const, whyId: 'bondwhy2' },
  { aId: 'el_mg', bId: 'el_o', typesId: 'met_nonmet', answer: 'ion' as const, whyId: 'bondwhy3' },
  { aId: 'el_c', bId: 'el_o', typesId: 'nonmet_nonmet', answer: 'atom' as const, whyId: 'bondwhy4' },
] as const

export const FORMULA_EXAMPLES = [
  { formula: 'H₂O', nameId: 'wasser', descId: 'fx1' },
  { formula: 'CO₂', nameId: 'co2', descId: 'fx2' },
  { formula: 'NH₃', nameId: 'ammoniak', descId: 'fx3' },
  { formula: 'C₆H₁₂O₆', nameId: 'traubenzucker', descId: 'fx4' },
  { formula: 'Ca(OH)₂', nameId: 'calciumhydroxid', descId: 'fx5' },
] as const

export const FORMULA_TASKS = [
  {
    formula: 'H₂SO₄',
    nameId: 'schwefelsaeure',
    parts: [
      { el: 'H', count: 2 },
      { el: 'S', count: 1 },
      { el: 'O', count: 4 },
    ],
  },
  {
    formula: 'C₆H₁₂O₆',
    nameId: 'traubenzucker',
    parts: [
      { el: 'C', count: 6 },
      { el: 'H', count: 12 },
      { el: 'O', count: 6 },
    ],
  },
  {
    formula: 'Ca(OH)₂',
    nameId: 'calciumhydroxid',
    parts: [
      { el: 'Ca', count: 1 },
      { el: 'O', count: 2 },
      { el: 'H', count: 2 },
    ],
  },
] as const

export interface MolDef { f: string; atoms: Record<string, number> }
export interface EqDef { nameId: string; left: MolDef[]; right: MolDef[]; solution: number[] }

export const EQUATIONS: EqDef[] = [
  {
    nameId: 'eq1',
    left: [{ f: 'H₂', atoms: { H: 2 } }, { f: 'O₂', atoms: { O: 2 } }],
    right: [{ f: 'H₂O', atoms: { H: 2, O: 1 } }],
    solution: [2, 1, 2],
  },
  {
    nameId: 'eq2',
    left: [{ f: 'CH₄', atoms: { C: 1, H: 4 } }, { f: 'O₂', atoms: { O: 2 } }],
    right: [{ f: 'CO₂', atoms: { C: 1, O: 2 } }, { f: 'H₂O', atoms: { H: 2, O: 1 } }],
    solution: [1, 2, 1, 2],
  },
  {
    nameId: 'eq3',
    left: [{ f: 'Fe', atoms: { Fe: 1 } }, { f: 'O₂', atoms: { O: 2 } }],
    right: [{ f: 'Fe₂O₃', atoms: { Fe: 2, O: 3 } }],
    solution: [4, 3, 2],
  },
]

export type Method = 'filtrieren' | 'verdampfen' | 'magnet' | 'destillieren'
export const METHODS: Method[] = ['filtrieren', 'verdampfen', 'magnet', 'destillieren']

export const MIXTURES: { nameId: string; method: Method; noteId: string }[] = [
  { nameId: 'mix1', method: 'filtrieren', noteId: 'mixnote1' },
  { nameId: 'mix2', method: 'verdampfen', noteId: 'mixnote2' },
  { nameId: 'mix3', method: 'magnet', noteId: 'mixnote3' },
  { nameId: 'mix4', method: 'destillieren', noteId: 'mixnote4' },
]

export const FACTORS = [
  { key: 'temp', nameId: 'fak_temp', optionIds: ['opt_kalt', 'opt_warm', 'opt_heiss'], mult: [1, 2, 4] },
  { key: 'conc', nameId: 'fak_konz', optionIds: ['opt_verduennt', 'opt_mittel', 'opt_konzentriert'], mult: [1, 2, 4] },
  { key: 'size', nameId: 'fak_zerk', optionIds: ['opt_brocken', 'opt_stuecke', 'opt_pulver'], mult: [1, 2, 4] },
] as const

export interface MolSubstance { nameId: string; formula: string; breakdown: string; M: number }
export const MOL_SUBSTANCES: MolSubstance[] = [
  { nameId: 'wasser', formula: 'H₂O', breakdown: '2 × 1 + 16', M: 18 },
  { nameId: 'co2', formula: 'CO₂', breakdown: '12 + 2 × 16', M: 44 },
  { nameId: 'methan', formula: 'CH₄', breakdown: '12 + 4 × 1', M: 16 },
  { nameId: 'sauerstoff', formula: 'O₂', breakdown: '2 × 16', M: 32 },
  { nameId: 'stickstoff', formula: 'N₂', breakdown: '2 × 14', M: 28 },
  { nameId: 'kochsalz', formula: 'NaCl', breakdown: '23 + 35,5', M: 58.5 },
  { nameId: 'traubenzucker', formula: 'C₆H₁₂O₆', breakdown: '6 × 12 + 12 × 1 + 6 × 16', M: 180 },
]

export const MOL_TASKS = [
  { qId: 'molq1', unit: 'g', answer: 9, hintId: 'molhint1' },
  { qId: 'molq2', unit: 'mol', answer: 1, hintId: 'molhint2' },
  { qId: 'molq3', unit: 'g', answer: 32, hintId: 'molhint3' },
  { qId: 'molq4', unit: 'mol', answer: 1, hintId: 'molhint4' },
] as const
