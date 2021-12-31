// @ts-nocheck

import { PrismaClient } from "@prisma/client";

if (!global.prisma_client) {
  global.prisma_client = new PrismaClient();
}

export default global.prisma_client;
