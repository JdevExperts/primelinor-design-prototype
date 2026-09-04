import LegalPageLayout from "../components/legal/LegalPageLayout";
import LegalContactBlock from "../components/legal/LegalContactBlock";

export default function PrivacyPolicy() {
  return (
    <LegalPageLayout
      title="Privacy Policy"
      lastUpdated="30 August 2026"
      description="How PrimeLinor Bulk collects, uses, stores and shares information when you visit primelinorbulk.com, submit an enquiry or request a quotation."
    >
      <p>
        PrimeLinor Bulk (&ldquo;PrimeLinor&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo; or &ldquo;our&rdquo;) respects
        your privacy and is committed to handling personal information responsibly.
      </p>
      <p>
        This Privacy Policy explains how information may be collected, used, stored and shared when you visit
        primelinorbulk.com, contact us, submit an enquiry, request a quotation, upload artwork, communicate with us
        on WhatsApp or otherwise interact with our services.
      </p>

      <h2>Information We May Collect</h2>
      <p>We may collect information that you voluntarily provide, including:</p>
      <ul>
        <li>name</li>
        <li>company or organisation name</li>
        <li>phone number</li>
        <li>WhatsApp number</li>
        <li>email address</li>
        <li>billing or delivery address</li>
        <li>GST or business information provided for quotations/invoices</li>
        <li>product requirements</li>
        <li>quantities, sizes, colours and customization requirements</li>
        <li>logos, artwork, designs and other files uploaded or shared with us</li>
        <li>enquiry, RFQ and quotation information</li>
        <li>messages, revision requests and other correspondence</li>
      </ul>
      <p>
        We may also collect limited technical information when you use the website, such as browser/device
        information, referring pages and basic security logs.
      </p>
      <p>
        We operate our own first-party website usage analytics. We do not store your raw IP address for analytics,
        and we do not use fingerprinting. What we record is limited to: an anonymous randomly-generated visitor
        identifier and a short-lived session identifier stored in your browser; the pages and products you view;
        interaction events such as searches, quote-request clicks, RFQ submissions, WhatsApp and contact clicks;
        a device category (mobile, desktop or tablet); the referral or campaign source (referrer and any UTM
        parameters); and an approximate city, state and country where our hosting or network provider makes that
        available. Approximate location is derived from network information and is not precise. Admin pages and
        private quotation links are excluded from this analytics.
      </p>

      <h2>How We Use Information</h2>
      <p>We may use information to:</p>
      <ul>
        <li>respond to enquiries</li>
        <li>understand product requirements</li>
        <li>prepare and send quotations</li>
        <li>communicate about samples, artwork, production and delivery</li>
        <li>provide requested customization services</li>
        <li>create quotation PDFs and related business documents</li>
        <li>provide customer support</li>
        <li>prevent misuse, fraud or security incidents</li>
        <li>maintain business and accounting records</li>
        <li>improve our website, catalogue and services</li>
        <li>comply with legal or regulatory obligations</li>
      </ul>
      <p>
        We do not intend to use personal information for purposes unrelated to the reason it was collected without
        an appropriate basis.
      </p>

      <h2>Artwork and Logo Files</h2>
      <p>Customers may provide logos, artwork, designs, photographs or other files for customization.</p>
      <p>
        Such files are used for purposes connected with the customer&rsquo;s enquiry, quotation, proofing,
        customization or production.
      </p>
      <p>
        Customers are responsible for ensuring that they have the necessary rights or permissions to use and
        reproduce artwork, logos, trademarks, photographs and other material submitted to PrimeLinor.
      </p>

      <h2>Sharing of Information</h2>
      <p>
        We may share information only where reasonably necessary with service providers involved in fulfilling or
        supporting your request, such as:
      </p>
      <ul>
        <li>logistics or delivery providers</li>
        <li>printing/customization or production partners where required</li>
        <li>hosting, cloud storage and technology providers</li>
        <li>accounting or professional advisers</li>
        <li>government, regulatory or law-enforcement authorities where legally required</li>
      </ul>
      <p>We do not sell personal information to advertisers or data brokers.</p>

      <h2>Data Retention</h2>
      <p>
        We may retain enquiry, quotation, customer and transaction-related information for as long as reasonably
        required for providing services, maintaining business/accounting records, resolving disputes, preventing
        fraud and satisfying legal obligations.
      </p>
      <p>
        Artwork and uploaded files may also be retained for reasonable operational or reorder purposes unless
        deletion is requested and retention is not otherwise required.
      </p>

      <h2>Security</h2>
      <p>
        We use reasonable administrative and technical measures intended to protect information against
        unauthorized access, misuse, alteration or disclosure.
      </p>
      <p>However, no internet transmission or electronic storage system can be guaranteed to be completely secure.</p>

      <h2>Cookies and Analytics</h2>
      <p>
        The website uses essential browser technologies required for functionality, security and session
        management.
      </p>
      <p>
        We use first-party website usage analytics, stored on our own systems, to understand how the website is
        used and to improve our products and content. This uses anonymous visitor and session identifiers held in
        your browser&rsquo;s local storage, records the pages and products viewed and interaction events (such as
        searches, quote-request clicks, RFQ submissions, WhatsApp and contact clicks), a device category, the
        referral or campaign source, and an approximate city/state/country where available. We do not store your
        raw IP address for analytics and we do not fingerprint devices or individuals. Clearing your browser site
        data removes these identifiers.
      </p>
      <p>
        We do not currently use third-party advertising or cross-site tracking services. If that changes, this
        Policy will be updated first.
      </p>

      <h2>Your Requests and Choices</h2>
      <p>
        Subject to applicable law, users may contact us to request information regarding personal data held about
        them, seek correction of inaccurate information, request deletion where applicable, or raise a privacy
        concern.
      </p>
      <p>
        Where processing is based on consent, users may also request withdrawal of that consent, subject to
        information that must be retained for legal, contractual or legitimate business purposes.
      </p>

      <h2>Third-Party Links</h2>
      <p>Our website may contain links to services such as WhatsApp, Google Maps, Instagram or YouTube.</p>
      <p>Their privacy practices are governed by their respective policies.</p>

      <h2>Changes</h2>
      <p>
        We may update this Privacy Policy from time to time. The latest revision date will be displayed on this
        page.
      </p>

      <LegalContactBlock />
    </LegalPageLayout>
  );
}
