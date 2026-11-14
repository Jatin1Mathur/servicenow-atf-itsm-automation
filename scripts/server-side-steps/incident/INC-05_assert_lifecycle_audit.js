/**
 * INC-05 - Incident lifecycle New -> In Progress -> On Hold -> In Progress -> Resolved
 * ATF step type: Run Server Side Script (last step of the test)
 *
 * Verifies the end state AND the path taken, using the audit history,
 * so a record that "jumped" straight to Resolved would fail the test.
 *
 * SETUP: replace STEP_SUBMIT with the sys_id of the first "Submit a Form" step.
 */
(function (outputs, steps, params, stepResult, assertEqual) {
    var STEP_SUBMIT = 'REPLACE_WITH_FIRST_SUBMIT_FORM_STEP_SYS_ID';
    var STATE_RESOLVED = '6';
    // incident.state values: 1 New, 2 In Progress, 3 On Hold, 6 Resolved
    var EXPECTED_PATH = ['1->2', '2->3', '3->2', '2->6'];

    var utils = new ATFItsmTestUtils();
    var incId = steps(STEP_SUBMIT).record_id;
    var inc = utils.getRecord('incident', incId);
    if (!inc) {
        stepResult.setOutputMessage('Incident from the submit step was not found');
        return false;
    }

    assertEqual({ name: 'Final state', shouldbe: STATE_RESOLVED, value: inc.getValue('state') });
    assertEqual({ name: 'Resolved by is set', shouldbe: true, value: !inc.resolved_by.nil() });
    assertEqual({ name: 'Resolved at is set', shouldbe: true, value: !inc.resolved_at.nil() });
    assertEqual({ name: 'Resolution code is set', shouldbe: true, value: !inc.close_code.nil() });

    var path = utils.auditTransitions('incident', incId, 'state');
    assertEqual({ name: 'State transitions (audit)', shouldbe: EXPECTED_PATH.join(', '), value: path.join(', ') });

    stepResult.setOutputMessage(inc.getValue('number') + ' path: ' + path.join(', '));
    return true;
})(outputs, steps, params, stepResult, assertEqual);
