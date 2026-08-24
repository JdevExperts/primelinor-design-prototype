import Button from "../ui/Button";
import Dialog from "../product/Dialog";
import styles from "./WhatsAppDialog.module.css";

/**
 * Shared prototype stand-in for the "Chat with Our Team" / "Continue on
 * WhatsApp" actions on About and Contact — same honest placeholder used by
 * the Customization Studio's WhatsApp dialog. No number is hardcoded.
 */
export default function WhatsAppDialog({ open, onClose }) {
  return (
    <Dialog open={open} onClose={onClose} titleId="whatsapp-dialog-title" title="Continue on WhatsApp">
      <p className={styles.copy}>
        WhatsApp would open here in production. This is a visual prototype —
        nothing was sent.
      </p>
      <Button variant="primary" size="md" onClick={onClose}>
        Close
      </Button>
    </Dialog>
  );
}
