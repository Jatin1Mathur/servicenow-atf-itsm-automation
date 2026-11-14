/**
 * INC-03 - Priority is calculated from Impact x Urgency (parameterized test)
 * ATF step type: Run Server Side Script (runs after "Submit a Form")
 *
 * The test is a Parameterized Test with three exclusive parameters:
 *   impact            -> params.u_impact
 *   urgency           -> params.u_urgency
 *   expected_priority -> params.u_expected_priority
 *
 * Data rows (default priority lookup, dl_u_priority):
 *   impact 1, urgency 1 -> priority 1 (Critical)
 *   impact 2, urgency 2 -> priority 3 (Moderate)
 *   impact 3, urgency 3 -> priority 5 (Planning)
 *
 * The same steps run once per row, so one scenario covers 3 priority levels.
 *
 * SETUP: replace STEP_SUBMIT with the sys_id of the "Submit a Form" step.
 */
(function (outputs, steps, params, stepResult, assertEqual) {
    var STEP_SUBMIT = 'REPLACE_WITH_SUBMIT_FORM_STEP_SYS_ID';

    var inc = new ATFItsmTestUtils().getRecord('incident', steps(STEP_SUBMIT).record_id);
    if (!inc) {
        stepResult.setOutputMessage('Incident from the submit step was not found');
        return false;
    }

    assertEqual({ name: 'Impact stored', shouldbe: String(params.u_impact), value: inc.getValue('impact') });
    assertEqual({ name: 'Urgency stored', shouldbe: String(params.u_urgency), value: inc.getValue('urgency') });
    assertEqual({
        name: 'Priority for impact ' + params.u_impact + ' / urgency ' + params.u_urgency,
        shouldbe: String(params.u_expected_priority),
        value: inc.getValue('priority')
    });

    stepResult.setOutputMessage(inc.getValue('number') + ': priority ' + inc.priority.getDisplayValue());
    return true;
})(outputs, steps, params, stepResult, assertEqual);
