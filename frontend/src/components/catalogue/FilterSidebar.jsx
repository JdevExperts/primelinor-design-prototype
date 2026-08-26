import { useId, useState } from "react";
import { listingFilterOptions, productColors } from "../../data/mockData";
import Icon from "../ui/Icon";
import styles from "./FilterSidebar.module.css";

const INITIAL_OPEN = {
  category: true,
  material: true,
  gsm: false,
  color: true,
  moq: false,
  price: true,
  useCase: false,
  more: false,
};

function FilterGroup({ id, title, open, onToggle, children }) {
  const panelId = `${id}-panel`;

  return (
    <div className={styles.group}>
      <button
        type="button"
        className={styles.groupToggle}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={onToggle}
      >
        <span className={styles.groupTitle}>{title}</span>
        <Icon
          name="chevronDown"
          size={16}
          className={`${styles.groupIcon} ${open ? styles.groupIconOpen : ""}`}
        />
      </button>
      <div id={panelId} className={styles.groupBody} hidden={!open}>
        {children}
      </div>
    </div>
  );
}

function CheckRow({ id, label, checked, onChange }) {
  return (
    <label className={styles.check} htmlFor={id}>
      <input
        id={id}
        className={styles.checkbox}
        type="checkbox"
        checked={checked}
        onChange={onChange}
      />
      <span className={styles.checkBox} aria-hidden="true">
        {checked ? <Icon name="check" size={12} /> : null}
      </span>
      <span className={styles.checkLabel}>{label}</span>
    </label>
  );
}

export default function FilterSidebar({
  filters,
  onToggle,
  onCustomizable,
  idPrefix,
  categories,
}) {
  const reactId = useId();
  const prefix = idPrefix || reactId;
  const [open, setOpen] = useState(INITIAL_OPEN);

  const toggleGroup = (key) => {
    setOpen((current) => ({ ...current, [key]: !current[key] }));
  };

  const categoryOptions = categories.filter((item) => item.id !== "all");

  return (
    <div className={styles.filters}>
      <FilterGroup
        id={`${prefix}-category`}
        title="Category"
        open={open.category}
        onToggle={() => toggleGroup("category")}
      >
        <div className={styles.options} role="group" aria-label="Category">
          {categoryOptions.map((item) => (
            <CheckRow
              key={item.id}
              id={`${prefix}-cat-${item.id}`}
              label={item.label}
              checked={filters.categories.includes(item.id)}
              onChange={() => onToggle("categories", item.id)}
            />
          ))}
        </div>
      </FilterGroup>

      <FilterGroup
        id={`${prefix}-material`}
        title="Material"
        open={open.material}
        onToggle={() => toggleGroup("material")}
      >
        <div className={styles.options} role="group" aria-label="Material">
          {listingFilterOptions.materials.map((item) => (
            <CheckRow
              key={item.id}
              id={`${prefix}-mat-${item.id}`}
              label={item.label}
              checked={filters.materials.includes(item.id)}
              onChange={() => onToggle("materials", item.id)}
            />
          ))}
        </div>
      </FilterGroup>

      <FilterGroup
        id={`${prefix}-gsm`}
        title="GSM"
        open={open.gsm}
        onToggle={() => toggleGroup("gsm")}
      >
        <div className={styles.options} role="group" aria-label="GSM">
          {listingFilterOptions.gsm.map((item) => (
            <CheckRow
              key={item.id}
              id={`${prefix}-gsm-${item.id}`}
              label={item.label}
              checked={filters.gsm.includes(item.id)}
              onChange={() => onToggle("gsm", item.id)}
            />
          ))}
        </div>
      </FilterGroup>

      <FilterGroup
        id={`${prefix}-color`}
        title="Color"
        open={open.color}
        onToggle={() => toggleGroup("color")}
      >
        <div className={styles.colors} role="group" aria-label="Color">
          {Object.entries(productColors).map(([id, swatch]) => {
            const inputId = `${prefix}-color-${id}`;
            const checked = filters.colors.includes(id);
            return (
              <label key={id} className={styles.color} htmlFor={inputId}>
                <input
                  id={inputId}
                  className={styles.checkbox}
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggle("colors", id)}
                />
                <span
                  className={`${styles.swatch} ${checked ? styles.swatchOn : ""}`}
                  style={{ backgroundColor: swatch.hex }}
                  aria-hidden="true"
                />
                <span className={styles.checkLabel}>{swatch.label}</span>
              </label>
            );
          })}
        </div>
      </FilterGroup>

      <FilterGroup
        id={`${prefix}-moq`}
        title="MOQ"
        open={open.moq}
        onToggle={() => toggleGroup("moq")}
      >
        <div className={styles.options} role="group" aria-label="Minimum order quantity">
          {listingFilterOptions.moq.map((item) => (
            <CheckRow
              key={item.id}
              id={`${prefix}-moq-${item.id}`}
              label={item.label}
              checked={filters.moq.includes(item.id)}
              onChange={() => onToggle("moq", item.id)}
            />
          ))}
        </div>
      </FilterGroup>

      <FilterGroup
        id={`${prefix}-price`}
        title="Price"
        open={open.price}
        onToggle={() => toggleGroup("price")}
      >
        <div className={styles.options} role="group" aria-label="Price">
          {listingFilterOptions.price.map((item) => (
            <CheckRow
              key={item.id}
              id={`${prefix}-price-${item.id}`}
              label={item.label}
              checked={filters.price.includes(item.id)}
              onChange={() => onToggle("price", item.id)}
            />
          ))}
        </div>
      </FilterGroup>

      <FilterGroup
        id={`${prefix}-use`}
        title="Use case"
        open={open.useCase}
        onToggle={() => toggleGroup("useCase")}
      >
        <div className={styles.options} role="group" aria-label="Use case">
          {listingFilterOptions.useCases.map((item) => (
            <CheckRow
              key={item.id}
              id={`${prefix}-use-${item.id}`}
              label={item.label}
              checked={filters.useCases.includes(item.id)}
              onChange={() => onToggle("useCases", item.id)}
            />
          ))}
        </div>
      </FilterGroup>

      <div className={styles.custom}>
        <CheckRow
          id={`${prefix}-custom`}
          label="Customization available"
          checked={filters.customizable}
          onChange={onCustomizable}
        />
      </div>

      <FilterGroup
        id={`${prefix}-more`}
        title="More filters"
        open={open.more}
        onToggle={() => toggleGroup("more")}
      >
        <p className={styles.moreCopy}>
          Printing methods and other technical options will sit here later.
          Most buyers choose products by fabric, colour and quantity first.
        </p>
      </FilterGroup>
    </div>
  );
}
