import LegalPageLayout from "../components/legal/LegalPageLayout";
import LegalContactBlock from "../components/legal/LegalContactBlock";

export default function ReturnReplacementPolicy() {
  return (
    <LegalPageLayout
      title="Return & Replacement Policy"
      lastUpdated="30 August 2026"
      description="How PrimeLinor Bulk handles replacement requests for bulk and customized orders, including eligible issues, reporting, and resolution."
    >
      <h2>Customized Products</h2>
      <p>
        PrimeLinor primarily manufactures and supplies bulk, customized goods produced to each customer&rsquo;s
        specification, artwork and approved sizing. Because of this, customized goods are generally
        <strong> not returnable</strong> for reasons such as:
      </p>
      <ul>
        <li>change of mind</li>
        <li>customer no longer requiring the goods</li>
        <li>customer-supplied incorrect artwork or content</li>
        <li>customer-approved specifications that were produced correctly</li>
        <li>an incorrect size breakup that was provided or approved by the customer</li>
      </ul>

      <h2>Eligible Replacement Issues</h2>
      <p>We review replacement claims for issues such as:</p>
      <ul>
        <li>a materially wrong product</li>
        <li>a material manufacturing defect</li>
        <li>a significant printing or branding defect</li>
        <li>quantity shortage</li>
        <li>material deviation from customer-approved specifications</li>
        <li>transit damage, where shipping was arranged by PrimeLinor</li>
      </ul>

      <h2>Reporting a Problem</h2>
      <p>
        Problems should preferably be reported within 48 hours of delivery, along with photographs or video of the
        affected goods, so we can investigate promptly. This is a preferred timeframe to support a timely
        investigation, not a waiver of any right you may otherwise have under applicable law.
      </p>

      <h2>Assessment</h2>
      <p>
        Once a claim is reported with supporting photos/video, our team reviews it against the order&rsquo;s
        approved artwork, specifications and production records to determine whether it qualifies as an eligible
        issue under this policy.
      </p>

      <h2>Resolution</h2>
      <p>For verified PrimeLinor production errors, possible remedies include:</p>
      <ul>
        <li>replacement of the affected quantity</li>
        <li>rework or correction</li>
        <li>credit adjustment</li>
        <li>another mutually agreed resolution</li>
      </ul>
      <p>The specific remedy depends on the nature and scale of the verified issue.</p>

      <h2>Customer-Approved Artwork</h2>
      <p>
        Goods produced correctly according to artwork, spelling, colours, names, numbers, dimensions or placement
        that the customer approved are not eligible for replacement on that basis alone.
      </p>

      <h2>Size and Fit</h2>
      <p>
        Goods produced according to a size breakdown provided or approved by the customer are not eligible for
        replacement solely because the sizing does not fit as expected. Customers are encouraged to confirm size
        requirements and, where useful, request a sample before confirming a bulk size breakup.
      </p>

      <h2>Colour Variation</h2>
      <p>
        Minor colour variation arising from photography, display settings, dye lots, materials or production
        processes is expected in bulk manufacturing and is not, on its own, treated as a defect. Where exact colour
        matching is important, this should be flagged and confirmed before production.
      </p>

      <h2>Non-Customized Goods</h2>
      <p>
        For any non-customized, stock goods supplied as-is, standard eligibility criteria above still apply —
        replacement is considered for a materially wrong item, manufacturing defect, quantity shortage or transit
        damage where shipping was arranged by PrimeLinor.
      </p>

      <h2>Refunds</h2>
      <p>
        Resolution under this policy is generally replacement, rework, credit adjustment or another mutually agreed
        outcome rather than an automatic cash refund. Once customized production has started, amounts corresponding
        to materials, customization and work already completed may be non-refundable, subject to applicable law and
        the commercial terms agreed for that order.
      </p>

      <LegalContactBlock />
    </LegalPageLayout>
  );
}
