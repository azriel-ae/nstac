import { describe, expect, it } from "vitest";
import { compareReceiptRows } from "./receiptCompare";
import type { ReceiptRow } from "./receiptParser";
const row = (no_struk: string, paid_amount: string): ReceiptRow => ({ id_agent: "", no_struk, date_trans: "01-Aug-2026", subtotal: "65000", service_charge: "0", discount: "0", dpp: "", tax: "6500", paid_amount, total: "", keterangan: "", status: "NORMAL", sourceIndex: 1 });
describe("receipt compare full parsed dataset", () => {
  it("compares every no_struk and uses paid amount as effective total", () => {
    const result = compareReceiptRows([row("A", "71500"), row("B", "100")], [row("A", "72000"), row("B", "100")]);
    expect(result.rows).toHaveLength(2);
    expect(result.summary).toMatchObject({ file1: 2, file2: 2, same: 1, different: 1 });
    expect(result.rows.find((item) => item.no_struk === "A")?.differences).toContain("paid_amount");
    expect(result.rows.find((item) => item.no_struk === "A")?.differences).toContain("total");
  });
});
