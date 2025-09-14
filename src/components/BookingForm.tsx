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
      Service: "",
      Message: "",
    },
    mode: "onTouched",
  });

  function generateEmailHTML(data: IContactForm) {
    const formattedMessage = data.Message.replace(/\n/g, "<br>");
    return `<div><p><strong>Namn:</strong></p><p>${data.FullName}</p><p><strong>Email:</strong></p><p><a href="mailto:${data.Email}">${data.Email}</a></p><p><strong>Telefon:</strong></p><p><a href="tel:${data.PhoneNumber}">${data.PhoneNumber}</a></p><p><strong>Intresserad av tjänst:</strong></p><p>${data.Service}</p><p><strong>Meddelande:</strong></p><p>${formattedMessage}</p></div>`;
  }

  const onSubmit = async (data: IContactForm) => {
    const formData = {
      name: data.FullName,
      email: data.Email,
      service: data.Service,
      subject: `Kontaktformulär - ${data.FullName}`,
      message: data.Message,
      messageHtml: generateEmailHTML(data),
    };
    console.log(formData, "formData to be posted");
    // toast
    //   .promise(
    //     fetch("/api/contact-form", {
    //       method: "POST",
    //       headers: {
    //         "Content-Type": "application/json",
    //       },
    //       body: JSON.stringify(formData),
    //     }),
    //     {
    //       loading: "Skickar meddelande...",
    //       success: "Meddelande skickat!",
    //       error: "Ett fel uppstod.",
    //     },
    //     {
    //       style: {
    //         minWidth: "250px",
    //       },
    //       position: "bottom-center",
    //       className: "!bg-primary !text-background",
    //       success: {
    //         duration: 8000,
    //       },
    //     },
    //   )
    //   .catch((error) => {
    //     console.log(error.message);
    //   })
    //   .then(() => {
    //     setFormSubmitted(true);
    //     setTimeout(() => {
    //       reset();
    //     }, 250);
    //   });
  };

  const baseClasses =
    "text-base w-full rounded-md p-2 border-primary/25 shadow-sm focus:outline-none border ring-0 focus:border-primary focus-visible:outline-offset-0 transition-all duration-500 ease-in-out";

  const errorClass = "border-red-500 placeholder:text-red-500";
  const errorTextBaseClass =
    "text-red-500 text-xs font-medium tracking-widest transition-all duration-500 ease-in-out";
  const errorTextHiddenClasses = "opacity-0 max-h-0 h-0 ";
  const errorTextVisibleClasses = "mt-0.5 opacity-100 max-h-full h-full";

  const bookingSlots: { date: Date; times: string[]; status: string }[] = [
    { date: new Date(2025, 11, 3), times: ["18:00"], status: "green" }, // December = 11
    { date: new Date(2025, 11, 4), times: ["18:00"], status: "yellow" },
    { date: new Date(2025, 11, 5), times: ["18:30"], status: "green" },
    { date: new Date(2025, 11, 6), times: ["13:00"], status: "red" },
    { date: new Date(2025, 11, 10), times: ["18:00"], status: "green" },
    { date: new Date(2025, 11, 11), times: ["18:00"], status: "yellow" },
    { date: new Date(2025, 11, 12), times: ["18:30"], status: "green" },
    { date: new Date(2025, 11, 13), times: ["13:00"], status: "green" },
  ];
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [numberOfGuests, setNumberOfGuests] = useState<number | undefined>(undefined);
  const numberOfGuestsOptions = [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
  const [step, setStep] = useState(1);
  const totalSteps = 2;

  const nextStep = async () => {
    if (step === 1) {
      const isValid = await trigger("Message");
      if (!isValid) return;
    }
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
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
                        setNumberOfGuests(
                          numberOfGuestsOptions[numberOfGuestsOptions.length - 1] + 1,
                        );
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
                    <div className="flex items-center gap-2 p-2 border justify-between rounded-md mt-4">
                      <button
                        className="p-1"
                        onClick={() => {
                          if (numberOfGuests && numberOfGuests > 4) {
                            setNumberOfGuests((numberOfGuests ?? 1) - 1);
                          }
                        }}
                      >
                        <Minus size={20} />
                      </button>
                      <div className="text-base">{numberOfGuests}</div>
                      <button
                        className="p-1"
                        onClick={() => {
                          if (numberOfGuests && numberOfGuests < 50) {
                            setNumberOfGuests((numberOfGuests ?? 1) + 1);
                          }
                        }}
                      >
                        <Plus size={20} />
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
                        onClick={() => setSelectedTime(time)}
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
          <div className="px-2 pb-2">
            <div className="border-b pb-2 mb-4">
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
              <label className="text-sm font-semibold" htmlFor="FullName">
                För- och efternamn
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
                <label className="text-sm font-semibold" htmlFor="Email">
                  E-postadress
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
                <label className="text-sm font-semibold" htmlFor="PhoneNumber">
                  Telefonnummer
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

            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold" htmlFor="Message">
                Meddelande
              </label>
              <textarea
                maxLength={500}
                className={twMerge(
                  "h-64 resize-none whitespace-pre-line",
                  baseClasses,
                  errors["Message"] ? errorClass : "",
                )}
                {...register("Message", {
                  required: "Fyll i meddelande",
                  minLength: {
                    value: 10,
                    message: "Minst 10 tecken",
                  },
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
      <ProgressBar currentStep={step} totalSteps={totalSteps} />
      {/* {step > 1 && (
        <button
          className="inline-flex w-fit items-center text-sm text-primary/75 hover:text-primary"
          onClick={prevStep}
        >
          <ChevronLeft size={18} />
          Gå tillbaka
        </button>
      )} */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mx-auto flex flex-col gap-3"
        name="contact-form"
      >
        <input type="hidden" name="required-field" value="contact-form" />
        {renderStepContent()}
        {step < totalSteps && (
          <button
            className="inline-flex w-full items-center justify-center py-2.5 bg-foreground text-background hover:bg-foreground/90 rounded-full"
            onClick={nextStep}
          >
            Reservera
          </button>
        )}
        {step === totalSteps && (
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

        {/* <button
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
        </button> */}
      </form>

      {/* <div
        className={twMerge(
          "absolute inset-0 left-0 top-0 -m-2 overflow-hidden backdrop-blur-sm transition-all delay-75 duration-500 ease-in-out lg:backdrop-blur-sm",
          formSubmitted ? "visible opacity-100" : "invisible opacity-0",
        )}
      >
        <div
          className={twMerge(
            "flex h-full transform flex-col items-center justify-center space-y-4 transition-all duration-500 ease-in-out",
            formSubmitted ? "translate-y-0" : "translate-y-[125%]",
          )}
        >
          <h6 className="text-2xl md:text-3xl lg:text-center">Meddelande skickat!</h6>
          <p className="whitespace-pre-line text-balance text-xl lg:text-center lg:text-xl">
            Tack! Vi återkopplar så fort vi kan.
          </p>
          <button
            onClick={() => setFormSubmitted(false)}
            className="inline-block rounded-md bg-primary p-2 px-4 text-center text-xs text-background transition-all duration-200 ease-in-out"
          >
            Stäng
          </button>
        </div>
      </div> */}
    </div>
  );
};

export default BookingForm;
