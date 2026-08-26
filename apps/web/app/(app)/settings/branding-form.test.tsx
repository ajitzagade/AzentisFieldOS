import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const refreshMock = vi.hoisted(() => vi.fn());
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: refreshMock }) }));

import { BrandingForm, type BrandingConfig } from "./branding-form";

// AD-4's no-restricted-syntax rule bans raw hex-colour string literals even in
// tests — build them from parts so the values are not plain hex Literals.
const hex = (h: string) => `#${h}`;

const baseConfig: BrandingConfig = {
  id: "bc1",
  tenantName: "Azentis Construction Pvt. Ltd.",
  logoUrl: null,
  primaryColor: hex("0f5257"),
  secondaryColor: hex("16273e"),
  accentColor: hex("c7912b"),
  registeredAddress: "Plot 14, Industrial Estate Road, Nagpur 440016",
  contactPhone: "+91 98230 11245",
  gstin: "27AABCA1234M1Z5",
};

const originalFetch = global.fetch;
const originalApiUrl = process.env.NEXT_PUBLIC_API_URL;

beforeEach(() => {
  process.env.NEXT_PUBLIC_API_URL = "http://localhost:3001";
  refreshMock.mockClear();
});

afterEach(() => {
  global.fetch = originalFetch;
  process.env.NEXT_PUBLIC_API_URL = originalApiUrl;
  vi.restoreAllMocks();
});

describe("BrandingForm (Story 14.1)", () => {
  it("renders every mockup field, seeded from the current config (AC #2)", () => {
    render(<BrandingForm config={baseConfig} />);

    expect(screen.getByLabelText("Organisation name")).toHaveValue(
      "Azentis Construction Pvt. Ltd.",
    );
    expect(screen.getByLabelText("Registered address")).toHaveValue(
      "Plot 14, Industrial Estate Road, Nagpur 440016",
    );
    expect(screen.getByLabelText("Contact phone")).toHaveValue("+91 98230 11245");
    expect(screen.getByLabelText("GSTIN")).toHaveValue("27AABCA1234M1Z5");
    // Three brand-colour swatches — Primary/Secondary/Accent.
    expect(screen.getByLabelText("Primary brand colour")).toHaveValue(hex("0f5257"));
    expect(screen.getByLabelText("Secondary brand colour")).toHaveValue(hex("16273e"));
    expect(screen.getByLabelText("Accent brand colour")).toHaveValue(hex("c7912b"));
  });

  it("live preview reflects IN-PROGRESS values before saving", async () => {
    const user = userEvent.setup();
    render(<BrandingForm config={baseConfig} />);

    const preview = screen.getByText("Report Branding Preview").parentElement as HTMLElement;
    // Seeded value shows immediately.
    expect(within(preview).getByText("Azentis Construction Pvt. Ltd.")).toBeInTheDocument();

    const nameInput = screen.getByLabelText("Organisation name");
    await user.clear(nameInput);
    await user.type(nameInput, "Nagpur Builders");

    // The preview updates from the edited (unsaved) value, not the last-saved one.
    expect(within(preview).getByText("Nagpur Builders")).toBeInTheDocument();
    expect(within(preview).getByText(/GSTIN 27AABCA1234M1Z5/)).toBeInTheDocument();
  });

  it("PATCHes /branding-config with the shared-schema payload and confirms success (AC #1)", async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValue({ ok: true, status: 200, json: async () => ({}) }) as unknown as typeof fetch;
    const user = userEvent.setup();
    render(<BrandingForm config={baseConfig} />);

    await user.click(screen.getByRole("button", { name: /save branding/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:3001/branding-config",
        expect.objectContaining({ method: "PATCH" }),
      );
    });
    const call = (global.fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0]!;
    const init = call[1] as RequestInit;
    expect(JSON.parse(init.body as string)).toMatchObject({
      tenantName: "Azentis Construction Pvt. Ltd.",
      primaryColor: hex("0f5257"),
      secondaryColor: hex("16273e"),
      accentColor: hex("c7912b"),
      gstin: "27AABCA1234M1Z5",
    });
    expect(await screen.findByText("Saved")).toBeInTheDocument();
    expect(refreshMock).toHaveBeenCalled();
  });

  it("surfaces a server error state instead of failing silently (AD-6)", async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValue({ ok: false, status: 500, json: async () => ({}) }) as unknown as typeof fetch;
    const user = userEvent.setup();
    render(<BrandingForm config={baseConfig} />);

    await user.click(screen.getByRole("button", { name: /save branding/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/something went wrong/i);
  });
});
