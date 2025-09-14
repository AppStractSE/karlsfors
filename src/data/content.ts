export const content = {
    title: "Book a Meeting",
    description: "Schedule a meeting with us using the form below.",
    fields: {
        name: {
        label: "Full Name",
        placeholder: "Enter your full name",
        required: true,
        },
        email: {
        label: "Email Address",
        placeholder: "Enter your email address",
        required: true,
        },
        date: {
        label: "Preferred Date",
        placeholder: "Select a date",
        required: true,
        },
        time: {
        label: "Preferred Time",
        placeholder: "Select a time",
        required: true,
        },
        message: {
        label: "Additional Message",
        placeholder: "Enter any additional information",
        required: false,
        },
    },
    submitButtonText: "Book Now",
    successMessage: "Thank you for booking a meeting! We will get back to you soon.",
    errorMessage:
        "There was an error submitting the form. Please try again later.",
    loadingMessage: "Submitting your booking...",
}