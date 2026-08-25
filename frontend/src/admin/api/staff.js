import { adminGet } from "./adminClient";

export const listStaff = () => adminGet("/admin/staff");
