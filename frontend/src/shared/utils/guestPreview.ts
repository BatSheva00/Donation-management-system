const PREVIEW_KEY = "kindloop_guest_preview_id";

export const getGuestPreviewId = (): string | null => {
  try {
    return localStorage.getItem(PREVIEW_KEY);
  } catch {
    return null;
  }
};

/** Guests may fully open a single donation. Returns false for any other item. */
export const claimGuestPreview = (donationId: string): boolean => {
  const existing = getGuestPreviewId();
  if (!existing) {
    try {
      localStorage.setItem(PREVIEW_KEY, donationId);
    } catch {
      // Private mode — still allow this first view in-memory
    }
    return true;
  }
  return existing === donationId;
};
