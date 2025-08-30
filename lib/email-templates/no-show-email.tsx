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
import * as React from "react";
import { logo } from "../configs/config-file";

export const NoShowEmail = ({
  baseUrl,
}: {
  baseUrl: string
}) => (
  <Html>
    <Head />
    <Preview>Booking Marked as No Show</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Your Booking Has Been Marked as a No-Show</Heading>
        <Text>Hello, </Text>
        <Text>
          We regret to inform you that your booking for today has been marked as a no-show by failing to check-in on the scheduled date and time.
        </Text>
        <Text>
          If you believe this is an error or you need assistance, please contact our support team as soon as possible.
        </Text>
        <Text>
          We value your patronage and hope to have the opportunity to serve you in the future. If you have any questions or need further assistance, please don&apos;t hesitate to reach out to us.
        </Text>
        <Img
          src={logo}
          width="150"
          height="150"
        />
        <Text style={footer}>
          <Link
            href={`${baseUrl}`}
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

export default NoShowEmail;

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
