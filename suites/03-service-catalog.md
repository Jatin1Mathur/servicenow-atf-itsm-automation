# Suite 3 — ITSM: Service Catalog (Software Access Request)

**ATF suite name:** `ITSM - Service Catalog`
**Tests:** 4
**Item under test:** `Software Access Request`, created by the [setup script](../scripts/setup/01_setup_itsm_test_config.js), with its flow built as described in the [build guide](../docs/build-guide.md#4-build-the-catalog-flow)

| Variable | Type | Mandatory |
|---|---|---|
| `requested_for` | Reference (sys_user), default = current user | yes |
| `software` | Select box: `visio`, `acrobat`, `jira` | yes |
| `business_justification` | Multi-line text | yes |
| `needed_by` | Date | no |

**Fulfilment flow:** manager approval → approved: SC Task for the **Software** group / rejected: RITM Closed Incomplete.

### Shared setup (steps S1–S4, used by every test)

| # | Step | Configuration |
|---|---|---|
| S1 | Create a User | `ATF Manager`, no roles, Impersonate ✘ |
| S2 | Create a User | `ATF Requester`, no roles, Impersonate ✘ |
| S3 | Record Update | `sys_user` record = S2, Manager = S1 |
| S4 | Impersonate | User = S2 |

> Save S1–S4 as a **Test Template** so every catalog test starts the same way.

---

## CAT-01 — Mandatory variables block the order (negative)

| # | Step | Configuration | Expected |
|---|---|---|---|
| S1–S4 | shared setup | | |
| 1 | Open a Catalog Item | `Software Access Request` | |
| 2 | Variable State Validation | `software`, `business_justification`: mandatory. `needed_by`: optional | Mandatory flags correct |
| 3 | Set Variable Values | software `Microsoft Visio` (leave justification empty) | |
| 4 | Order Catalog Item | Assert: order is **expected to fail** | **Blocked in browser** |
| 5 | Run Server Side Script | [`CAT-01_assert_no_request_created.js`](../scripts/server-side-steps/catalog/CAT-01_assert_no_request_created.js) | No RITM on server |

## CAT-02 — Order creates REQ + RITM with the variables stored

| # | Step | Configuration | Expected |
|---|---|---|---|
| S1–S4 | shared setup | | |
| 1 | Open a Catalog Item | `Software Access Request` | |
| 2 | Variable Values Validation | `requested_for` = S2 | Default filled |
| 3 | Set Variable Values | software `Microsoft Visio`, business_justification `Needed for ATF process diagrams` | |
| 4 | Order Catalog Item | Assert: order succeeds | REQ number shown |
| 5 | Run Server Side Script | [`CAT-02_assert_request_and_ritm.js`](../scripts/server-side-steps/catalog/CAT-02_assert_request_and_ritm.js) | 1 RITM, variables stored, approval requested |

## CAT-03 — Manager approves → SC Task for the Software group

| # | Step | Configuration | Expected |
|---|---|---|---|
| S1–S4, 1–5 | *same as CAT-02* | | RITM waiting for approval |
| 6 | Impersonate | User = S1 (manager) | |
| 7 | Run Server Side Script | [`CAT-03a_manager_decides_approval.js`](../scripts/server-side-steps/catalog/CAT-03a_manager_decides_approval.js) with `DECISION = 'approved'` | Approver = manager, approved |
| 8 | Wait for Record Count *(custom)* | `sc_task`, Filter `request_item` = step 7 record, Expected 1, Max wait 45 | Task created by flow |
| 9 | Run Server Side Script | [`CAT-03b_assert_sc_task.js`](../scripts/server-side-steps/catalog/CAT-03b_assert_sc_task.js) | Group Software, description mentions software |

## CAT-04 — Manager rejects → RITM Closed Incomplete, no task (negative)

| # | Step | Configuration | Expected |
|---|---|---|---|
| S1–S4, 1–5 | *same as CAT-02* | | |
| 6 | Impersonate | User = S1 (manager) | |
| 7 | Run Server Side Script | `CAT-03a_manager_decides_approval.js` with `DECISION = 'rejected'` | Rejected |
| 8 | Wait for Record Count *(custom)* | `sc_req_item`, Filter `sys_id` = step 7 record, Extra `state=4`, Expected 1, Max wait 45 | Flow closed the RITM |
| 9 | Run Server Side Script | [`CAT-04b_assert_rejected_outcome.js`](../scripts/server-side-steps/catalog/CAT-04b_assert_rejected_outcome.js) | Closed Incomplete, 0 tasks |
