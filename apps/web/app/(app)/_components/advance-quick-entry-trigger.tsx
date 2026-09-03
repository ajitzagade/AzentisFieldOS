"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AdvanceQuickEntryModal, Button, WalletIcon, useToast } from "@azentisfieldos/ui";
import { useAuthedFetch } from "@/lib/use-authed-fetch";
import { useClientValidation } from "@/lib/use-client-validation";
import { parseCreateAdvanceForm } from "@/app/(app)/team/[id]/advances/parse";
import { createAdvanceQuickAction } from "@/app/(app)/team/[id]/advances/actions";
import { TeamMemberQuickCreateModal } from "@/app/(app)/team/_components/team-member-quick-create-modal";

interface TeamMemberOption {
  id: string;
  name: string;
}

// Story 19.1: the Dashboard's one entry point into the shared
// AdvanceQuickEntryModal (packages/ui) — owns every client-only behavior
// the modal itself stays free of: open state, the on-open Team Member
// fetch (useAuthedFetch — never folded into OwnerDashboard's server-side
// parallel fetch, which must stay a server component per AD-3), the bound
// non-redirecting Server Action, client validation (AD-7, the same
// parseCreateAdvanceForm the action itself runs), and the success toast
// (this modal never navigates away, so it calls toast.success() directly
// instead of the ?flash= pattern — see flash-toast.tsx). On success it
// also calls router.refresh() — the Outstanding Advances figure this
// trigger sits on is a server-fetched value, so without it the Dashboard
// would keep showing the pre-entry total until an unrelated navigation.
// `size` defaults to "sm" (the Outstanding Advances card's compact action
// slot); Story 19.3's header quick-actions row passes "md" to match its
// sibling default-size buttons instead of looking visibly smaller.
export function AdvanceQuickEntryTrigger({ size = "sm" }: { size?: "sm" | "md" } = {}) {
  const [open, setOpen] = useState(false);
  // Bumped every time the modal is freshly opened so AdvanceQuickEntryModal
  // remounts (key={formKey}) — its internal useActionState/selection state
  // would otherwise outlive a close/reopen cycle and show a stale result.
  const [formKey, setFormKey] = useState(0);
  const [teamMembers, setTeamMembers] = useState<TeamMemberOption[]>([]);
  const [teamMembersLoading, setTeamMembersLoading] = useState(false);
  const [teamMembersError, setTeamMembersError] = useState<string | null>(null);
  const [teamMemberQuickCreateOpen, setTeamMemberQuickCreateOpen] = useState(false);
  // Seeds AdvanceQuickEntryModal's initial Team Member selection on the
  // remount its quick-created record forces (see onSuccess below) — that
  // modal's own `teamMemberId` is otherwise uncontrolled.
  const [newTeamMemberId, setNewTeamMemberId] = useState<string | undefined>(undefined);

  const authedFetch = useAuthedFetch();
  const toast = useToast();
  const router = useRouter();
  const validation = useClientValidation(parseCreateAdvanceForm);

  const loadTeamMembers = useCallback(
    async (signal: AbortSignal) => {
      setTeamMembersLoading(true);
      setTeamMembersError(null);
      try {
        const res = await authedFetch("/team-members", { signal });
        if (!res.ok) throw new Error(`Failed to load Team Members (${res.status})`);
        const data: unknown = await res.json();
        // A 2xx with a malformed (non-array) body must not reach
        // teamMembers.map() in the modal as a crash — degrade to the same
        // inline error state a network/HTTP failure shows.
        if (!Array.isArray(data)) throw new Error("Malformed Team Members response");
        if (!signal.aborted) setTeamMembers(data as TeamMemberOption[]);
      } catch {
        if (!signal.aborted) setTeamMembersError("Couldn't load Team Members");
      } finally {
        if (!signal.aborted) setTeamMembersLoading(false);
      }
    },
    [authedFetch],
  );

  // Fetches only while the modal is open, and aborts on close — no fetch
  // side effects linger once the user cancels (I/O matrix). The loading
  // flag setState at the top of loadTeamMembers runs synchronously here by
  // design (mirrors use-pwa-install.ts's precedent) — this effect exists
  // specifically to kick off that external fetch the moment `open` flips
  // true, and the combobox's loading state must be visible for the very
  // first render after that.
  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- see note above
    loadTeamMembers(controller.signal);
    return () => controller.abort();
  }, [open, loadTeamMembers]);

  const openedFromRef = useRef(0);
  function handleOpen() {
    openedFromRef.current += 1;
    setFormKey(openedFromRef.current);
    setNewTeamMemberId(undefined);
    setOpen(true);
  }

  return (
    <>
      <Button type="button" variant="secondary" size={size} onClick={handleOpen}>
        <WalletIcon className="size-4" />
        Record Advance
      </Button>
      <AdvanceQuickEntryModal
        key={formKey}
        open={open}
        onOpenChange={setOpen}
        teamMembers={teamMembers}
        teamMembersLoading={teamMembersLoading}
        teamMembersError={teamMembersError}
        action={createAdvanceQuickAction}
        onSubmit={validation.guard()}
        validationErrors={validation.errors}
        onSuccess={() => {
          toast.success("Advance recorded");
          setOpen(false);
          // The Outstanding Advances figure this trigger lives on was read
          // server-side by OwnerDashboard at request time — refresh so it
          // reflects the entry just recorded, without a full navigation.
          router.refresh();
        }}
        onCreateNewTeamMember={() => setTeamMemberQuickCreateOpen(true)}
        initialTeamMemberId={newTeamMemberId}
      />
      <TeamMemberQuickCreateModal
        open={teamMemberQuickCreateOpen}
        onOpenChange={setTeamMemberQuickCreateOpen}
        onSuccess={(teamMember) => {
          setTeamMembers((prev) => [teamMember, ...prev]);
          setNewTeamMemberId(teamMember.id);
          setTeamMemberQuickCreateOpen(false);
          // AdvanceQuickEntryModal's own Team Member selection is
          // uncontrolled — remount it (same key-bump convention as
          // reopening) so the fresh mount picks up initialTeamMemberId.
          openedFromRef.current += 1;
          setFormKey(openedFromRef.current);
        }}
      />
    </>
  );
}
