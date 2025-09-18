"use server";
import { NextRequest, NextResponse } from "next/server";

interface ContactFormData {
  email: string;
  name: string;
  subject: string;
  message: string;
  messageHtml: string;
}

export async function POST(req: NextRequest) {
  try {
    const data: ContactFormData = await req.json();

    const formData = {
      Name: data.name,
      Email: data.email,
      Subject: data.subject,
      Message: data.message,
      MessageHtml: data.messageHtml.toString(),
    };

    const apiKey = process.env.API_KEY;

    const externalResponse = await fetch("http://sphere.appstract.se:5302/mail/sendcontactform", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Bearer: `${apiKey}`,
      },
      body: JSON.stringify(formData),
    });
    console.log("externalResponseStatus", externalResponse.status);
    if (!externalResponse.status.toString().startsWith("2")) {
      throw new Error(`Failed to send: ${externalResponse.statusText}`);
    }

    return NextResponse.json({ success: true, data: {} });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Error in API route:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
