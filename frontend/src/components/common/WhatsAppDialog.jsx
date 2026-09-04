import { useEffect, useState } from "react";
import Button from "../ui/Button";
import Dialog from "../product/Dialog";
import { getPublicConfig } from "../../api/config";
import { buildWhatsAppUrl } from "../../utils/whatsapp";
import { track } from "../../analytics/track";
import styles from "./WhatsAppDialog.module.css";

const GENERIC_MESSAGE = "Hi PrimeLinor, I'd like to talk about custom products for my brand.";

/**
 * Shared "Chat with Our Team" / "Continue on WhatsApp" entry point (About,
 * Contact). Real click-to-chat handoff when WHATSAPP_NUMBER is configured
 * (Phase 4 §18/§20) — no number is hardcoded here, it comes from GET
 * /api/v1/config/public. If not configured, this honestly says so rather
 * than showing a fake/dead action.
 */
export default function WhatsAppDialog({ open, onClose }) {
  const [whatsappUrl, setWhatsappUrl] = useState(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!open) return;
    getPublicConfig()
      .then((cfg) => {
        setWhatsappUrl(cfg.whatsappEnabled ? buildWhatsAppUrl(cfg.whatsappNumber, GENERIC_MESSAGE) : null);
        setChecked(true);
      })
      .catch(() => setChecked(true));
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} titleId="whatsapp-dialog-title" title="Continue on WhatsApp">
      {whatsappUrl ? (
        <>
          <p className={styles.copy}>You&rsquo;ll be taken to WhatsApp to chat with our team directly.</p>
          <Button
            as="a"
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            variant="primary"
            size="md"
            onClick={() => {
              track("WHATSAPP_CLICK", { metadata: { context: "whatsapp_dialog" } });
              onClose();
            }}
          >
            Open WhatsApp
          </Button>
        </>
      ) : (
        <p className={styles.copy}>
          {checked
            ? "WhatsApp chat isn't set up yet — please use the enquiry form instead."
            : "Checking WhatsApp availability…"}
        </p>
      )}
      <Button variant="secondary" size="md" onClick={onClose}>
        Close
      </Button>
    </Dialog>
  );
}
