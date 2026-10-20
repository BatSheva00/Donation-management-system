export function isGuestRequest(req: { user?: { userId?: string } }): boolean {
  return !req.user?.userId;
}

function publicPerson(value: unknown): unknown {
  if (!value || typeof value !== "object") {
    return value;
  }
  const person = value as Record<string, unknown>;
  return {
    _id: person._id,
    firstName: person.firstName,
    lastName: person.lastName,
    name: person.name,
    role: person.role,
    profileCompletionStatus: person.profileCompletionStatus,
  };
}

export function sanitizeRequestForGuest<T extends Record<string, unknown>>(
  request: T
): T {
  const copy = JSON.parse(JSON.stringify(request)) as T & {
    notes?: unknown;
    deliveryAddress?: unknown;
    requesterId?: unknown;
    fulfilledBy?: unknown;
    assignedDriverId?: unknown;
  };

  delete copy.notes;
  delete copy.deliveryAddress;
  copy.requesterId = publicPerson(copy.requesterId);
  copy.fulfilledBy = publicPerson(copy.fulfilledBy);
  copy.assignedDriverId = publicPerson(copy.assignedDriverId);
  return copy;
}
