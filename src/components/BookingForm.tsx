"use client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Calendar } from "@/components/ui/calendar";
import { IContactForm } from "@/types/IContactForm";
import { ForkKnife, LucideCalendar, Minus, Plus, Timer } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { twMerge } from "tailwind-merge";
import ProgressBar from "./ProgressBar";
import Spinner from "./Spinner";

const BookingForm = () => {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [numberOfGuests, setNumberOfGuests] = useState<number | undefined>(undefined);
  const [step, setStep] = useState(1);
  const bookingSlots: { date: Date; times: string[]; status: string }[] = [
    { date: new Date(2025, 11, 3), times: ["18:00"], status: "green" },
    { date: new Date(2025, 11, 4), times: ["18:00"], status: "green" },
    { date: new Date(2025, 11, 5), times: ["18:30"], status: "green" },
    { date: new Date(2025, 11, 6), times: ["13:00"], status: "green" },
    { date: new Date(2025, 11, 10), times: ["18:00"], status: "green" },
    { date: new Date(2025, 11, 11), times: ["18:00"], status: "green" },
    { date: new Date(2025, 11, 12), times: ["18:30"], status: "green" },
    { date: new Date(2025, 11, 13), times: ["13:00"], status: "green" },
  ];
  const numberOfGuestsOptions = [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
  const totalSteps = 2;
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      FullName: "",
      Email: "",
      PhoneNumber: "",
      Date: "",
      Time: "",
      NumberOfGuests: "",
      Business: "",
      Message: "",
    },
    mode: "onTouched",
  });

  function generateEmailHTML(data: IContactForm) {
    const formattedMessage = data.Message.replace(/\n/g, "<br>");
    return `<div><p><strong>Namn:</strong></p><p>${
      data.FullName
    }</p><p><strong>Email:</strong></p><p><a href="mailto:${data.Email}">${
      data.Email
    }</a></p><p><strong>Telefon:</strong></p><p><a href="tel:${data.PhoneNumber}">${
      data.PhoneNumber
    }</a></p><p><strong>Företag:</strong></p><p>${
      data.Business
    }</p><p><strong>Datum:</strong></p><p>${data.Date}</p><p><strong>Tid:</strong></p><p>${
      data.Time
    }</p><p><strong>Antal gäster:</strong></p><p>${data.NumberOfGuests} st</p>${
      formattedMessage
        ? `<p><strong>Kommentar, allergier eller annat:</strong></p><p>${formattedMessage}</p>`
        : ""
    }</div>`;
  }

  const onSubmit = async (data: IContactForm) => {
    const formData = {
      name: data.FullName,
      email: data.Email,
      business: data.Business,
      phone: data.PhoneNumber,
      date: data.Date,
      time: data.Time,
      numberOfGuests: data.NumberOfGuests,
      subject: `JULBORDSRESERVATION - ${data.FullName}`,
      message: data.Message,
      messageHtml: generateEmailHTML(data),
    };
    console.log(formData, "formData is to be posted");

    fetch("/api/contact-form", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })
      .catch((error) => {
        console.log(error.message);
      })
      .then(() => {
        console.log("Form submitted successfully");
        setFormSubmitted(true);
      });
  };

  const baseClasses =
    "text-base w-full rounded p-2 border-primary/25 shadow-sm focus:outline-none border ring-0 focus:border-primary focus-visible:outline-offset-0 transition-all duration-500 ease-in-out";

  const errorClass = "border-red-500 placeholder:text-red-500";
  const errorTextBaseClass =
    "text-red-500 text-xs font-medium tracking-widest transition-all duration-500 ease-in-out";
  const errorTextHiddenClasses = "opacity-0 max-h-0 h-0 ";
  const errorTextVisibleClasses = "mt-0.5 opacity-100 max-h-full h-full";

  const nextStep = async () => {
    if (step === 1) {
      const isValid = (await trigger("Message")) && date && selectedTime && numberOfGuests;
      if (!isValid) return;
    }
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };
  const [activeAccordion, setActiveAccordion] = useState("item-1");
  const [showMoreGuests, setShowMoreGuests] = useState(false);
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <>
            <Accordion
              value={activeAccordion}
              onValueChange={setActiveAccordion}
              type="single"
              collapsible
            >
              <AccordionItem value="item-1">
                <AccordionTrigger>
                  <label className="text-base inline-flex items-center gap-2" htmlFor="date">
                    <ForkKnife size={20} />
                    {numberOfGuests ? `${numberOfGuests} gäster` : "Antal gäster"}
                  </label>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-wrap justify-center gap-1">
                    {numberOfGuestsOptions.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => {
                          setNumberOfGuests(option);
                          setValue("NumberOfGuests", option.toString(), { shouldValidate: true });
                          setShowMoreGuests(false);
                          setActiveAccordion("item-2");
                        }}
                        className={twMerge(
                          "aspect-square w-[54px] h-[54px] rounded-md border flex justify-center items-center text-base",
                          numberOfGuests === option
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background text-foreground border-primary/25 hover:border-primary",
                        )}
                      >
                        {option}
                      </button>
                    ))}
                    <button
                      onClick={() => {
                        setShowMoreGuests(!showMoreGuests);
                        const newVal = numberOfGuestsOptions[numberOfGuestsOptions.length - 1] + 1;
                        setNumberOfGuests(
                          numberOfGuestsOptions[numberOfGuestsOptions.length - 1] + 1,
                        );
                        setValue("NumberOfGuests", newVal.toString(), { shouldValidate: true });
                      }}
                      className={twMerge(
                        "aspect-square w-[54px] h-[54px] rounded-md border flex justify-center items-center text-base",
                        showMoreGuests
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background text-foreground border-primary/25 hover:border-primary",
                      )}
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                  {showMoreGuests ? (
                    <div className="flex items-center gap-2 p-1 border justify-between rounded-md mt-4">
                      <button
                        className="p-2 hover:bg-secondary/75 rounded-md"
                        onClick={() => {
                          if (numberOfGuests && numberOfGuests > 4) {
                            setNumberOfGuests((numberOfGuests ?? 1) - 1);
                          }
                        }}
                      >
                        <Minus size={18} />
                      </button>
                      <div className="text-base">{numberOfGuests}</div>
                      <button
                        className="p-2 hover:bg-secondary/75 rounded-md"
                        onClick={() => {
                          if (numberOfGuests && numberOfGuests < 50) {
                            const newVal = (numberOfGuests ?? 1) + 1;
                            setNumberOfGuests(newVal);
                            setValue("NumberOfGuests", newVal.toString(), { shouldValidate: true });
                          }
                        }}
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                  ) : null}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>
                  <label className="text-base inline-flex items-center gap-2" htmlFor="date">
                    <LucideCalendar size={20} />
                    {date
                      ? date.toLocaleString("sv-SE", {
                          month: "long",
                          day: "numeric",
                          weekday: "short",
                        })
                      : "Välj datum"}
                  </label>
                </AccordionTrigger>
                <AccordionContent className="justify-center flex">
                  <Calendar
                    hideNavigation
                    showOutsideDays
                    mode="single"
                    selected={date}
                    onSelect={(date) => {
                      setDate(date);
                      setSelectedTime(null);
                      setActiveAccordion("item-3");
                      if (date) {
                        setValue(
                          "Date",
                          `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
                            2,
                            "0",
                          )}-${String(date.getDate()).padStart(2, "0")}`,
                          { shouldValidate: true },
                        );
                      }
                    }}
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
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>
                  <label className="text-base inline-flex items-center gap-2" htmlFor="time">
                    <Timer size={20} />
                    {selectedTime ? selectedTime : "Välj tid"}
                  </label>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-wrap gap-2">
                    {getTimesForDate(date).map((time) => (
                      <button
                        disabled={
                          date &&
                          bookingSlots.find((s) => isSameDay(s.date, date))?.status === "red"
                        }
                        type="button"
                        key={time}
                        onClick={() => {
                          setSelectedTime(time);
                          setValue("Time", time, { shouldValidate: true });
                        }}
                        className={twMerge(
                          "px-4 py-2 rounded-full border inline-flex gap-2 items-center text-sm",
                          date && selectedTime === time
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background text-foreground border-primary/25 hover:border-primary",
                          date &&
                            bookingSlots.find((s) => isSameDay(s.date, date))?.status === "red" &&
                            "opacity-50 cursor-not-allowed",
                        )}
                      >
                        <span
                          className={`block rounded-full`}
                          style={{
                            backgroundColor: getStatusColor(date),
                            height: "8px",
                            width: "8px",
                          }}
                        ></span>
                        {time}
                      </button>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </>
        );
      case 2:
        return (
          <div>
            <div className="border-b pb-2 my-4">
              <div className="mb-2 flex items-center justify-between">
                <div className="text-lg">Summering</div>
                <button
                  className="text-sm text-primary/75 font-semibold underline underline-offset-4 w-fit cursor-pointer"
                  onClick={() => setStep(1)}
                >
                  ändra
                </button>
              </div>
              <div className="flex gap-4">
                <div className="inline-flex items-center gap-2 text-sm">
                  <ForkKnife size={18} />
                  {numberOfGuests}
                </div>
                <div className="inline-flex items-center gap-2 text-sm">
                  <LucideCalendar size={18} />
                  {date?.toLocaleDateString("sv-SE", {
                    month: "long",
                    day: "numeric",
                    weekday: "short",
                  }) || "Inget datum valt"}
                </div>
                <div className="inline-flex items-center gap-2 text-sm">
                  <Timer size={18} />
                  {selectedTime}
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-1 mb-4">
              <label className="text-sm" htmlFor="FullName">
                För- och efternamn*
              </label>
              <input
                className={twMerge(baseClasses, errors["FullName"] ? errorClass : "")}
                type="text"
                {...register("FullName", {
                  required: "Fyll i namn",
                  minLength: {
                    value: 2,
                    message: "Minst 2 tecken",
                  },
                  maxLength: {
                    value: 50,
                    message: "Max 50 tecken",
                  },
                })}
              />
              <p
                role="alert"
                className={twMerge(
                  errorTextBaseClass,
                  errors["FullName"] ? errorTextVisibleClasses : errorTextHiddenClasses,
                )}
              >
                {errors.FullName?.message}
              </p>
            </div>
            <div className="flex flex-col md:flex-row gap-x-4 gap-y-4 mb-4">
              <div className="flex flex-col gap-1 flex-1">
                <label className="text-sm" htmlFor="Email">
                  E-postadress*
                </label>
                <input
                  className={twMerge(baseClasses, errors["Email"] ? errorClass : "")}
                  type="email"
                  {...register("Email", {
                    required: "Fyll i email",
                    pattern: {
                      value: /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
                      message: "Ogiltig emailadress",
                    },
                  })}
                />
                <p
                  role="alert"
                  className={twMerge(
                    errorTextBaseClass,
                    errors["Email"] ? errorTextVisibleClasses : errorTextHiddenClasses,
                  )}
                >
                  {errors.Email?.message}
                </p>
              </div>

              <div className="flex flex-col gap-1 flex-1">
                <label className="text-sm" htmlFor="PhoneNumber">
                  Telefonnummer*
                </label>
                <input
                  className={twMerge(baseClasses, errors["PhoneNumber"] ? errorClass : "")}
                  type="tel"
                  {...register("PhoneNumber", {
                    onChange: (e) => {
                      e.target.value = e.target.value.replace(/[^0-9]/g, "");
                    },
                    required: "Fyll i telefonnummer",
                    pattern: {
                      value: /^[0-9]+$/,
                      message: "Ogiltigt telefonnummer",
                    },
                    minLength: {
                      value: 10,
                      message: "Minst 10 siffror",
                    },
                    maxLength: {
                      value: 15,
                      message: "Max 15 siffror",
                    },
                  })}
                />
                <p
                  role="alert"
                  className={twMerge(
                    errorTextBaseClass,
                    errors["PhoneNumber"] ? errorTextVisibleClasses : errorTextHiddenClasses,
                  )}
                >
                  {errors.PhoneNumber?.message}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-1 mb-4">
              <label className="text-sm" htmlFor="Business">
                Företagsnamn*
              </label>
              <input
                className={twMerge(baseClasses, errors["Business"] ? errorClass : "")}
                type="text"
                {...register("Business", {
                  required: "Fyll i företagsnamn",
                  minLength: {
                    value: 2,
                    message: "Minst 2 tecken",
                  },
                  maxLength: {
                    value: 50,
                    message: "Max 50 tecken",
                  },
                })}
              />
              <p
                role="alert"
                className={twMerge(
                  errorTextBaseClass,
                  errors["Business"] ? errorTextVisibleClasses : errorTextHiddenClasses,
                )}
              >
                {errors.Business?.message}
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm" htmlFor="Message">
                Kommentar, allergier eller annat <span className="text-gray-500">(valfritt)</span>
              </label>
              <textarea
                maxLength={500}
                className={twMerge(
                  "h-64 resize-none whitespace-pre-line",
                  baseClasses,
                  errors["Message"] ? errorClass : "",
                )}
                {...register("Message", {
                  maxLength: {
                    value: 500,
                    message: "Max 500 tecken",
                  },
                })}
              ></textarea>
              <p
                role="alert"
                className={twMerge(
                  errorTextBaseClass,
                  errors["Message"] ? errorTextVisibleClasses : errorTextHiddenClasses,
                )}
              >
                {errors.Message?.message}
              </p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  function isSameDay(a: Date, b: Date) {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }

  function getTimesForDate(date: Date | undefined) {
    if (!date) return [];
    const slot = bookingSlots.find((s) => isSameDay(s.date, date));
    return slot ? slot.times : [];
  }

  function getStatusColor(date: Date | undefined) {
    const statusColors: { [key: string]: string } = {
      green: "#34D399",
      yellow: "#FBBF24",
      red: "#F87171",
    };
    if (!date) return "#D1D5DB"; // gray-300
    const slot = bookingSlots.find((s) => isSameDay(s.date, date));
    return slot ? statusColors[slot.status] : "#D1D5DB"; // gray-300
  }

  return (
    <div className="relative">
      {!formSubmitted ? <ProgressBar currentStep={step} totalSteps={2} /> : null}

      {formSubmitted ? (
        <div className="text-center flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <h6 className="text-2xl md:text-3xl">Tack!</h6>
            <p className="whitespace-pre-line text-balance text-xl">Din bokning är mottagen.</p>
          </div>
          <div className="flex flex-col gap-2">
            <div className="text-base">Du har bokat</div>
            <div className="flex gap-4 justify-center">
              <div className="inline-flex items-center gap-2 text-sm">
                <ForkKnife size={18} />
                {numberOfGuests}
              </div>
              <div className="inline-flex items-center gap-2 text-sm">
                <LucideCalendar size={18} />
                {date?.toLocaleDateString("sv-SE", {
                  month: "long",
                  day: "numeric",
                  weekday: "short",
                })}
              </div>
              <div className="inline-flex items-center gap-2 text-sm">
                <Timer size={18} />
                {selectedTime}
              </div>
            </div>
          </div>
          <p className="text-sm">Vid frågor kommer vi att kontakta dig på {watch("Email")}</p>
          <p className="text-xs">Har du frågor? Tveka inte på att ringa eller mejla oss.</p>
          <button
            onClick={() => {
              setFormSubmitted(false);
              reset();
              setDate(undefined);
              setSelectedTime(null);
              setNumberOfGuests(undefined);
              setStep(1);
            }}
            className="inline-flex w-full items-center justify-center py-2.5 bg-foreground text-background hover:bg-foreground/90 rounded-full disabled:opacity-50 cursor:pointer"
          >
            Klar
          </button>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mx-auto flex flex-col gap-3"
          name="contact-form"
        >
          <input type="hidden" name="required-field" value="contact-form" />
          {renderStepContent()}
          {step < 2 && (
            <button
              disabled={date && selectedTime && numberOfGuests ? false : true}
              className="inline-flex w-full items-center justify-center py-2.5 bg-foreground text-background hover:bg-foreground/90 rounded-full disabled:opacity-50"
              onClick={nextStep}
            >
              Reservera
            </button>
          )}
          {step === 2 && (
            <button
              disabled={isSubmitting || formSubmitted}
              type="submit"
              className="inline-flex w-full items-center justify-center py-2.5 bg-foreground text-background hover:bg-foreground/90 rounded-full"
            >
              {isSubmitting ? (
                <Spinner
                  primaryColor="text-primary"
                  secondaryColor="text-background"
                  strokeWidth={4}
                  height={24}
                  width={24}
                />
              ) : (
                "Skicka"
              )}
            </button>
          )}
        </form>
      )}
    </div>
  );
};

export default BookingForm;
