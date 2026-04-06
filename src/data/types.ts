export type BookingStatus = "pending" | "accepted" | "denied";
export type BookingType = "private" | "business";
export type SlotStatus = "green" | "yellow" | "red";

export interface BookingComment {
  text: string;
  author: string;
  timestamp: string;
}

export interface Booking {
  id: string;
  date: string;
  time: string;
  guests: number;
  name: string;
  business: string;
  email: string;
  phone: string;
  status: BookingStatus;
  type: BookingType;
  comments: BookingComment[];
}

export interface Slot {
  date: Date;
  times: string[];
  status: SlotStatus;
}

export interface AppEvent {
  id: string;
  name: string;
  year: number;
  capacity: number;
  bookings: Booking[];
  slots: Slot[];
}

export interface CreateBookingDto {
  date: string;
  time: string;
  guests: number;
  name: string;
  business: string;
  email: string;
  phone: string;
  type: BookingType;
}

export interface UpdateBookingStatusDto {
  status: BookingStatus;
}

export interface AddBookingCommentDto {
  text: string;
  author: string;
}

export interface CreateEventDto {
  name: string;
  year: number;
  capacity: number;
}

export interface CreateSlotDto {
  date: string;
  times: string[];
}

export interface UpdateSlotStatusDto {
  status: SlotStatus;
}
