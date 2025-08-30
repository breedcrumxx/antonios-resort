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

interface RefundRequestEmailProps {
  baseUrl: string;
  name?: string;
  bookingid?: string;
  refundrequestid?: string;
}

export const RefundRequestEmail = ({
  baseUrl,
  name,
  bookingid,
  refundrequestid,
}: RefundRequestEmailProps) => (
  <Html>
    <Head />
    <Preview>Refund Request Received</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Refund Request Received</Heading>
        <Text>
          Hello, {name}
        </Text>
        <Text>
          We have received your refund request for your booking. Our team will review and process your request shortly. Once approved, you can expect the refund to be sent within 3-5 business days.
        </Text>
        <Text>
          <strong>Booking ID:</strong> {bookingid}
        </Text>
        <Text>
          <strong>Refund Request ID:</strong> {refundrequestid}
        </Text>
        <Text>
          We appreciate your patience. If you have any questions or need further assistance, please don&apos;t hesitate to reach out to us.
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
          , your all-in-one vacation place.
        </Text>
      </Container>
    </Body>
  </Html>
);

export default RefundRequestEmail;

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
