import { options } from "@/app/api/auth/[...nextauth]/options";
import { Label } from "@/app/components/ui/label";
import '@/app/configuration.css';
import { defaultAgreement, defaultCookiePolicy, defaultImportantNotes, defaultPrivacyPolicy, defaultReschedulingPolicy, defaultTermsCondition, FaqConfigType, PolicyType } from "@/lib/configs/config-file";
import { verifyConfig } from "@/lib/configs/verify-config";
import prisma from "@/lib/prisma";
import { systemLogger } from "@/lib/utils/api-debugger";
import { ErrorFeedback } from "@/lib/utils/error-report-modal";
import { getServerSession } from "next-auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Container from "./components/container";
import FAQEditor from "./components/faq-editor";

export default async function WebsiteSettingsPage() {

  const session = await getServerSession(options)

  if (!session) redirect("/signin?callbackUrl=/admin/settings")

  if (!(session.user as UserSession).role.businesscontrol) { // check user control
    redirect("/403")
  }

  try {
    const configurations = await prisma.system.findMany({
      where: {
        name: {
          in: [
            "importantnotes",
            "agreement",
            "cancellationpolicy",
            "reschedulingpolicy",
            "privacypolicy",
            // "cookiepolicy",
            "faqcontent",
            "termscondition",
          ]
        }
      }
    })

    const dataNotes = configurations.find((item) => item.name == "importantnotes")
    const dataAgreement = configurations.find((item) => item.name == "agreement")
    const dataCancellation = configurations.find((item) => item.name == "cancellationpolicy")
    const dataRescheduling = configurations.find((item) => item.name == "reschedulingpolicy")
    const dataFaq = configurations.find((item) => item.name == "faqcontent")
    const dataPrivacy = configurations.find((item) => item.name == "privacypolicy")
    // const dataCookie = configurations.find((item) => item.name == "cookiepolicy")
    const dataTerms = configurations.find((item) => item.name == "termscondition")

    const importantnotesConf = await verifyConfig<string>(dataNotes, "importantnotes", defaultImportantNotes)
    const agreementConf = await verifyConfig<PolicyType>(dataAgreement, "agreement", defaultAgreement)
    const cancellationpolicy = await verifyConfig<string>(dataCancellation, "cancellationpolicy", defaultImportantNotes)
    const reschedulingpolicy = await verifyConfig<string>(dataRescheduling, "reschedulingpolicy", defaultReschedulingPolicy)
    const faqcontent = await verifyConfig<FaqConfigType>(dataFaq, "faqcontent", [])
    const privacypolicy = await verifyConfig<PolicyType>(dataPrivacy, "privacypolicy", defaultPrivacyPolicy)
    // const cookiepolicy = await verifyConfig<PolicyType>(dataCookie, "cookiepolicy", defaultCookiePolicy)
    const termscondition = await verifyConfig<PolicyType>(dataTerms, "termscondition", defaultTermsCondition)

    return (
      <div className="h-max px-10 py-4 space-y-10 overflow-y-scroll scroll">
        <div className="space-y-2">
          <Label>Important Notes:</Label><br />
          <p className="text-sm opacity-70">Please configure any essential notes or instructions related to this booking. These notes will be crucial for ensuring all necessary information is communicated.</p>
          <Container value={importantnotesConf} target="importantnotes">
            <div className="w-full min-h-[300px] max-h-[300px] border overflow-hidden px-5" dangerouslySetInnerHTML={{ __html: importantnotesConf }}>
            </div>
          </Container>
        </div>

        <div className="space-y-2">
          <Label>Reservation agreement:</Label><br />
          <p className="text-sm opacity-70">
            Please review and configure the terms and conditions related to placing a reservation. These details are essential for ensuring a clear understanding and agreement between all parties involved.
          </p>
          <Container value={agreementConf.content} target="agreement">
            <div className="w-full min-h-[300px] max-h-[300px] border overflow-hidden px-5" dangerouslySetInnerHTML={{ __html: agreementConf.content }}>
            </div>
          </Container>
        </div>

        <div className="space-y-2">
          <Label>Rescheduling Guidelines:</Label><br />
          <p className="text-sm opacity-70">
            Please review and configure the policy and reminders related to rescheduling a reservation. These details are essential for ensuring a clear understanding of how the rescheduling system works.
          </p>
          <Container value={reschedulingpolicy} target="reschedulingpolicy">
            <div className="w-full min-h-[300px] max-h-[300px] border overflow-hidden px-5" dangerouslySetInnerHTML={{ __html: reschedulingpolicy }}>
            </div>
          </Container>
        </div>

        <div className="space-y-2">
          <Label>Cancellation policy:</Label><br />
          <p className="text-sm opacity-70">Please configure any essential notes or instructions related to booking. These notes will be crucial for ensuring all necessary information is communicated.</p>
          <Container value={cancellationpolicy} target="cancellationpolicy">
            <div className="w-full min-h-[300px] max-h-[300px] border overflow-hidden px-5" dangerouslySetInnerHTML={{ __html: cancellationpolicy }}>
            </div>
          </Container>
        </div>

        <div className="space-y-2">
          <Label>Privacy policy:</Label><br />
          <p className="text-sm opacity-70">This section allows you to review and configure the privacy policy related to bookings on Antonio&apos;s Resort website. The privacy policy outlines how customer data is collected, used, and protected during the booking process and while interacting with our website. It is important to ensure that all relevant information about data protection and user rights is communicated clearly to your customers.</p>
          <Container value={privacypolicy.content} target="privacypolicy">
            <div className="w-full min-h-[300px] max-h-[300px] border overflow-hidden px-5" dangerouslySetInnerHTML={{ __html: privacypolicy.content }}>
            </div>
          </Container>
        </div>

        {/* <div className="space-y-2">
          <Label>Cookie policy:</Label><br />
          <p className="text-sm opacity-70">This section allows you to review and configure the cookie policy for Antonio&apos;s Resort website. The cookie policy outlines the use of cookies, which are small files stored on users&apos; devices to manage login sessions and improve their experience on our website. It is important to clearly communicate how cookies are used, what information is collected, and how users can manage their cookie preferences.</p>
          <Container value={cookiepolicy.content} target="cookiepolicy">
            <div className="w-full min-h-[300px] max-h-[300px] border overflow-hidden px-5" dangerouslySetInnerHTML={{ __html: cookiepolicy.content }}>
            </div>
          </Container>
        </div> */}

        <div className="space-y-2">
          <Label>Terms and condition:</Label><br />
          <p className="text-sm opacity-70">This section allows you to review and configure the Terms and Conditions for Antonio&apos;s Resort website. The Terms and Conditions outline the rules and guidelines for using our services, including booking procedures, payment terms, cancellation policies, and user responsibilities. It is essential to provide clear information about your rights and obligations as a customer to ensure a smooth and enjoyable experience during your stay at the resort.</p>
          <Container value={termscondition.content} target="termscondition">
            <div className="w-full min-h-[300px] max-h-[300px] border overflow-hidden px-5" dangerouslySetInnerHTML={{ __html: termscondition.content }}>
            </div>
          </Container>
        </div>

        <div className="space-y-2">
          <Label>Frequently Asked Questions</Label><br />
          <p className="text-sm opacity-70">Configure the frequently asked questions for your users.</p>
          <div className="min-h-[500px] px-32">
            <FAQEditor content={faqcontent} />
          </div>
        </div>
      </div>
    )

  } catch (error) {
    await systemLogger(error, Object.fromEntries(headers()), "Requesting payments configuration page.", "GET", "Moderate", "", "/website")

    return (
      <div className="h-max px-4 overflow-y-scroll scroll">
        <ErrorFeedback
          error={JSON.stringify(error, Object.getOwnPropertyNames(error))}
          code="PAGE-ERR-0015"
          subtitle="An error occured while trying to request this page, please try again later!"
          admin
        />
      </div>
    )
  }
}