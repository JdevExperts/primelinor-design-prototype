-- Sales Quotation Workspace (Phase B): a DRAFT quotation line may have a
-- quantity but no rate yet, so line_total becomes nullable ("rate
-- required" rather than a fake ₹0). Send validation still guarantees no
-- SENT quotation ever carries a null line amount (§11/§12).
ALTER TABLE "quotation_lines" ALTER COLUMN "line_total" DROP NOT NULL;
