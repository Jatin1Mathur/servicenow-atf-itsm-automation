/**
 * CAT-03 / CAT-04 (step A) - Manager approves or rejects the RITM approval
 * ATF step type: Run Server Side Script (runs while impersonating the manager)
 *
 * Used by both tests; set DECISION to 'approved' (CAT-03) or 'rejected' (CAT-04).
 * Asserts the approval was assigned to the requester's manager, then decides it.
 *
 * SETUP: replace STEP_CREATE_REQUESTER with the sys_id of the "Create a User"
 * step that created the requester.
 */
(function (outputs, steps, params, stepResult, assertEqual) {
    var STEP_CREATE_REQUESTER = 'REPLACE_WITH_CREATE_REQUESTER_STEP_SYS_ID';
    var ITEM = 'Software Access Request';
    var DECISION = 'approved'; // 'approved' for CAT-03, 'rejected' for CAT-04

    var utils = new ATFItsmTestUtils();
    var requesterId = steps(STEP_CREATE_REQUESTER).user;
    var ritm = utils.latestRitm(ITEM, requesterId, 10);
    if (!ritm) {
        stepResult.setOutputMessage('No ' + ITEM + ' RITM found for the requester');
        return false;
    }

    var appr = utils.approvalsFor(ritm.getUniqueValue(), 'requested');
    assertEqual({ name: 'Open approvals on RITM', shouldbe: 1, value: appr.getRowCount() });
    appr.next();
    assertEqual({ name: 'Approver is requester\'s manager', shouldbe: gs.getUserID(), value: appr.getValue('approver') });

    appr.setValue('state', DECISION);
    appr.setValue('comments', 'Decided by ATF as ' + gs.getUserName());
    appr.update();

    outputs.table = 'sc_req_item';
    outputs.record_id = ritm.getUniqueValue();
    stepResult.setOutputMessage(ritm.getValue('number') + ' ' + DECISION + ' by ' + gs.getUserName());
    return true;
})(outputs, steps, params, stepResult, assertEqual);
