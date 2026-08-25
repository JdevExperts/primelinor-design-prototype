import Dialog from "./Dialog";
import styles from "./SizeGuideModal.module.css";

export default function SizeGuideModal({ open, onClose, product }) {
  const guide = product.sizeGuide;
  if (!guide) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      titleId="size-guide-title"
      title="Size guide"
      wide
    >
      <p className={styles.note}>{guide.note}</p>
      <div className={styles.wrap}>
        <table className={styles.table}>
          <caption className="visually-hidden">
            Size chart for {product.name}
          </caption>
          <thead>
            <tr>
              {guide.columns.map((column) => (
                <th key={column} scope="col">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {guide.rows.map((row) => (
              <tr key={row[0]}>
                {row.map((cell, index) =>
                  index === 0 ? (
                    <th key={cell} scope="row">
                      {cell}
                    </th>
                  ) : (
                    <td key={`${row[0]}-${cell}`}>{cell}</td>
                  ),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Dialog>
  );
}
