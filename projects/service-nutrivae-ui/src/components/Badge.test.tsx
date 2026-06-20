import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Badge } from "./Badge";

describe("Badge", () => {
  it("renders its label", () => {
    render(<Badge tone="green">active</Badge>);
    expect(screen.getByText("active")).toBeInTheDocument();
  });
});
