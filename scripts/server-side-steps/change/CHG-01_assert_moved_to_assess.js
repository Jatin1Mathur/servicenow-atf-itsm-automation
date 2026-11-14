/**
 * CHG-01 - Normal change: "Request Approval" moves the change to Assess
 * ATF step type: Run Server Side Script (runs after "Click a UI Action")
 *
 * Approval records are created asynchronously by the change approval flow,
 * so they are checked by the custom "Wait for Record Count" step that follows
 * this one, not here.
 *
 * change_request.state values (normal change model):
 *   -5 New, -4 Assess, -3 Authorize, -2 Scheduled, -1 Implement, 0 Review, 3 Closed, 4 Canceled
 *
 * SETUP: replace STEP_INSERT with the sys_id of the "Record Insert" step that created the change.
 */
(function (outputs, steps, params, stepResult, assertEqual) {
    var STEP_INSERT = 'REPLACE_WITH_RECORD_INSERT_STEP_SYS_ID';
    var STATE_ASSESS = '-4';

    var chg = new ATFItsmTestUtils().getRecord('change_request', steps(STEP_INSERT).record_id);
    if (!chg) {
        stepResult.setOutputMessage('Change from the insert step was not found');
        return false;
    }

    assertEqual({ name: 'Type', shouldbe: 'normal', value: chg.getValue('type') });
    assertEqual({ name: 'State after Request Approval', shouldbe: STATE_ASSESS, value: chg.getValue('state') });
    assertEqual({ name: 'Approval', shouldbe: 'requested', value: chg.getValue('approval') });

    stepResult.setOutputMessage(chg.getValue('number') + ' is in ' + chg.state.getDisplayValue());
    return true;
})(outputs, steps, params, stepResult, assertEqual);
