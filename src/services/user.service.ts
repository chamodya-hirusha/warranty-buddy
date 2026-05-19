import prisma from "@/lib/prisma";
import bcrypt from "bcrypt"; 

export async function registerUser(
  data: { email: string; passwordRaw: string; name: string; roleId: string },
  tenantId: string,
  actorId?: string
) {
  // 1. Hash password securely
  const hashedPassword = await bcrypt.hash(data.passwordRaw, 10);

  // 2. Create user scoped to Tenant
  const user = await prisma.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      name: data.name,
      roleId: data.roleId,
      tenantId: tenantId, 
    },
    // Exclude password from the returned payload
    select: { id: true, email: true, name: true, role: true, tenantId: true }
  });

  // 3. Log the creation
  const { createAuditLog } = await import("./audit.service");
  await createAuditLog("CREATE", "User", tenantId, user.id, actorId);
  return user;
}
