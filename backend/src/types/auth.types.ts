export type AuthContext = {
  userId: string;
  schoolId: string | null;
  isSuperAdmin: boolean;
  permissions: Set<string>;
};
