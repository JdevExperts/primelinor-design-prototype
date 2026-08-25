import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAdminAuth } from "../context/useAdminAuth";
import styles from "./RequireAdminAuth.module.css";

export default function RequireAdminAuth() {
  const { status } = useAdminAuth();
  const location = useLocation();

  if (status === "loading") {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} aria-hidden="true" />
      </div>
    );
  }

  if (status === "signedOut") {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
