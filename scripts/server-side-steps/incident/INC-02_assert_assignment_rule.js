/**
 * INC-02 - Assignment rule routes Network incidents to the Network group
 * ATF step type: Run Server Side Script (runs after "Submit a Form")
 *
 * Precondition: assignment rule "ATF - INC Network to Network group"
 * (created by scripts/setup/01_setup_itsm_test_config.js).
 *
 * SETUP: replace STEP_SUBMIT with the sys_id of the "Submit a Form" step.
 */
(function (outputs, steps, params, stepResult, assertEqual) {
    var STEP_SUBMIT = 'REPLACE_WITH_SUBMIT_FORM_STEP_SYS_ID';
    var EXPECTED_GROUP = 'Network';

    var inc = new ATFItsmTestUtils().getRecord('incident', steps(STEP_SUBMIT).record_id);
    if (!inc) {
        stepResult.setOutputMessage('Incident from the submit step was not found');
        return false;
    }

    assertEqual({ name: 'Category', shouldbe: 'network', value: inc.getValue('category') });
    assertEqual({
        name: 'Assignment group set by rule',
        shouldbe: EXPECTED_GROUP,
        value: inc.assignment_group.getDisplayValue()
    });

    stepResult.setOutputMessage(inc.getValue('number') + ' routed to ' + inc.assignment_group.getDisplayValue());
    return true;
})(outputs, steps, params, stepResult, assertEqual);
