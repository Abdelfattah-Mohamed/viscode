type OperationResult = { error?: string; status?: number };

type SubscriptionLookupResult = OperationResult & {
  stripeSubscriptionId: string | null;
};

type DeleteAccountDeps = {
  getStripeSubscriptionId: (userId: string) => Promise<SubscriptionLookupResult>;
  cancelStripeSubscription: (stripeSubscriptionId: string) => Promise<OperationResult>;
  deleteAuthUser: (userId: string) => Promise<OperationResult>;
};

type DeleteAccountResult =
  | { ok: true; status: number }
  | { error: string; status: number };

export async function deleteAccountForUser(
  userId: string,
  deps: DeleteAccountDeps
): Promise<DeleteAccountResult> {
  const subscription = await deps.getStripeSubscriptionId(userId);
  if (subscription.error) {
    return { error: subscription.error, status: subscription.status ?? 500 };
  }

  if (subscription.stripeSubscriptionId) {
    const cancelResult = await deps.cancelStripeSubscription(subscription.stripeSubscriptionId);
    if (cancelResult.error) {
      return { error: cancelResult.error, status: cancelResult.status ?? 502 };
    }
  }

  const deleteResult = await deps.deleteAuthUser(userId);
  if (deleteResult.error) {
    return { error: deleteResult.error, status: deleteResult.status ?? 500 };
  }

  return { ok: true, status: 200 };
}
