export const APP_ROLES = ['patient','doctor','pharmacy_admin','pharmacist','platform_admin'] as const;
export type AppRole = typeof APP_ROLES[number];
