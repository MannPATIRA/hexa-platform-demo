export interface CallRecord {
  id: string;
  name: string;
  company: string;
  date: string;
  duration: string;
  items: number;
  status: "live" | "completed";
}

export const callHistory: CallRecord[] = [
  {
    id: "call-1",
    name: "David Patterson",
    company: "Sheffield Precision Mfg.",
    date: "Today, 2:06 PM",
    duration: "",
    items: 0,
    status: "live",
  },
  {
    id: "call-2",
    name: "Sarah Chen",
    company: "Acme Industrial Ltd.",
    date: "Mon 24 Feb, 4:32 PM",
    duration: "12 min",
    items: 7,
    status: "completed",
  },
  {
    id: "call-3",
    name: "Raj Patel",
    company: "Thornton Supplies",
    date: "Fri 21 Feb, 11:15 AM",
    duration: "8 min",
    items: 4,
    status: "completed",
  },
  {
    id: "call-4",
    name: "Emily Watson",
    company: "Barton Logistics",
    date: "Wed 19 Feb, 9:20 AM",
    duration: "15 min",
    items: 9,
    status: "completed",
  },
  {
    id: "call-5",
    name: "Marcus O'Brien",
    company: "Greenfield Parts Co.",
    date: "Mon 17 Feb, 3:45 PM",
    duration: "6 min",
    items: 3,
    status: "completed",
  },
];
