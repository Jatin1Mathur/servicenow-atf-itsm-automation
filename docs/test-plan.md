# Test plan — ServiceNow ITSM regression with ATF

## 1. Scope

| In scope | Out of scope |
|---|---|
| Incident: creation, assignment rule, priority lookup, resolve UI policy, state lifecycle, read ACLs | Notifications and email content |
| Change: normal change Assess transition, approval generation, rejection, state model | CAB workbench, conflict detection, standard change templates |
| Service Catalog: variables, mandatory checks, REQ/RITM creation, manager approval, fulfilment task, rejection | Pricing, cart with multiple items, Service Portal UI |

## 2. Approach

- **Automation tool:** ServiceNow Automated Test Framework, with UI steps run through the Client Test Runner and server steps.
- **Test design:** every requirement gets a positive test, and a negative test wherever a rule blocks something (mandatory fields, ACLs, state model, rejection).
- **Users:** tests create their own users with the exact roles they need, then impersonate them. Tests never run as admin, so ACLs and UI policies behave as they do in production.
- **Data:** each test creates its own data, and ATF rolls it back after the run. This means there are no dependencies between tests.
- **Asynchronous logic:** flows and approvals are awaited with the polling step *Wait for Record Count*, not with fixed sleeps.
- **Assertions:** UI steps check what the user sees. Server steps check what is stored (state, audit trail, related records).

## 3. Traceability

| Requirement | Test(s) | Type |
|---|---|---|
| Agents can raise incidents with correct defaults | INC-01 | Positive |
| Network incidents route to the Network group | INC-02 | Positive |
| Priority follows the impact × urgency matrix | INC-03 (3 data rows) | Parameterized |
| Resolution code/notes mandatory on resolve | INC-04 | Negative + positive |
| Incident follows the defined lifecycle | INC-05 | Positive (audit-based) |
| Requesters read only their own incidents | INC-06 | Negative (ACL) |
| Normal change goes to Assess and requests approval | CHG-01 | Positive |
| Change states cannot be skipped | CHG-02 | Negative |
| Rejected change returns to New | CHG-03 | Negative path |
| Catalog item enforces mandatory variables | CAT-01 | Negative |
| Order creates REQ/RITM and stores variables | CAT-02 | Positive |
| Approved request creates a fulfilment task | CAT-03 | Positive |
| Rejected request closes without a task | CAT-04 | Negative path |

## 4. Entry and exit criteria

**Entry:** setup script run, flow active, Client Test Runner open, and the ATF runner property set to true.

**Exit:** all 13 tests pass, or every failure has a logged defect with reproduction steps and an agreed priority.

## 5. When to run

- Daily, through a suite schedule.
- Before and after every ServiceNow family upgrade or patch.
- After any change to incident, change or catalog configuration (business rules, UI policies, flows, ACLs).

## 6. Defect workflow

Failed step → read the step output and screenshot → reproduce manually → log the defect ([template](defect-report-template.md)) → align root cause and priority with the developer or business analyst → retest after the fix → re-run the full suite as a regression check.
