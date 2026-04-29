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
    text: "James, David at Apex Seating. Got a few releases to call off — 5,000 M8x25 Grade 10.9 zinc flange bolts to our Wabash plant by March 14th.",
    appearAfterSeconds: 0,
    highlights: ["5,000", "M8x25 Grade 10.9", "zinc flange bolts", "Wabash plant", "March 14th"],
  },
  {
    speaker: "James Morrison",
    role: "sales",
    text: "Sure, those run $0.18 to $0.22 a piece at that volume. What else?",
    appearAfterSeconds: 3,
    highlights: ["$0.18", "$0.22"],
  },
  {
    speaker: "David Patterson",
    role: "customer",
    text: "Match them with 5,000 M8 conical spring washers. Same dock, same date.",
    appearAfterSeconds: 5,
    highlights: ["5,000", "M8 conical spring washers"],
  },
  {
    speaker: "James Morrison",
    role: "sales",
    text: "About $0.04 each. Can do.",
    appearAfterSeconds: 8,
    highlights: ["$0.04 each"],
  },
  {
    speaker: "David Patterson",
    role: "customer",
    text: "Then 2,500 M10x40 SHCS Grade 12.9 black oxide to our Detroit plant — that one needs a PPAP package and 3.1 mill certs. New program launch.",
    appearAfterSeconds: 10,
    highlights: ["2,500", "M10x40 SHCS", "Grade 12.9", "black oxide", "Detroit plant", "PPAP package", "3.1 mill certs"],
  },
  {
    speaker: "James Morrison",
    role: "sales",
    text: "Got it — PPAP plus 3.1 noted on the SHCS. That grade runs $0.42 a piece.",
    appearAfterSeconds: 13,
    highlights: ["PPAP", "3.1", "$0.42 a piece"],
  },
  {
    speaker: "David Patterson",
    role: "customer",
    text: "And 1,000 F436 half-inch structural washers, plus 200 A325 TC-bolt assemblies. Both Wabash, also by the 14th.",
    appearAfterSeconds: 15,
    highlights: ["1,000", "F436 half-inch structural washers", "200", "A325 TC-bolt assemblies", "Wabash"],
  },
  {
    speaker: "James Morrison",
    role: "sales",
    text: "F436s at $0.32, A325 TC-sets at $1.85 per assembly. All HDG, three-piece on the TCs.",
    appearAfterSeconds: 18,
    highlights: ["$0.32", "$1.85 per assembly", "HDG", "three-piece"],
  },
  {
    speaker: "David Patterson",
    role: "customer",
    text: "Perfect. Send the formal quote over? Net 30 standard.",
    appearAfterSeconds: 20,
    highlights: ["Net 30"],
  },
  {
    speaker: "James Morrison",
    role: "sales",
    text: "Will do. Net 30, no problem.",
    appearAfterSeconds: 22,
    highlights: ["Net 30"],
  },
  {
    speaker: "David Patterson",
    role: "customer",
    text: "Cheers, James.",
    appearAfterSeconds: 24,
  },
  {
    speaker: "James Morrison",
    role: "sales",
    text: "Cheers, David.",
    appearAfterSeconds: 25,
  },
];
