import { headers } from "next/headers";

export interface SessionContext {
  userId: string;
  tenantId: string;
}

/**
 * Safely extracts the current Tenant and User ID.
 * Usage in API Route: const { tenantId, userId } = getAuthContext();
 */
export function getAuthContext(): SessionContext {
  const headersList = headers();
  // Replace with actual session extraction logic (e.g., await getServerSession())
  const userId = headersList.get("x-user-id") || "mock-user-id"; 
  const tenantId = headersList.get("x-tenant-id");

  if (!tenantId) {
    throw new Error("Unauthorized: Missing Tenant ID. All requests must be scoped to a tenant.");
  }

  return { userId, tenantId };
}
