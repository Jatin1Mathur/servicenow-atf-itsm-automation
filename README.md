# ServiceNow ITSM Test Automation (ATF)

Regression tests for ServiceNow **Incident**, **Change** and **Service Catalog** processes, built with the **Automated Test Framework (ATF)**.

The repo contains everything needed to build the suites on a Personal Developer Instance: test designs, server-side script steps, reusable custom step configurations, a setup script and a test plan.

[![Lint (ES5)](https://github.com/Jatin1Mathur/servicenow-atf-itsm-automation/actions/workflows/lint.yml/badge.svg)](https://github.com/Jatin1Mathur/servicenow-atf-itsm-automation/actions/workflows/lint.yml)

## What is tested

| Suite | Tests | Covers |
|---|---|---|
| [ITSM - Incident Management](suites/01-incident-management.md) | 6 | creation defaults, assignment rule, priority matrix (parameterized, 3 rows), resolve UI policy, lifecycle via audit trail, ACLs |
| [ITSM - Change Management](suites/02-change-management.md) | 3 | Request Approval → Assess, approval generation, state model blocks skipping, rejection → New |
| [ITSM - Service Catalog](suites/03-service-catalog.md) | 4 | mandatory variables, REQ/RITM + variables, manager approval → SC Task, rejection → Closed Incomplete |
| **Total** | **13** | 6 of the 13 tests include a negative check |

## How a test is put together

```
Create a User (roles) ─► Impersonate ─► UI steps                 ─► Server steps
                                        Open form / catalog item     Run Server Side Script (assertEqual)
                                        Set values                   Wait for Record Count   (custom)
                                        Field State Validation       Assert Record Matches   (custom)
                                        Submit / Order / UI Action
                                                       │
                                     ATF rolls back all test data after the run
```

- **Realistic users:** tests create users with only the roles they need and impersonate them. Nothing runs as admin, so ACLs and UI policies are really exercised.
- **UI + server assertions:** UI steps check what the user sees. Server script steps check what is stored, including the `sys_audit` state path, related RITM/SC Task records and approvals.
- **No fixed sleeps:** flows and approvals run asynchronously. The custom step **Wait for Record Count** polls until records appear or the step times out.
- **Readable failures:** **Assert Record Matches Condition** reports *which* query terms failed, e.g. `close_notesISNOTEMPTY`, so you can see the cause straight from the result.
- **Data-driven:** INC-03 is a parameterized test. One scenario runs against three impact/urgency combinations.
- **Independent tests:** each test creates its own data, and ATF rollback keeps the instance clean, so tests can run in any order.

## Repository layout

```
scripts/
  setup/01_setup_itsm_test_config.js     background script: groups, assignment rule, catalog item + variables
  script-includes/ATFItsmTestUtils.js    shared helpers for script steps
  step-configs/
    wait-for-record-count/               custom step: poll until N records match
    assert-record-matches/               custom step: assert a record meets a condition
  server-side-steps/
    incident/  change/  catalog/         one file per "Run Server Side Script" step
suites/                                  step-by-step design of every test
docs/
  build-guide.md                         recreate everything in a PDI
  test-plan.md                           scope, approach, traceability, exit criteria
  defect-report-template.md              how failures are logged and retested
results/                                 suite run evidence
```

## Getting started

1. Get a free PDI at [developer.servicenow.com](https://developer.servicenow.com).
2. Run [`scripts/setup/01_setup_itsm_test_config.js`](scripts/setup/01_setup_itsm_test_config.js) in *Scripts - Background*.
3. Follow the [build guide](docs/build-guide.md) to create the Script Include, the custom steps, the catalog flow and the 13 tests.
4. Open the **Client Test Runner** and run the `ITSM - Regression` suite.

## Known ATF limits and how they are handled

| Limit | Handling here |
|---|---|
| Flows/approvals finish after the UI step returns | `Wait for Record Count` polling step |
| UI steps need an open Client Test Runner | Scheduled Client Test Runner for unattended runs |
| Hard-coded sys_ids break between instances | Tests create their own users and records. Lookups use names |
| Script steps can bypass security if written with `GlideRecord` | ACL checks use `GlideRecordSecure` while impersonating |
| Resolution codes and some choices differ by release | Documented per test. Choose any valid value |

## Code style

All scripts are **ES5**, so they run in the Global scope on any release. CI lints them with ESLint (`ecmaVersion: 5`) and ServiceNow globals:

```bash
npm install
npm run lint
```

## Tech

ServiceNow ATF · ITSM (Incident, Change, Request) · Service Catalog · Flow Designer · JavaScript (Glide API: GlideRecord, GlideRecordSecure, GlideAggregate, GlideFilter)
