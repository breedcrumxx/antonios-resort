export const cancellationReasons = [
  { name: "Other Reasons", value: "" },
  { name: "Change of Plans", value: "My plans have changed." },
  { name: "Found a Better Option", value: "I found a better accommodation or deal." },
  // { name: "Personal Reasons", value: "Personal reasons." },
  { name: "Financial Reasons", value: "Financial reasons." },
  { name: "Health Issues", value: "Health issues." },
  { name: "Travel Restrictions", value: "Travel restrictions or changes in travel regulations." },
  { name: "Event Cancellation", value: "The event I was attending got cancelled." },
  { name: "Weather Concerns", value: "Concerns about the weather." },
];
export const adminCancellationReasons = [
  { name: "Client's request", value: "" },
  {
    name: "Resort Under Maintenance",
    value: "The resort is undergoing scheduled or emergency maintenance, making it necessary to reschedule client bookings to ensure a high-quality experience."
  },
  { name: "Found a Better Option", value: "I found a better accommodation or deal." },
  // { name: "Personal Reasons", value: "Personal reasons." },
  { name: "Financial Reasons", value: "Financial reasons." },
  { name: "Health Issues", value: "Health issues." },
  { name: "Travel Restrictions", value: "Travel restrictions or changes in travel regulations." },
  { name: "Event Cancellation", value: "The event I was attending got cancelled." },
  { name: "Weather Concerns", value: "Concerns about the weather." },
];

export const rejectionReasons = [
  { name: "Payment Issues", value: "The client's payment method was declined, or there was an issue processing the payment for the booking." },
  { name: "Facility Unavailable", value: "The requested service or package is currently unavailable due to maintenance, renovation, or other reasons." },
  { name: "Security Concerns", value: "There are security concerns associated with the client or the booking request, such as fraudulent activity or suspicious behavior." },
  { name: "Staff Unavailability", value: "The required staff members or service providers are not available to fulfill the booking request." },
  { name: "External Factors", value: "External factors such as weather conditions, natural disasters, or emergencies prevent the fulfillment of the booking request." },
  { name: "Other Reasons", value: "Any other specific reason not covered by the above categories may also warrant the rejection of a booking request." }
]

export const reschedulingReasons = [
  {
    name: "Client Request",
    value: "The client requested to reschedule their booking."
  },
  {
    name: "Resort Under Maintenance",
    value: "The resort is undergoing scheduled or emergency maintenance, making it necessary to reschedule client bookings to ensure a high-quality experience."
  },
  {
    name: "Staff Unavailability",
    value: "Due to unexpected staff shortages or scheduling conflicts, the resort cannot accommodate the client's original booking dates."
  },
  {
    name: "Health and Safety Protocols",
    value: "Enhanced health and safety protocols or unforeseen health-related incidents at the resort require rescheduling of bookings to ensure guest safety."
  },
  {
    name: "Event Booking Conflict",
    value: "A large event or conference booked at the resort has created a scheduling conflict, necessitating the rescheduling of some bookings."
  },
  {
    name: "Natural Disasters",
    value: "Natural disasters, such as hurricanes or earthquakes, have affected the resort's ability to host guests, leading to necessary rescheduling."
  },
  {
    name: "Overbooking",
    value: "Due to an administrative error, the resort has been overbooked, and some bookings need to be rescheduled to manage capacity."
  },
  {
    name: "Technical Issues",
    value: "Technical issues with booking systems or resort infrastructure have necessitated the rescheduling of bookings to ensure smooth operations."
  },
];
