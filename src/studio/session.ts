import { DEFAULT_BROWSER_CHANNEL, openBrowserSession, type BrowserChannel } from "../browser/session.js";
import { FlowPage } from "../flow/page.js";
import type { FlowAutomation } from "../flow/types.js";

export interface SessionOptions {
  profile?: string;
  headed?: boolean;
  browser?: BrowserChannel;
}

// Same session the `gflow` commands use: attaches to the signed-in Chrome profile (see `gflow auth login`).
export async function openFlowAutomation(options: SessionOptions = {}): Promise<{ automation: FlowAutomation; close(): Promise<void> }> {
  const session = await openBrowserSession({
    profile: options.profile ?? "default",
    headed: options.headed ?? true,
    browser: options.browser ?? DEFAULT_BROWSER_CHANNEL
  });
  const flow = new FlowPage(session.page);
  await flow.open();
  return { automation: flow, close: () => session.close() };
}
