import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Text,
} from "@react-email/components";
import { format } from "date-fns";
import { logo } from "../configs/config-file";

interface RescheduledBookingEmailProps {
  baseUrl: string;
  name?: string;
  bookingid?: string;
  newdatein?: Date;
  newdateout?: Date;
  reschedulefee?: number;
  coverTheFees?: boolean;
  reason?: string;
}

export const RescheduledBookingEmail = ({
  baseUrl,
  name,
  bookingid,
  newdatein,
  newdateout,
  reschedulefee,
  coverTheFees,
  reason,
}: RescheduledBookingEmailProps) => (
  <Html>
    <Head />
    <Preview>Booking Rescheduled</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Booking Rescheduled</Heading>
        <Text>
          Hello, {name}
        </Text>
        <Text>
          We are pleased to inform you that your booking has been successfully rescheduled. Here are the details of your updated booking:
        </Text>
        <Text>
          {reason}
        </Text>
        <Text>
          <strong>Booking ID:</strong> {bookingid}
        </Text>
        <Text>
          <strong>New Check-in Date:</strong> {format(newdatein as Date, "MMMM do yyyy, hh:mm a")}
        </Text>
        <Text>
          <strong>New Check-out Date:</strong> {format(newdateout as Date, "MMMM do yyyy, hh:mm a")}
        </Text>
        {
          coverTheFees ? (
            <Text>
              No need to worry—your rescheduling fee has been fully covered. We’re happy to assist you with your booking!
            </Text>
          ) : (
            <Text>
              Please note that a rescheduling fee applies. Rescheduling fee of {reschedulefee?.toLocaleString()} pesos for this booking, which is due on-site upon your arrival.
            </Text>
          )
        }
        <Text>
          We look forward to welcoming you. If you have any questions or need further assistance, please don&quot;t hesitate to reach out to us.
        </Text>
        <Img
          src={logo}
          width="150"
          height="150"
        />
        <Text style={footer}>
          <Link
            href={baseUrl}
            target="_blank"
            style={{ ...link, color: "#898989" }}
          >
            Antonio&apos;s Resort
          </Link>
          , all-in-one vacation place.
        </Text>
      </Container>
    </Body>
  </Html>
);

export default RescheduledBookingEmail;

const main = {
  backgroundColor: "#ffffff",
};

const container = {
  paddingLeft: "12px",
  paddingRight: "12px",
  margin: "0 auto",
};

const h1 = {
  color: "#333",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "40px 0",
  padding: "0",
};

const link = {
  color: "#2754C5",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: "14px",
  textDecoration: "underline",
};

const text = {
  color: "#333",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: "14px",
  margin: "24px 0",
};

const footer = {
  color: "#898989",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: "12px",
  lineHeight: "22px",
  marginTop: "12px",
  marginBottom: "24px",
};

const code = {
  display: "inline-block",
  padding: "16px 4.5%",
  width: "90.5%",
  backgroundColor: "#f4f4f4",
  borderRadius: "5px",
  border: "1px solid #eee",
  color: "#333",
};
