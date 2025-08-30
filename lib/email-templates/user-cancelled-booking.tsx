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
import { logo } from "../configs/config-file";

interface CancelledBookingEmailProps {
  baseUrl: string,
  name?: string;
  bookingid?: string;
  reason?: string;
}

export const CancelledBookingEmail = ({
  baseUrl,
  name,
  bookingid,
  reason,
}: CancelledBookingEmailProps) => (
  <Html>
    <Head />
    <Preview>Booking Cancelled</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Booking Cancelled</Heading>
        <Text>Hello, {name}</Text>
        <Text>Booking ID: {bookingid}</Text>
        <Text>
          This is to inform you that your booking has been successfully cancelled.
        </Text>
        <Text>
          Reason for Cancellation: &quot;{reason}&quot;
        </Text>
        <Text>
          We regret any inconvenience this may cause. If you have any questions or require further assistance, please feel free to reach out to us.
        </Text>
        <Text>
          If you did not initiate this cancellation, please contact our support team immediately to resolve the issue.
        </Text>
        <Text>
          Thank you for your understanding.
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

export default CancelledBookingEmail;

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
