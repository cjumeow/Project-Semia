import type { DeleteButtonStyle } from './deleteButtonTypes';

/** A — Deep indigo (reference image, darker). */
export const styleA: DeleteButtonStyle = {
  id: 'A',
  label: 'Deep indigo',
  description:
    'Darker than the reference (#352F64). Pill control, soft violet shadow — primary recommendation.',
  buttonClass: 'bg-[#1a1829] hover:bg-[#221f35]',
  shadowClass: 'shadow-[0_6px_20px_rgba(26,24,41,0.45)]',
};

/** B — Ink stone — neutral, sits on warm SEMIA canvas. */
export const styleB: DeleteButtonStyle = {
  id: 'B',
  label: 'Ink stone',
  description: 'Near-black stone with warm undertone. Less purple, more archival.',
  buttonClass: 'bg-[#1c1917] hover:bg-[#292524]',
  shadowClass: 'shadow-[0_6px_18px_rgba(28,25,23,0.35)]',
};

/** C — Forest night — ties to SEMIA accent green. */
export const styleC: DeleteButtonStyle = {
  id: 'C',
  label: 'Forest night',
  description: 'Deep forest ink — destructive but on-brand with accent palette.',
  buttonClass: 'bg-[#152019] hover:bg-[#1c2b22]',
  shadowClass: 'shadow-[0_6px_18px_rgba(21,32,25,0.4)]',
};

export const DELETE_STYLES = [styleA, styleB, styleC] as const;
