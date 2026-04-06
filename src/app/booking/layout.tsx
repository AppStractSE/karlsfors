import IframeResizer from "@/components/IframeResizer";

export default function BookingLayout({ children }: { children: React.ReactNode }) {
  return <IframeResizer>{children}</IframeResizer>;
}
