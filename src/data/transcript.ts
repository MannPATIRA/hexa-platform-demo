export interface TranscriptMessage {
  speaker: string;
  role: "customer" | "sales";
  text: string;
  appearAfterSeconds: number;
  highlights?: string[];
}

export const transcript: TranscriptMessage[] = [
  {
    speaker: "David Patterson",
    role: "customer",
    text: "James, it's David from Sheffield Precision. Need to place a few orders — 500 M8 A2-70 hex bolts to Attercliffe by March 14th.",
    appearAfterSeconds: 0,
    highlights: ["500", "M8 A2-70 hex bolts", "Attercliffe", "March 14th"],
  },
  {
    speaker: "James Morrison",
    role: "sales",
    text: "Sure, those run £0.38 to £0.42 per unit. What else?",
    appearAfterSeconds: 3,
    highlights: ["£0.38", "£0.42 per unit"],
  },
  {
    speaker: "David Patterson",
    role: "customer",
    text: "200 metres EN24T steel bar, 50mm diameter, 3.1 certs. Rotherham, March 28th.",
    appearAfterSeconds: 5,
    highlights: ["200 metres", "EN24T steel bar", "50mm diameter", "3.1 certs", "Rotherham", "March 28th"],
  },
  {
    speaker: "James Morrison",
    role: "sales",
    text: "About £28.50 per metre. Can do. Anything else?",
    appearAfterSeconds: 8,
    highlights: ["£28.50 per metre"],
  },
  {
    speaker: "David Patterson",
    role: "customer",
    text: "150 PTFE gaskets DN50 PN16, and 50 Dormer A002 drill bits 10mm. Both by the 14th.",
    appearAfterSeconds: 10,
    highlights: ["150", "PTFE gaskets", "DN50 PN16", "50", "Dormer A002 drill bits", "10mm", "the 14th"],
  },
  {
    speaker: "James Morrison",
    role: "sales",
    text: "Gaskets £3.20 each, drill bits £4.85 per bit. No problem.",
    appearAfterSeconds: 13,
    highlights: ["£3.20 each", "£4.85 per bit"],
  },
  {
    speaker: "David Patterson",
    role: "customer",
    text: "Great. Send a quote over? Net 30 as usual.",
    appearAfterSeconds: 15,
    highlights: ["Net 30"],
  },
  {
    speaker: "James Morrison",
    role: "sales",
    text: "Will do. Net 30, no problem.",
    appearAfterSeconds: 17,
    highlights: ["Net 30"],
  },
  {
    speaker: "David Patterson",
    role: "customer",
    text: "Cheers, James.",
    appearAfterSeconds: 19,
  },
  {
    speaker: "James Morrison",
    role: "sales",
    text: "Cheers, David.",
    appearAfterSeconds: 20,
  },
];
