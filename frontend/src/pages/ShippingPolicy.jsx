import LegalPageLayout from "../components/legal/LegalPageLayout";
import LegalContactBlock from "../components/legal/LegalContactBlock";

export default function ShippingPolicy() {
  return (
    <LegalPageLayout
      title="Shipping & Delivery Policy"
      lastUpdated="30 August 2026"
      description="How PrimeLinor Bulk handles delivery timelines, shipping charges, delivery partners and transit-damage reporting for bulk and customized orders."
    >
      <h2>Delivery Timeline</h2>
      <p>
        Delivery timelines depend on the product, quantity, customization complexity, artwork approval and
        production schedule. Exact timelines are confirmed in the quotation or order confirmation for each order,
        not on the website generally.
      </p>

      <h2>Delivery Estimates</h2>
      <p>
        Any estimated delivery window shared during enquiry or quotation stage is an estimate only. Actual dispatch
        and delivery dates may vary based on production readiness, artwork approval timing, material availability
        and courier/logistics network conditions.
      </p>

      <h2>Shipping Charges</h2>
      <p>
        Shipping charges, where applicable, are calculated based on order weight, volume, destination and delivery
        urgency, and will be communicated as part of the quotation or invoice unless otherwise agreed.
      </p>

      <h2>Delivery Partners</h2>
      <p>
        We work with third-party logistics and courier partners to fulfil deliveries. Once handed over to a
        delivery partner, delivery timelines and handling are also subject to that partner&rsquo;s own operational
        standards and constraints.
      </p>

      <h2>Customer-Arranged Logistics</h2>
      <p>
        Where a customer arranges their own logistics or courier pickup, PrimeLinor&rsquo;s responsibility for the
        shipment is limited to handing the goods over in good condition at the agreed pickup point; delivery
        timeline, handling and transit risk from that point are the responsibility of the customer&rsquo;s chosen
        logistics provider.
      </p>

      <h2>Delivery Address</h2>
      <p>
        Customers are responsible for providing a complete and accurate delivery address and contact number.
        Re-delivery or re-routing costs arising from an incorrect or incomplete address provided by the customer may
        be charged separately.
      </p>

      <h2>Inspection on Delivery</h2>
      <p>
        Customers are encouraged to inspect the shipment at the time of delivery, wherever practically possible,
        before accepting it from the delivery partner.
      </p>

      <h2>Shortage or Transit Damage</h2>
      <p>
        Claims for visible shortage or transit damage should preferably be reported within 48 hours of delivery,
        along with photographs or video of the packaging and affected goods, so we can investigate promptly with the
        delivery partner and take appropriate action. This is a preferred timeframe to support a timely
        investigation, not a waiver of any right you may otherwise have under applicable law.
      </p>

      <h2>Delays Beyond Our Control</h2>
      <p>
        PrimeLinor is not responsible for delivery delays caused by circumstances beyond our reasonable control,
        including but not limited to logistics network disruptions, weather events, strikes, government
        restrictions or other force-majeure-type events.
      </p>

      <p>
        The specific quotation or order confirmation for your order remains the authoritative source for the actual
        delivery commitment applicable to that order — this page describes our general delivery practices.
      </p>

      <LegalContactBlock />
    </LegalPageLayout>
  );
}
