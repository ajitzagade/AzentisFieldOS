"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { BuildingIcon, Button, Card, FilterIcon, GearIcon, HashIcon, LayersIcon, PlusIcon, SelectField, TextField, UserIcon } from "@azentisfieldos/ui";
import { createMachineryAction, type CreateMachineryFormState } from "./actions";
import { useClientValidation } from "@/lib/use-client-validation";
import { parseCreateMachineryForm } from "./parse";

interface Option {
  id: string;
  name: string;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" isLoading={pending}>
      <PlusIcon className="size-4" />
      Register Machine
    </Button>
  );
}

const initialState: CreateMachineryFormState = {};

export function NewMachineryForm({ machineryTypes }: { machineryTypes: Option[] }) {
  const [state, formAction] = useActionState(createMachineryAction, initialState);
  // Inline pre-submit validation via the same parse the Server Action runs (AD-7).
  const validation = useClientValidation(parseCreateMachineryForm);
  const errorFor = (field: string) => validation.errors[field]?.[0] ?? state.errors?.[field]?.[0];

  if (machineryTypes.length === 0) {
    return (
      <Card>
        <p className="mb-3 text-body-sm text-ink-500">
          No Machinery Types yet —{" "}
          <Link href="/machinery-vehicles/machinery-types" className="font-semibold text-accent-teal-700 underline">
            create one first
          </Link>
          .
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <form action={formAction} onSubmit={validation.guard()} noValidate>
        <TextField
          label="Name"
          name="name"
          required
          maxLength={200}
          icon={<LayersIcon className="size-4" />}
          placeholder="e.g. Excavator EXC-01"
          error={errorFor("name")}
        />
        <SelectField
          label="Type"
          name="typeId"
          required
          defaultValue=""
          icon={<FilterIcon className="size-4" />}
          options={[
            { value: "", label: "Select a Machinery Type" },
            ...machineryTypes.map((t) => ({ value: t.id, label: t.name })),
          ]}
          error={errorFor("typeId")}
        />
        <TextField
          label="Asset / Registration Number"
          name="assetNumber"
          required
          maxLength={100}
          icon={<HashIcon className="size-4" />}
          error={errorFor("assetNumber")}
        />
        <TextField label="Model" name="model" hint="Optional" maxLength={200} icon={<GearIcon className="size-4" />} error={errorFor("model")} />
        <TextField label="Ownership" name="ownership" hint="Optional" maxLength={200} icon={<BuildingIcon className="size-4" />} placeholder="e.g. Owned, Rented" error={errorFor("ownership")} />
        <TextField
          label="Operator"
          name="operator"
          hint="Optional"
          maxLength={200}
          icon={<UserIcon className="size-4" />}
          error={errorFor("operator")}
        />

        {state.formError ? (
          <p role="alert" className="mb-4 text-caption text-danger-700">
            {state.formError}
          </p>
        ) : null}

        <SubmitButton />
      </form>
    </Card>
  );
}
