# Golden fixtures

Expected outputs written by hand from the brief and the agreed assumptions **before any domain
code existed**. Tests import these files; they are never regenerated from the implementation.

`asOf` is fixed at **2026-11-05** (the brief's deadline) unless a case says otherwise.

## Maya (profile A) — field by field

| Harbor field              | Expected           | Source    | Why                                                                                                                                                                                       |
| ------------------------- | ------------------ | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `applicant_full_name`     | `Maya Torres`      | converted | `first_name` + `last_name`; editable because the profile name may not be the legal name (A6)                                                                                              |
| `date_of_birth`           | `03/12/1994`       | converted | `1994-03-12` → Harbor's `MM/DD/YYYY`                                                                                                                                                      |
| `contact_email`           | `maya@example.com` | profile   | Same meaning, copied                                                                                                                                                                      |
| `phone`                   | —                  | ask       | Not in the profile                                                                                                                                                                        |
| `residence_state`         | `Oregon`           | converted | `OR` → Harbor's option label                                                                                                                                                              |
| `postal_code`             | `97205`            | profile   | 5 digits already match Harbor's pattern                                                                                                                                                   |
| `contents_coverage`       | —                  | ask       | Look-alike: belongings are worth $32,000, which isn't coverage and isn't one of Harbor's amounts. The customer picks; the hint shows the property value (A1, changed by owner 2026-11-05) |
| `pets`                    | `["Dog"]`          | suggested | Look-alike: `has_dog: true` proves Dog is in the set, not that it's the only pet; customer confirms (A2)                                                                                  |
| `dog_breed`               | `Labrador`         | profile   | Exact option match; shown because pets includes Dog (A7)                                                                                                                                  |
| `claims_last_5_years`     | —                  | ask       | Look-alike: a 3-year count can't answer a 5-year question; hint shows the 3-year count (A3)                                                                                               |
| `building_has_sprinklers` | —                  | ask       | Not in the profile; optional                                                                                                                                                              |

Sections (O6): About you · Your home · Coverage · Pets · Claims history — date of birth on page 1.

## Maya — quote requests

1. Picks 50,000 coverage, confirms Dog, phone `503-555-0142` (sent as typed — Harbor states no format), 0 claims,
   sprinklers left blank → **sprinklers omitted** (A8).
2. Changes pets to `Cat` → `dog_breed` is hidden by `showIf`, so it is **dropped** even though a value
   is still held (I1); sprinklers answered `true` → included.

## Eligibility

| Case | asOf       | Expected                                  | Why                                                                                                            |
| ---- | ---------- | ----------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Maya | 2026-11-05 | eligible                                  | Age 32 ≥ 21; Oregon is served                                                                                  |
| Sam  | 2026-11-05 | ineligible: `min_age`, `state_not_served` | Age 20 < 21 (Harbor `minAge`); Nevada isn't one of Harbor's 4 states (A4). **All** reasons, in form order (A9) |
| Sam  | 2027-02-01 | ineligible: `state_not_served`            | Turned 21 on 2027-01-20 — proves `asOf` is honoured (A5)                                                       |

Reason `message` text is not fixed here — only `code` and `field` — so wording can change without
breaking the contract.
