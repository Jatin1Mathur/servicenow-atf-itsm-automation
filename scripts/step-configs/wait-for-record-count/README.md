# Custom step: Wait for Record Count

Polls a table until the number of matching records reaches an expected count. This handles asynchronous Flow Designer and approval logic without fixed `sleep` steps.

## Create it

**Automated Test Framework > Administration > Step Configurations > New**

| Field | Value |
|---|---|
| Name | Wait for Record Count |
| Category | Server |
| Step environment | Server - independent |
| Template reminder | Waits until a query returns the expected number of records |
| Step execution script | contents of [`execution.js`](execution.js) |
| Description generation script | contents of [`description.js`](description.js) |

Set the step's **Timeout** a few seconds higher than the max wait you use.

## Input variables

ServiceNow prefixes the column names with `u_` automatically.

| Label | Column name | Type | Mandatory | Notes |
|---|---|---|---|---|
| Table | `u_table` | Table Name | yes | e.g. `sc_task` |
| Filter field | `u_filter_field` | String | no | e.g. `request_item` |
| Filter value | `u_filter_value` | String | no | use a data pill, e.g. the RITM from a previous step |
| Extra query | `u_extra_query` | String (1000) | no | encoded query, e.g. `state=-5` |
| Expected count | `u_expected_count` | Integer | yes | |
| At least | `u_at_least` | True/False | no | pass when count is greater than or equal to the expected count |
| Max wait (seconds) | `u_max_wait_seconds` | Integer | no | default 30 |

## Output variables

| Label | Column name | Type |
|---|---|---|
| Actual count | `u_actual_count` | Integer |

## Where it is used

| Test | Table | Filter | Extra query | Expected |
|---|---|---|---|---|
| CHG-01 | `sysapproval_approver` | `sysapproval` = change | `state=requested` | at least 1 |
| CHG-03 | `change_request` | `sys_id` = change | `state=-5` | 1 |
| CAT-03 | `sc_task` | `request_item` = RITM | | 1 |
| CAT-04 | `sc_req_item` | `sys_id` = RITM | `state=4` | 1 |
