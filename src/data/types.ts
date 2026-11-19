/** A star of a constellation, in engraving units (the engraving spans -8…8 on both axes, y up). */
export type Point = readonly [x: number, y: number];

/** A stroke between two stars, as indices into `Figure.points`. */
export type Edge = readonly [from: number, to: number];

export interface Figure {
  points: readonly Point[];
  edges: readonly Edge[];
}

export type ChapterId = 'laurentius' | 'turin' | 'stack' | 'siply' | 'book-relay' | 'tavern' | 'climb' | 'contact';

/** A link shown in the chart sheet: visible label and absolute (or mailto:) URL. */
export type SheetLink = readonly [label: string, href: string];

/** The page of the chart sheet (the dialog opened by "Open the chart"). */
export interface Sheet {
  title: string;
  role: string;
  when: string;
  portrait?: boolean;
  observations?: readonly string[];
  instruments?: readonly string[];
  instrumentGroups?: readonly (readonly [family: string, tools: string])[];
  jobs?: readonly (readonly [role: string, period: string, text: string])[];
  links?: readonly SheetLink[];
}

export interface Chapter {
  id: ChapterId;
  /** Latin constellation name. */
  name: string;
  subtitle: string;
  /** Roman numeral (or ✦) shown in kickers, medallions and the moon navigation. */
  numeral: string;
  /** Which side of the screen the constellation sits on: 1 = right of the text card, -1 = left. */
  side: 1 | -1;
  /** Vertical position of the name label under the constellation in the 3D sky. */
  skyLabelY: number;
  /** Ring drawn around the engraving, or null for none. */
  frame: { radius: number; center?: readonly [x: number, y: number] } | null;
  /** Per-chapter tweaks of the label layout in the full map. */
  fullMap?: { haloRadius?: number; titleY?: number; subtitleY?: number };
  /** Notes shown when hovering a star, keyed by star index. */
  starNotes: Readonly<Record<number, string>>;
  sheet: Sheet;
  figure: Figure;
}
