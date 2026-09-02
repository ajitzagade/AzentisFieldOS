import { useState } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SearchPalette, type SearchResultGroup } from "./search-palette";

const SITE_GROUP: SearchResultGroup = {
  key: "sites",
  label: "Sites",
  items: [
    { id: "s1", label: "Nashik Metro", description: "Nashik" },
    { id: "s2", label: "Nashik Bypass", description: "Nashik" },
  ],
  total: 5,
};

const MATERIAL_GROUP: SearchResultGroup = {
  key: "materials",
  label: "Materials",
  items: [{ id: "m1", label: "Cement", description: "Binders" }],
  total: 1,
};

function Harness(props: Partial<React.ComponentProps<typeof SearchPalette>>) {
  const [open, setOpen] = useState(true);
  const [query, setQuery] = useState(props.query ?? "");
  return (
    <SearchPalette
      open={open}
      onOpenChange={setOpen}
      query={query}
      onQueryChange={setQuery}
      groups={[]}
      onSelect={vi.fn()}
      onSeeAll={vi.fn()}
      {...props}
    />
  );
}

describe("SearchPalette", () => {
  it("renders nothing below the input when the query is empty", async () => {
    render(<Harness query="" groups={[SITE_GROUP]} />);

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(screen.queryByText("Nashik Metro")).not.toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("shows a searching status while loading with a non-empty query", async () => {
    render(<Harness query="cement" loading groups={[]} />);

    expect(await screen.findByRole("status")).toHaveTextContent(/searching/i);
  });

  it("shows an error message when error is set", async () => {
    render(<Harness query="cement" error="Search failed" groups={[]} />);

    expect(await screen.findByRole("alert")).toHaveTextContent("Search failed");
  });

  it('shows "No results" when loaded with zero matches across all groups', async () => {
    render(
      <Harness
        query="zzz"
        groups={[
          { key: "sites", label: "Sites", items: [], total: 0 },
          { key: "materials", label: "Materials", items: [], total: 0 },
        ]}
      />,
    );

    expect(await screen.findByText(/no results/i)).toBeInTheDocument();
  });

  it('renders groups with a "See all N results" action when more results exist than shown', async () => {
    render(<Harness query="nashik" groups={[SITE_GROUP, MATERIAL_GROUP]} />);

    expect(await screen.findByText("Sites")).toBeInTheDocument();
    expect(screen.getByText("Nashik Metro")).toBeInTheDocument();
    expect(screen.getByText("Materials")).toBeInTheDocument();
    expect(screen.getByText("Cement")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /see all 5 results/i })).toBeInTheDocument();
    // Materials group has exactly as many items as its total — no "See all".
    expect(screen.queryByRole("button", { name: /see all 1 result/i })).not.toBeInTheDocument();
  });

  it("calls onSelect with the group key and item when a result is clicked", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<Harness query="nashik" groups={[SITE_GROUP]} onSelect={onSelect} />);

    await user.click(await screen.findByText("Nashik Metro"));

    expect(onSelect).toHaveBeenCalledWith("sites", SITE_GROUP.items[0]);
  });

  it('calls onSeeAll with the group key when "See all" is clicked', async () => {
    const user = userEvent.setup();
    const onSeeAll = vi.fn();
    render(<Harness query="nashik" groups={[SITE_GROUP]} onSeeAll={onSeeAll} />);

    await user.click(await screen.findByRole("button", { name: /see all 5 results/i }));

    expect(onSeeAll).toHaveBeenCalledWith("sites");
  });

  it('renders an icon tile for a row that has one, tinted by default and solid for a "solid" tone group', async () => {
    render(
      <Harness
        query="nashik"
        groups={[
          { key: "sites", label: "Sites", items: [{ id: "s1", label: "Nashik Metro", icon: <span data-testid="site-icon" /> }], total: 1 },
          {
            key: "actions",
            label: "Actions",
            tone: "solid",
            items: [{ id: "a1", label: "Record Advance", icon: <span data-testid="action-icon" /> }],
            total: 1,
          },
        ]}
      />,
    );

    const siteTile = (await screen.findByTestId("site-icon")).parentElement;
    expect(siteTile).toHaveClass("bg-accent-teal-100");

    const actionTile = screen.getByTestId("action-icon").parentElement;
    expect(actionTile).toHaveClass("bg-accent-teal-700");
  });

  it('never renders "See all" for a "solid" tone group, even when total exceeds the item count', async () => {
    render(
      <Harness
        query="add"
        groups={[
          {
            key: "actions",
            label: "Actions",
            tone: "solid",
            items: [{ id: "a1", label: "Add Vendor" }],
            total: 9,
          },
        ]}
      />,
    );

    expect(await screen.findByText("Add Vendor")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /see all/i })).not.toBeInTheDocument();
  });

  it("moves focus from the input to the first result on ArrowDown, and back on ArrowUp", async () => {
    const user = userEvent.setup();
    render(<Harness query="nashik" groups={[SITE_GROUP]} />);

    const input = await screen.findByRole("textbox");
    input.focus();
    await user.keyboard("{ArrowDown}");
    await waitFor(() => expect(screen.getByText("Nashik Metro").closest("button")).toHaveFocus());

    await user.keyboard("{ArrowDown}");
    expect(screen.getByText("Nashik Bypass").closest("button")).toHaveFocus();

    await user.keyboard("{ArrowUp}");
    expect(screen.getByText("Nashik Metro").closest("button")).toHaveFocus();

    await user.keyboard("{ArrowUp}");
    expect(input).toHaveFocus();
  });
});
