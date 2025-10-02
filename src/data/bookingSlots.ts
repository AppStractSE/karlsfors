export const bookingSlots: { date: Date; times: string[]; status: string }[] = [
  { date: new Date(2025, 11, 3), times: ["18:00"], status: "green" },
  { date: new Date(2025, 11, 4), times: ["18:00"], status: "green" },
  { date: new Date(2025, 11, 5), times: ["18:30"], status: "green" },
  { date: new Date(2025, 11, 6), times: ["13:00"], status: "green" },
  { date: new Date(2025, 11, 10), times: ["18:00"], status: "green" },
  { date: new Date(2025, 11, 11), times: ["18:00"], status: "green" },
  { date: new Date(2025, 11, 12), times: ["18:30"], status: "red" },
  { date: new Date(2025, 11, 13), times: ["13:00"], status: "green" },
];
