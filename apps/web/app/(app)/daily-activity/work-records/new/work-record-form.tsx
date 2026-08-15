"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Badge, Button, Card, SelectField, TextField } from "@azentisfieldos/ui";

interface SiteOption {
  id: string;
  name: string;
}

interface TeamMemberOption {
  id: string;
  name: string;
}

interface CrewRow {
  teamMemberId: string;
  name: string;
  attended: boolean;
  hours: string;
  overtimeHours: string;
}

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

export function WorkRecordForm({ sites, teamMembers }: { sites: SiteOption[]; teamMembers: TeamMemberOption[] }) {
  const router = useRouter();

  const [siteId, setSiteId] = useState("");
  const [workDate, setWorkDate] = useState(todayDate());
  const [crew, setCrew] = useState<CrewRow[]>([]);
  const [newMemberId, setNewMemberId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [crewFetchError, setCrewFetchError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // AC #2: defaulted from the most recent prior date this Site had any
  // attendance recorded, not literally the calendar-previous day. Every
  // returned crew member defaults to Present (checked), regardless of
  // whether they were marked present or absent on that prior date — this
  // is who's expected to work today; the supervisor unchecks anyone who's
  // actually a no-show, rather than the form silently carrying forward a
  // stale, unrelated day's absence.
  useEffect(() => {
    if (!siteId || !workDate) return;
    let cancelled = false;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/work-records/default-crew?siteId=${siteId}&date=${workDate}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load default crew (${res.status})`);
        return res.json() as Promise<{ teamMemberId: string; name: string; attended: boolean }[]>;
      })
      .then((defaults) => {
        if (cancelled) return;
        setCrew(defaults.map((d) => ({ teamMemberId: d.teamMemberId, name: d.name, attended: true, hours: "", overtimeHours: "" })));
        setCrewFetchError(false);
      })
      .catch(() => {
        if (cancelled) return;
        setCrew([]);
        setCrewFetchError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [siteId, workDate]);

  function toggleAttended(teamMemberId: string) {
    setCrew((rows) => rows.map((r) => (r.teamMemberId === teamMemberId ? { ...r, attended: !r.attended } : r)));
  }

  function updateHours(teamMemberId: string, field: "hours" | "overtimeHours", value: string) {
    setCrew((rows) => rows.map((r) => (r.teamMemberId === teamMemberId ? { ...r, [field]: value } : r)));
  }

  function addCrewMember() {
    const member = teamMembers.find((t) => t.id === newMemberId);
    if (!member || crew.some((r) => r.teamMemberId === member.id)) return;
    setCrew((rows) => [...rows, { teamMemberId: member.id, name: member.name, attended: true, hours: "", overtimeHours: "" }]);
    setNewMemberId("");
  }

  const availableToAdd = teamMembers.filter((t) => !crew.some((r) => r.teamMemberId === t.id));

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const payload = crew.map((row) => ({
        teamMemberId: row.teamMemberId,
        siteId,
        workDate,
        attended: row.attended,
        hours: row.attended && row.hours ? Number(row.hours) : undefined,
        overtimeHours: row.attended && row.overtimeHours ? Number(row.overtimeHours) : undefined,
      }));

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/work-records/batch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.status === 409) {
        const body = (await res.json()) as { message?: string };
        setError(body.message ?? "One of these Team Members already has a Work Record for this date.");
        return;
      }

      if (!res.ok) {
        setError("Something went wrong recording attendance. Please try again.");
        return;
      }

      router.push("/team");
    } catch {
      setError("Something went wrong recording attendance. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card className="mb-4">
        <SelectField
          label="Site"
          required
          value={siteId}
          onChange={(e) => setSiteId(e.target.value)}
          options={[{ value: "", label: "Select a Site" }, ...sites.map((s) => ({ value: s.id, label: s.name }))]}
        />
        <TextField label="Date" type="date" required value={workDate} onChange={(e) => setWorkDate(e.target.value)} />
      </Card>

      <Card className="mb-4">
        <h2 className="mb-3 text-card-title text-ink-900">Labour present</h2>
        {crew.length === 0 && crewFetchError ? (
          <p role="alert" className="mb-3 text-body-sm text-danger-700">
            Couldn&apos;t load the default crew for this Site and Date. You can still add Team Members below.
          </p>
        ) : null}
        {crew.length === 0 && !crewFetchError ? (
          <p className="mb-3 text-body-sm text-ink-500">No crew defaulted yet — select a Site and Date, or add a Team Member below.</p>
        ) : null}
        <ul className="mb-3 flex flex-col gap-2">
          {crew.map((row) => (
            <li key={row.teamMemberId} className="flex flex-wrap items-center gap-2">
              <input
                type="checkbox"
                id={`crew-${row.teamMemberId}`}
                checked={row.attended}
                onChange={() => toggleAttended(row.teamMemberId)}
                className="size-4 accent-accent-teal-700"
              />
              <label htmlFor={`crew-${row.teamMemberId}`} className="text-body-sm text-ink-900">
                {row.name}
              </label>
              {row.attended ? <Badge variant="success">Present</Badge> : <Badge variant="neutral">Absent</Badge>}
              {row.attended ? (
                <div className="ml-auto flex gap-2">
                  <input
                    type="number"
                    step="any"
                    min={0}
                    placeholder="Hours"
                    aria-label={`Hours for ${row.name}`}
                    value={row.hours}
                    onChange={(e) => updateHours(row.teamMemberId, "hours", e.target.value)}
                    className="w-24 rounded-md border border-border-strong bg-surface-1 px-2 py-1 text-body-sm text-ink-900"
                  />
                  <input
                    type="number"
                    step="any"
                    min={0}
                    placeholder="OT hours"
                    aria-label={`Overtime hours for ${row.name}`}
                    value={row.overtimeHours}
                    onChange={(e) => updateHours(row.teamMemberId, "overtimeHours", e.target.value)}
                    className="w-24 rounded-md border border-border-strong bg-surface-1 px-2 py-1 text-body-sm text-ink-900"
                  />
                </div>
              ) : null}
            </li>
          ))}
        </ul>
        <div className="flex items-end gap-2">
          <SelectField
            label="Add Team Member"
            value={newMemberId}
            onChange={(e) => setNewMemberId(e.target.value)}
            options={[{ value: "", label: "Select a Team Member" }, ...availableToAdd.map((t) => ({ value: t.id, label: t.name }))]}
            className="flex-1"
          />
          <Button type="button" variant="secondary" onClick={addCrewMember}>
            Add
          </Button>
        </div>
      </Card>

      {error ? (
        <p role="alert" className="mb-4 text-caption text-danger-700">
          {error}
        </p>
      ) : null}

      <Button type="submit" isLoading={isSubmitting} disabled={!siteId || crew.length === 0} className="w-full justify-center">
        Save Attendance
      </Button>
    </form>
  );
}
