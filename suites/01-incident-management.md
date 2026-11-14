# Suite 1 — ITSM: Incident Management

**ATF suite name:** `ITSM - Incident Management`
**Tests:** 6, including 1 parameterized test with 3 data rows
**Roles used:** `itil` (agent) and no roles (requester)

ATF rolls back every record created during a test, so the suite leaves the instance clean and can run in any order.

---

## INC-01 — ITIL user creates an incident

**Objective:** an agent can raise an incident from the form, and the server applies the expected defaults.

| # | Step | Configuration | Expected |
|---|---|---|---|
| 1 | Create a User | First/last name `ATF Agent`, Roles `itil`, Impersonate ✔ | User created and impersonated |
| 2 | Open a New Form | Table `incident` | Form opens |
| 3 | Set Field Values | Caller `Abel Tuter`, Short description `ATF INC-01 printer offline`, Category `Hardware` | |
| 4 | Field Values Validation | State = `New` | Default shown on the form |
| 5 | Submit a Form | Assert: form submitted to server | Record saved |
| 6 | Run Server Side Script | [`INC-01_assert_new_incident.js`](../scripts/server-side-steps/incident/INC-01_assert_new_incident.js) | Number starts `INC`, state New, opened_by = agent |

## INC-02 — Assignment rule routes Network incidents

**Objective:** an incident with category *Network* and no group is assigned to the **Network** group by the assignment rule.

| # | Step | Configuration | Expected |
|---|---|---|---|
| 1 | Create a User | `ATF Agent`, Roles `itil`, Impersonate ✔ | |
| 2 | Open a New Form | `incident` | |
| 3 | Set Field Values | Caller `Abel Tuter`, Category `Network`, Short description `ATF INC-02 VPN down`, Assignment group *empty* | |
| 4 | Submit a Form | Assert: form submitted to server | |
| 5 | Run Server Side Script | [`INC-02_assert_assignment_rule.js`](../scripts/server-side-steps/incident/INC-02_assert_assignment_rule.js) | Assignment group = Network |

## INC-03 — Priority from Impact × Urgency (parameterized)

**Objective:** the priority lookup gives the right priority for each impact/urgency combination. The same steps run for each data row.

**Test type:** Parameterized test. **Exclusive parameters:** `impact`, `urgency`, `expected_priority`.

| Data row | impact | urgency | expected_priority |
|---|---|---|---|
| P1 Critical | 1 | 1 | 1 |
| P3 Moderate | 2 | 2 | 3 |
| P5 Planning | 3 | 3 | 5 |

| # | Step | Configuration | Expected |
|---|---|---|---|
| 1 | Create a User | `ATF Agent`, Roles `itil`, Impersonate ✔ | |
| 2 | Open a New Form | `incident` | |
| 3 | Set Field Values | Caller `Abel Tuter`, Short description `ATF INC-03`, Impact `{{parameter.impact}}`, Urgency `{{parameter.urgency}}` | |
| 4 | Field Values Validation | Priority = `{{parameter.expected_priority}}` | Client-side calculation correct |
| 5 | Submit a Form | Assert: form submitted to server | |
| 6 | Run Server Side Script | [`INC-03_assert_priority_parameterized.js`](../scripts/server-side-steps/incident/INC-03_assert_priority_parameterized.js) | Stored priority = expected |

## INC-04 — Resolving requires resolution code and notes (UI policy, negative + positive)

**Objective:** the UI policy makes *Resolution code* and *Resolution notes* mandatory when the state is Resolved, and the form cannot be saved without them.

| # | Step | Configuration | Expected |
|---|---|---|---|
| 1 | Create a User | `ATF Agent`, Roles `itil`, Impersonate ✔ | |
| 2 | Open a New Form | `incident` | |
| 3 | Set Field Values | Caller `Abel Tuter`, Short description `ATF INC-04` | |
| 4 | Field State Validation | Resolution code, Resolution notes: **not mandatory** | Not mandatory while New |
| 5 | Set Field Values | State `Resolved` | |
| 6 | Field State Validation | Resolution code, Resolution notes: **mandatory** | UI policy fired |
| 7 | Submit a Form | Assert: **form submission canceled in browser** | **Negative:** blocked |
| 8 | Set Field Values | Resolution code `Solution provided`*, Resolution notes `Fixed by ATF` | |
| 9 | Submit a Form | Assert: form submitted to server | Saved |
| 10 | Assert Record Matches Condition *(custom)* | Table `incident`, Record = step 9, Condition `state=6^close_codeISNOTEMPTY^close_notesISNOTEMPTY^resolved_byISNOTEMPTY` | Matches |

\* Resolution code values differ between releases. Pick any valid value in your instance.

## INC-05 — Lifecycle New → In Progress → On Hold → In Progress → Resolved

**Objective:** the incident passes through the expected states. The audit history proves the path, not just the end state.

| # | Step | Configuration | Expected |
|---|---|---|---|
| 1 | Create a User | `ATF Agent`, Roles `itil`, Impersonate ✔ | |
| 2 | Open a New Form | `incident` | |
| 3 | Set Field Values | Caller `Abel Tuter`, Short description `ATF INC-05` | |
| 4 | Submit a Form | | State New |
| 5 | Open an Existing Record | `incident`, record = step 4 | |
| 6 | Set Field Values | State `In Progress` | |
| 7 | Submit a Form | | |
| 8 | Open an Existing Record | record = step 4 | |
| 9 | Set Field Values | State `On Hold`, On hold reason `Awaiting Caller` | |
| 10 | Submit a Form | | |
| 11 | Open an Existing Record | record = step 4 | |
| 12 | Set Field Values | State `In Progress` | |
| 13 | Submit a Form | | |
| 14 | Open an Existing Record | record = step 4 | |
| 15 | Set Field Values | State `Resolved`, Resolution code, Resolution notes | |
| 16 | Submit a Form | | |
| 17 | Run Server Side Script | [`INC-05_assert_lifecycle_audit.js`](../scripts/server-side-steps/incident/INC-05_assert_lifecycle_audit.js) | Path `1->2, 2->3, 3->2, 2->6`, resolved_by/at set |

## INC-06 — Requester can only read their own incidents (role-based access, negative)

**Objective:** a user with no roles sees an incident where they are the caller, and does **not** see someone else's.

| # | Step | Configuration | Expected |
|---|---|---|---|
| 1 | Create a User | `ATF Requester`, no roles, Impersonate ✘ | |
| 2 | Record Insert | `incident`: Caller = step 1 user, Short description `ATF INC-06 own` | |
| 3 | Record Insert | `incident`: Caller `Abel Tuter`, Short description `ATF INC-06 other` | |
| 4 | Impersonate | User = step 1 | |
| 5 | Run Server Side Script | [`INC-06_assert_requester_access.js`](../scripts/server-side-steps/incident/INC-06_assert_requester_access.js) | Own: 1 row visible, other: 0 rows |
