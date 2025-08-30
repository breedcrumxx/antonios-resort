import {
  Body,
  Head,
  Html
} from "@react-email/components";
import { coupons } from "../zod/z-schema";
import { z } from "zod";

interface BookingSummaryEmailProps {
  name?: string,
  packagename?: string,
  book_at?: string,
  check_in?: string,
  check_out?: string,
  paymentOption?: string,
  paymenttype?: string,
  calculation?: CalculationType,
  transactionid?: string,
  bookingid?: string,
  days?: number,
  sets?: number,
  amountpaid?: number,
  slot?: string,
  activeCoupons?: z.infer<typeof coupons>[],
  applieddiscount?: number,
}

export const BookingSummaryEmail = ({
  name,
  packagename,
  book_at,
  check_in,
  check_out,
  paymentOption,
  paymenttype,
  calculation,
  bookingid,
  days,
  sets,
  transactionid,
  amountpaid,
  slot,
  activeCoupons,
  applieddiscount,
}: BookingSummaryEmailProps) => (
  <Html id="receipt">
    <Head />
    <Body style={main}>
      <body style={{ fontFamily: 'Arial, sans-serif', background: 'white', color: 'black' }}>
        <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px', border: '1px solid #ccc', borderRadius: '10px', backgroundColor: '#fff', fontSize: '1.1rem' }}>
          <h1 style={{ fontSize: '2rem', textAlign: 'center', padding: '0', margin: '0' }}>Antonio&apos;s Resort</h1>
          <h2 style={{ fontSize: '1.5rem', textAlign: 'center', padding: '0', margin: '0', marginBottom: '20px' }}>Private resort</h2>
          <h2 style={{ fontSize: '1rem', textAlign: 'center' }}>Booking ID: {bookingid}</h2>
          <h2 style={{ fontSize: '1rem', textAlign: 'center', marginBottom: '20px' }}>Transaction ID: {transactionid}</h2>
          <table style={{ width: '100%' }}>
            <tbody>
              <tr>
                <td style={{ fontWeight: 'bold' }}>Guest:</td>
                <td style={{ fontWeight: 'normal', textAlign: 'right' }}>{name}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 'bold' }}>Package:</td>
                <td style={{ fontWeight: 'normal', textAlign: 'right' }}>{packagename}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 'bold' }}>Booking date:</td>
                <td style={{ fontWeight: 'normal', textAlign: 'right' }}>{book_at}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 'bold' }}>Reservation date:</td>
                <td style={{ fontWeight: 'normal', textAlign: 'right' }}>{check_in}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 'bold' }}>Reservation date:</td>
                <td style={{ fontWeight: 'normal', textAlign: 'right' }}>{check_out}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 'bold' }}>Payment method:</td>
                <td style={{ fontWeight: 'normal', textAlign: 'right' }}>{paymentOption}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 'bold' }}>Payment type:</td>
                <td style={{ fontWeight: 'normal', textAlign: 'right' }}>{paymenttype}</td>
              </tr>
            </tbody>
          </table>

          <hr style={{ margin: "10px 0;" }} />

          <table style={{ width: '100%' }}>
            <tbody>
              <tr>
                <td style={{ fontWeight: 'bold' }}>{slot && slot != "regular" ? slot[0].toUpperCase() + slot?.slice(1) + " tour" : "Cottage and swimming"}:</td>
                <td style={{ fontWeight: 'normal', textAlign: 'right' }}>&#8369; {(calculation?.packageprice)?.toLocaleString()}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 'bold' }}>Sets:</td>
                <td style={{ fontWeight: 'normal', textAlign: 'right' }}>x {sets}</td>
              </tr>
              {
                days && days > 1 && (
                  <tr>
                    <td style={{ fontWeight: 'bold' }}>Nights:</td>
                    <td style={{ fontWeight: 'normal', textAlign: 'right' }}>x {days}</td>
                  </tr>
                )
              }
            </tbody>
          </table>

          <hr style={{ margin: "10px 0;" }} />
          {
            (((activeCoupons as z.infer<typeof coupons>[]).length > 0) || (applieddiscount && applieddiscount > 0)) ? (
              <>
                <table style={{ width: '100%' }}>
                  <tbody>
                    <tr>
                      <td style={{ fontWeight: 'bold' }}>Sub-total:</td>
                      <td style={{ fontWeight: 'normal', textAlign: 'right', textDecoration: "line-through" }}>&#8369; {(calculation?.subtotal)?.toLocaleString()}</td>
                    </tr>

                    {
                      (activeCoupons as z.infer<typeof coupons>[]).map((item, i) => (
                        <tr style={{ fontSize: '1rem', marginLeft: '10px' }} key={i}>
                          <td>Coupon {item.couponcode}</td>
                          <td style={{ fontWeight: 'normal', textAlign: 'right' }}>- {!item.percent && (<span>&#8369;</span>)} {item.amount} {item.percent && "%"}</td>
                        </tr>
                      ))
                    }

                    {
                      (applieddiscount || 0 > 0) && (
                        <>
                          <tr style={{ fontSize: '1rem', marginLeft: '10px' }} >
                            <td>Applied discount</td>
                            <td style={{ fontWeight: 'normal', textAlign: 'right' }}>- {applieddiscount}%</td>
                          </tr>
                        </>
                      )
                    }
                  </tbody>
                </table>
                {
                  (applieddiscount || 0 > 0) && (
                    <hr style={{ margin: "10px 0;" }} />
                  )
                }

              </>
            ) : null
          }

          <table style={{ width: '100%' }}>
            <tbody>
              <tr>
                <td style={{ fontWeight: 'bold' }}>Total amount:</td>
                <td style={{ fontWeight: 'normal', textAlign: 'right' }}>&#8369; {(calculation?.total)?.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>

          <hr style={{ margin: "10px 0;" }} />

          <table style={{ width: '100%' }}>
            <tbody>
              {
                paymenttype == "Down payment" && calculation ? (
                  <>
                    <tr>
                      <td style={{ fontSize: "1rem", fontWeight: 'bold' }}>Amount paid:</td>
                      <td style={{ fontSize: "1rem", fontWeight: 'normal', textAlign: 'right' }}>&#8369; {(amountpaid)?.toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td style={{ fontSize: "1.2rem", fontWeight: 'bold' }}>To pay on-site:</td>
                      <td style={{ fontSize: "1.2rem", fontWeight: 'normal', textAlign: 'right' }}>&#8369; {(
                        (calculation.total - (amountpaid as number)).toLocaleString()
                      ).toLocaleString()} </td>
                    </tr>
                  </>
                ) : calculation && (
                  <tr>
                    <td style={{ fontWeight: 'bold', fontSize: "1.3rem" }}>Amount paid:</td>
                    <td style={{ fontWeight: 'normal', textAlign: 'right', fontSize: "1.3rem" }}>&#8369; {
                      (amountpaid)?.toLocaleString()
                    }</td>
                  </tr>
                )
              }
              <tr>
                <td style={{ fontWeight: 'bold', fontSize: ".8rem" }}>VAT TAX (already included):</td>
                <td style={{ fontWeight: 'normal', textAlign: 'right', fontSize: ".9rem" }}>&#8369; {(calculation?.vat)?.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
          <p style={{ textAlign: "justify", fontSize: '.8rem' }}>Thank you for entrusting your plans with us. We will send you an email in a short time once your reservation has been approved.</p>
          <div style={{ maxWidth: '400px', marginTop: '20px' }}>
            <p style={{ fontSize: '0.8rem', opacity: '0.8', textAlign: 'justify' }}>If you have any questions or concerns, please contact the <span style={{ fontSize: '0.8rem', opacity: '1', color: '#007bff', textDecoration: 'underline', cursor: 'pointer' }}>AR Support</span> or message us on our <a href="https://www.facebook.com/antonios.resort.ne" style={{ fontSize: '0.8rem', opacity: '1', color: '#007bff', textDecoration: 'underline', cursor: 'pointer' }}>Facebook page</a>.</p>
          </div>
        </div>
      </body>
    </Body>
  </Html >
);

BookingSummaryEmail.PreviewProps = {
  loginCode: "sparo-ndigo-amurt-secan",
} as BookingSummaryEmailProps;

export default BookingSummaryEmail;

const main = {
  backgroundColor: "#ffffff",
};

