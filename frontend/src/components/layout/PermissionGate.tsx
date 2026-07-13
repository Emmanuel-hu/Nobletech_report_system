import type { PropsWithChildren, ReactNode } from 'react';

import { useAuth } from '../../context/AuthContext';

type PermissionGateProps = PropsWithChildren<{
  permission: string;
  fallback?: ReactNode;
}>;

export const PermissionGate = ({ permission, fallback, children }: PermissionGateProps) => {
  const { can } = useAuth();

  if (!can(permission)) {
    return (
      <>
        {fallback ?? (
          <section className="state-block state-error" role="alert">
            <h3>Permission required</h3>
            <p>You do not currently hold {permission}.</p>
          </section>
        )}
      </>
    );
  }

  return <>{children}</>;
};
