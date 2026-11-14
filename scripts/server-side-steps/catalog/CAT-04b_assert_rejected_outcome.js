/**
 * CAT-04 (step B) - After rejection the RITM is Closed Incomplete and no task exists
 * ATF step type: Run Server Side Script (runs after "Wait for Record Count" on sc_req_item)
 *
 * sc_req_item.state values: 1 Open, 2 Work in Progress, 3 Closed Complete,
 * 4 Closed Incomplete, 7 Closed Skipped
 *
 * SETUP: replace STEP_DECISION with the sys_id of the CAT-03a step
 * (configured with DECISION = 'rejected').
 */
(function (outputs, steps, params, stepResult, assertEqual) {
    var STEP_DECISION = 'REPLACE_WITH_CAT03A_STEP_SYS_ID';
    var STATE_CLOSED_INCOMPLETE = '4';

    var utils = new ATFItsmTestUtils();
    var ritmId = steps(STEP_DECISION).record_id;
    var ritm = utils.getRecord('sc_req_item', ritmId);
    if (!ritm) {
        stepResult.setOutputMessage('RITM from the rejection step was not found');
        return false;
    }

    assertEqual({ name: 'RITM approval', shouldbe: 'rejected', value: ritm.getValue('approval') });
    assertEqual({ name: 'RITM state', shouldbe: STATE_CLOSED_INCOMPLETE, value: ritm.getValue('state') });
    assertEqual({ name: 'SC Tasks created', shouldbe: 0, value: utils.count('sc_task', 'request_item=' + ritmId) });

    stepResult.setOutputMessage(ritm.getValue('number') + ' closed incomplete, no fulfilment task');
    return true;
})(outputs, steps, params, stepResult, assertEqual);
