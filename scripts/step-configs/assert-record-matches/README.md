# Custom step: Assert Record Matches Condition

This step asserts that one record meets an encoded-query condition. When it fails, it reports which terms of the condition failed, so you can see the problem without opening logs.

## Create it

**Automated Test Framework > Administration > Step Configurations > New**

| Field | Value |
|---|---|
| Name | Assert Record Matches Condition |
| Category | Server |
| Step environment | Server - independent |
| Step execution script | contents of [`execution.js`](execution.js) |
| Description generation script | contents of [`description.js`](description.js) |

## Input variables

| Label | Column name | Type | Mandatory |
|---|---|---|---|
| Table | `u_table` | Table Name | yes |
| Record | `u_record` | Document ID (dependent on `u_table`) | yes |
| Condition | `u_condition` | Conditions (dependent on `u_table`) or String | yes |

## Output variables

| Label | Column name | Type |
|---|---|---|
| Failed terms | `u_failed_terms` | String |

## Example

INC-04 uses it after resolving the incident:

- Table: `incident`
- Record: data pill from the *Submit a Form* step
- Condition: `state=6^close_codeISNOTEMPTY^close_notesISNOTEMPTY^resolved_byISNOTEMPTY`
