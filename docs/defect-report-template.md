# Defect report template

Copy this block for each defect found through an ATF failure.

```markdown
### DEF-<number>: <one-line summary>

| Field | Value |
|---|---|
| Found by | ATF test <ID>, step <n> (suite run <date>) |
| Module | Incident / Change / Service Catalog |
| Severity | Critical / High / Medium / Low |
| Priority | agreed with: <developer / BA> |
| Instance / release | <instance name>, <family + patch> |
| Status | New / In analysis / Fixed / Retested / Closed |

**Steps to reproduce**
1. Impersonate <user with roles ...>
2. ...
3. ...

**Expected result**
...

**Actual result**
...

**Evidence**
- ATF step output message: `...`
- Screenshot / suite result link: ...
- Related records: INC/CHG/RITM numbers, sys_audit entries, logs

**Root cause (after analysis)**
e.g. UI policy condition missing "Closed" state; flow approval rule pointed to the wrong field

**Fix verification**
- [ ] Failing ATF test passes
- [ ] Full suite `ITSM - Regression` re-run green
```

## Severity guide

| Severity | Meaning in ITSM |
|---|---|
| Critical | Users cannot raise or progress incidents, changes or requests |
| High | Wrong routing, approval or priority. Work reaches the wrong team or is delayed |
| Medium | Validation gap, e.g. a missing mandatory check. A workaround exists |
| Low | Cosmetic issue or wording |
