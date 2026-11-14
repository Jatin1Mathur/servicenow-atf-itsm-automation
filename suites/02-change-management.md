# Suite 2 — ITSM: Change Management

**ATF suite name:** `ITSM - Change Management`
**Tests:** 3
**Roles used:** `itil` (change requester) and an approver who is a member of the assignment group

Change approvals are generated **asynchronously** by the change approval policy and flow. The tests therefore use the custom step [Wait for Record Count](../scripts/step-configs/wait-for-record-count/README.md) and never a fixed sleep.

`change_request.state`: −5 New, −4 Assess, −3 Authorize, −2 Scheduled, −1 Implement, 0 Review, 3 Closed, 4 Canceled

---

## CHG-01 — Normal change: Request Approval moves to Assess and creates approvals

| # | Step | Configuration | Expected |
|---|---|---|---|
| 1 | Create a User | `ATF Approver`, Roles `itil`, Groups `Network`, Impersonate ✘ | Group has an approver |
| 2 | Create a User | `ATF Change Requester`, Roles `itil`, Impersonate ✔ | |
| 3 | Record Insert | `change_request`: Type `normal`, Short description `ATF CHG-01`, Assignment group `Network`, Planned start/end dates in the future | State New |
| 4 | Open an Existing Record | `change_request`, record = step 3 | |
| 5 | Click a UI Action | `Request Approval` | |
| 6 | Run Server Side Script | [`CHG-01_assert_moved_to_assess.js`](../scripts/server-side-steps/change/CHG-01_assert_moved_to_assess.js) | State Assess, approval requested |
| 7 | Wait for Record Count *(custom)* | Table `sysapproval_approver`, Filter `sysapproval` = step 3, Extra `state=requested`, Expected 1, At least ✔, Max wait 30 | Approvals created |

## CHG-02 — State model blocks skipping from New to Implement (negative)

| # | Step | Configuration | Expected |
|---|---|---|---|
| 1 | Create a User | `ATF Change Requester`, Roles `itil`, Impersonate ✔ | |
| 2 | Record Insert | `change_request`: Type `normal`, Short description `ATF CHG-02`, Assignment group `Network` | State New |
| 3 | Run Server Side Script | [`CHG-02_assert_invalid_transition_blocked.js`](../scripts/server-side-steps/change/CHG-02_assert_invalid_transition_blocked.js) | Update aborted, still New |

## CHG-03 — Rejected Assess approval returns the change to New

| # | Step | Configuration | Expected |
|---|---|---|---|
| 1–7 | *same as CHG-01* | | Change in Assess with approvals |
| 8 | Impersonate | User = step 1 (`ATF Approver`) | |
| 9 | Run Server Side Script | [`CHG-03_reject_assess_approval.js`](../scripts/server-side-steps/change/CHG-03_reject_assess_approval.js) | Approval(s) rejected |
| 10 | Wait for Record Count *(custom)* | Table `change_request`, Filter `sys_id` = step 3, Extra `state=-5`, Expected 1, Max wait 30 | Back in New |
| 11 | Assert Record Matches Condition *(custom)* | `change_request`, record = step 3, Condition `state=-5^approval=rejected` | Matches |

> **Tip:** build steps 1–7 once, then use **Copy Test** on CHG-01 to create CHG-03.
