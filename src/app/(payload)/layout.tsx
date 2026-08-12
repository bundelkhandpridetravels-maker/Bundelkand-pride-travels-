/* THIS FILE IS PART OF THE PAYLOAD ADMIN MOUNT.
 *
 * The `(payload)` route group isolates Payload's admin UI from the public site:
 * a route group adds no URL segment, but it does give Payload its own root
 * layout, so the marketing site's fonts, providers and global chrome are NOT
 * applied to the CMS (and vice versa).
 */
import type { ServerFunctionClient } from "payload";
import config from "@payload-config";
import { handleServerFunctions, RootLayout } from "@payloadcms/next/layouts";
import { importMap } from "./admin/importMap.js";

import "@payloadcms/next/css";

type Args = {
  children: React.ReactNode;
};

const serverFunction: ServerFunctionClient = async function (args) {
  "use server";
  return handleServerFunctions({
    ...args,
    config,
    importMap,
  });
};

export default function Layout({ children }: Args) {
  return (
    <RootLayout config={config} importMap={importMap} serverFunction={serverFunction}>
      {children}
    </RootLayout>
  );
}
