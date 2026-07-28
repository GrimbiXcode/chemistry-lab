import type React from 'react'
import ParticleLab from './ParticleLab'
import AtomLab from './AtomLab'
import PeriodicLab from './PeriodicLab'
import BondLab from './BondLab'
import FormulaLab from './FormulaLab'
import EquationLab from './EquationLab'
import PHLab from './PHLab'
import SeparationLab from './SeparationLab'
import EnergyLab from './EnergyLab'
import MolLab from './MolLab'

export type LabComponentType = React.ComponentType<{
  mode: 'explore' | 'exercise'
  onComplete?: () => void
}>

export const LABS: Record<string, LabComponentType> = {
  particles: ParticleLab,
  atom: AtomLab,
  periodic: PeriodicLab,
  bond: BondLab,
  formula: FormulaLab,
  equation: EquationLab,
  ph: PHLab,
  separation: SeparationLab,
  energy: EnergyLab,
  mol: MolLab,
}
