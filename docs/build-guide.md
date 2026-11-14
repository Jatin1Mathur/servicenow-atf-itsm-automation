# Build guide — recreate the suites in a Personal Developer Instance

This takes about 2–3 hours the first time. Everything runs on a free PDI from [developer.servicenow.com](https://developer.servicenow.com).

## 1. Get an instance

1. Request a PDI on the latest release and log in as `admin`.
2. Make sure the **Automated Test Framework** plugin is active (it is by default on a PDI).
3. Optional: create an update set `ATF ITSM Automation`. Make it current so that everything below can be exported back into this repo as XML.

## 2. Run the setup script

1. Open **System Definition > Scripts - Background**.
2. Paste [`scripts/setup/01_setup_itsm_test_config.js`](../scripts/setup/01_setup_itsm_test_config.js), keep scope `global`, and click **Run script**.
3. Check the output for `[ATF setup] done`.

The script enables the ATF runner, creates the *Network* and *Software* groups, creates the incident assignment rule and creates the *Software Access Request* catalog item with its variables.

## 3. Create the reusable pieces

| What | Where | Source |
|---|---|---|
| Script Include `ATFItsmTestUtils` | System Definition > Script Includes | [`ATFItsmTestUtils.js`](../scripts/script-includes/ATFItsmTestUtils.js) |
| Step config *Wait for Record Count* | ATF > Administration > Step Configurations | [README](../scripts/step-configs/wait-for-record-count/README.md) |
| Step config *Assert Record Matches Condition* | ATF > Administration > Step Configurations | [README](../scripts/step-configs/assert-record-matches/README.md) |

## 4. Build the catalog flow

In **Flow Designer**, create the flow `ATF - Software Access Request fulfilment`:

1. **Trigger:** Service Catalog.
2. **Action:** *Get Catalog Variables*. Choose the item and select `requested_for` and `software`.
3. **Action:** *Ask For Approval* on the Requested Item record. Rules: approve or reject when anyone approves or rejects, with approver = `Requested Item > Requested for > Manager`.
4. **If** approval state is *Approved*:
   - *Create Catalog Task*. Assignment group `Software`, short description `Provide access: ` + software (display value), wait ✘.
   - *Update Record* on the Requested Item. Stage `Fulfillment`.
5. **Else:**
   - *Update Record* on the Requested Item. State `Closed Incomplete`, Stage `Request Cancelled`.
6. **Activate** the flow. Open the catalog item, set **Flow** to this flow, and save.

## 5. Build the tests

Follow the step tables in [`suites/`](../suites):

- [Incident Management](../suites/01-incident-management.md): 6 tests
- [Change Management](../suites/02-change-management.md): 3 tests
- [Service Catalog](../suites/03-service-catalog.md): 4 tests

Tips:

- Each script file has a `REPLACE_WITH_..._STEP_SYS_ID` constant. Open the script editor in the step, use **Insert a step reference** to pick the right step, and paste its sys_id over the placeholder.
- For INC-03, set the test **Type** to *Parameterized* before adding steps. Add the parameters, then the 3 data rows.
- Save the catalog shared setup (S1–S4) as a **Test Template**.

## 6. Group the tests into suites and schedule them

1. Go to **ATF > Suites > New**. Create the three suites and add the tests in the order shown in the files.
2. Create a parent suite `ITSM - Regression`, and add the three suites as child suites.
3. Go to **ATF > Suites > Suite Schedules**. Run `ITSM - Regression` daily, and before every upgrade or clone.
4. UI steps need a **Client Test Runner**. Open *ATF > Run > Client Test Runner* in a browser tab before running the suites, or use a *Scheduled Client Test Runner* for unattended runs.

## 7. Run, analyse failures and log defects

1. Run each suite and open the **Test Suite Results**.
2. For every failed step, read its output message. The custom steps print the expected vs. actual values and the failed query terms.
3. Check the step screenshot (UI steps), then reproduce the failure manually.
4. Log reproducible defects using [`defect-report-template.md`](defect-report-template.md).
5. Export the suite results, or take screenshots, into [`/results`](../results).

## 8. Export back to Git (optional)

Mark the update set *Complete*, then use **Export to XML** and commit the file under `/update-sets`. Alternatively, link the scoped app to this repository with **Studio > Source Control**.
