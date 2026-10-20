import rtlPluginImport from "stylis-plugin-rtl";

type StylisPlugin = (
  element: { children?: unknown; return?: string },
  index: number,
  children: unknown,
  callback: unknown
) => void;

const inner: StylisPlugin | undefined =
  typeof rtlPluginImport === "function"
    ? (rtlPluginImport as StylisPlugin)
    : ((rtlPluginImport as { default?: StylisPlugin }).default);

export const safeRtlPlugin: StylisPlugin = (
  element,
  index,
  children,
  callback
) => {
  if (typeof inner !== "function") {
    return;
  }
  try {
    inner(element, index, children, callback);
  } catch {
    // Leave the original CSS when Janus cannot flip a rule (common on iOS).
  }
};
