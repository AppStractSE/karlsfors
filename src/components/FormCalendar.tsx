"use client";

import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";

const FormCalendar = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  return (
    <Calendar
      hideNavigation
      showOutsideDays
      mode="single"
      selected={date}
      onSelect={setDate}
      className="border"
      captionLayout="label"
      buttonVariant="outline"
      startMonth={new Date(2025, 11, 1)}
      disabled={[
        { before: new Date(2025, 11, 3) },
        { after: new Date(2025, 11, 13) },
        { from: new Date(2025, 11, 7), to: new Date(2025, 11, 9) },
      ]}
    />
  );
};

export default FormCalendar;
