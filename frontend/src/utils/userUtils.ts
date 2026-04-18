/**
 * Get the profile image URL from user's profileImage field
 * @param user User object with profileImage field
 * @returns Profile image URL or null if not found
 */
export const getProfileImageUrl = (user: any): string | null => {
  if (!user || !user.profileImage) {
    return null;
  }

  // If path starts with /, it's relative to the backend server (but NOT under /api)
  if (user.profileImage.startsWith("/")) {
    // Get base URL without /api suffix
    const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
    // Remove /api if it exists at the end
    const cleanBaseUrl = baseUrl.replace(/\/api\/?$/, "");
    return `${cleanBaseUrl}${user.profileImage}`;
  }
  
  return user.profileImage;
};

/**
 * Get user's initials for avatar display
 * @param user User object with firstName and lastName
 * @returns Initials (e.g., "JD" for John Doe)
 */
export const getUserInitials = (user: any): string => {
  if (!user) return "";

  const firstName = user.firstName || "";
  const lastName = user.lastName || "";

  if (firstName && lastName) {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  }

  if (firstName) {
    return firstName.substring(0, 2).toUpperCase();
  }

  if (user.email) {
    return user.email.substring(0, 2).toUpperCase();
  }

  return "?";
};

/**
 * Check if user is verified
 * @param user User object with profileCompletionStatus
 * @returns true if user is verified
 */
export const isUserVerified = (user: any): boolean => {
  return user?.profileCompletionStatus === "verified";
};

