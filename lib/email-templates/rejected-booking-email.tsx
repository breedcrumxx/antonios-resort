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

interface RejectedBookingEmailProps {
  baseUrl: string;
  name?: string;
  bookingid?: string;
  generalreason?: string;
  reason?: string;
}

export const RejectedBookingEmail = ({
  baseUrl,
  name,
  bookingid,
  generalreason,
  reason,
}: RejectedBookingEmailProps) => (
  <Html>
    <Head />
    <Preview>Booking Rejected</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Booking Rejected</Heading>
        <Text>
          Hello, {name}
        </Text>
        <Text>
          We regret to inform you that your booking has been rejected. Below are the details:
        </Text>
        <Text>
          <strong>Booking ID:</strong> {bookingid}
        </Text>
        <Text>
          <strong>General Reason:</strong> {generalreason}
        </Text>
        <Text>
          <strong>Specific Reason:</strong> {reason}
        </Text>
        <Text>
          If you have any questions or need further assistance, please don&apos;t hesitate to reach out to us.
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

export default RejectedBookingEmail;

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
}