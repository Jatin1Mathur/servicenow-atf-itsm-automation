/**
 * CHG-03 (step A) - Reject the Assess approval as the approver
 * ATF step type: Run Server Side Script (runs while impersonating an approver)
 *
 * Rejects every open approval on the change and records who rejected it.
 * The next step ("Wait for Record Count" on change_request, state=-5)
 * waits until the change has been returned to New by the approval flow.
 *
 * SETUP: replace STEP_INSERT with the sys_id of the "Record Insert" step that created the change.
 */
(function (outputs, steps, params, stepResult, assertEqual) {
    var STEP_INSERT = 'REPLACE_WITH_RECORD_INSERT_STEP_SYS_ID';

    var appr = new ATFItsmTestUtils().approvalsFor(steps(STEP_INSERT).record_id, 'requested');
    var rejected = 0;
    while (appr.next()) {
        appr.setValue('state', 'rejected');
        appr.setValue('comments', 'Rejected by ATF test CHG-03');
        appr.update();
        rejected++;
    }

    assertEqual({ name: 'At least one open approval was rejected', shouldbe: true, value: rejected > 0 });
    stepResult.setOutputMessage('Rejected ' + rejected + ' approval(s) as ' + gs.getUserName());
    return true;
})(outputs, steps, params, stepResult, assertEqual);
