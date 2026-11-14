/**
 * CAT-03 (step B) - After approval, the flow creates one SC Task for the Software group
 * ATF step type: Run Server Side Script (runs after "Wait for Record Count" on sc_task)
 *
 * SETUP: replace STEP_DECISION with the sys_id of the CAT-03a step
 * (its output record_id is the RITM).
 */
(function (outputs, steps, params, stepResult, assertEqual) {
    var STEP_DECISION = 'REPLACE_WITH_CAT03A_STEP_SYS_ID';
    var EXPECTED_GROUP = 'Software';

    var utils = new ATFItsmTestUtils();
    var ritm = utils.getRecord('sc_req_item', steps(STEP_DECISION).record_id);
    if (!ritm) {
        stepResult.setOutputMessage('RITM from the approval step was not found');
        return false;
    }

    assertEqual({ name: 'RITM approval', shouldbe: 'approved', value: ritm.getValue('approval') });

    var task = new GlideRecord('sc_task');
    task.addQuery('request_item', ritm.getUniqueValue());
    task.query();
    assertEqual({ name: 'SC Tasks created', shouldbe: 1, value: task.getRowCount() });
    task.next();

    assertEqual({ name: 'Task assignment group', shouldbe: EXPECTED_GROUP, value: task.assignment_group.getDisplayValue() });
    assertEqual({ name: 'Task mentions the software', shouldbe: true,
        value: task.getValue('short_description').indexOf(ritm.variables.software.getDisplayValue()) > -1 });

    stepResult.setOutputMessage(task.getValue('number') + ' created for ' + task.assignment_group.getDisplayValue());
    return true;
})(outputs, steps, params, stepResult, assertEqual);
