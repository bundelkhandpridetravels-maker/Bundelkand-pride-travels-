import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";

const nextConfig: NextConfig = {
  // Next 16 builds with Turbopack by default. Declaring the (empty) property
  // silences Payload's configuration warning without changing behaviour.
  turbopack: {},
};

export default withPayload(nextConfig);
