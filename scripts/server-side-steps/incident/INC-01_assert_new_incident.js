/**
 * INC-01 - ITIL user creates an incident from the form
 * ATF step type: Run Server Side Script (runs after "Submit a Form")
 *
 * Checks the server-side defaults that the form does not show reliably:
 * number generated, state New, opened_by = impersonated user, caller kept.
 *
 * SETUP: replace STEP_SUBMIT with the sys_id of the "Submit a Form" step
 * (script editor > "Insert a step reference" picker).
 */
(function (outputs, steps, params, stepResult, assertEqual) {
    var STEP_SUBMIT = 'REPLACE_WITH_SUBMIT_FORM_STEP_SYS_ID';
    var STATE_NEW = '1';

    var utils = new ATFItsmTestUtils();
    var inc = utils.getRecord('incident', steps(STEP_SUBMIT).record_id);
    if (!inc) {
        stepResult.setOutputMessage('Incident from the submit step was not found');
        return false;
    }

    assertEqual({ name: 'Number prefix', shouldbe: 'INC', value: inc.getValue('number').substring(0, 3) });
    assertEqual({ name: 'State', shouldbe: STATE_NEW, value: inc.getValue('state') });
    assertEqual({ name: 'Opened by', shouldbe: gs.getUserID(), value: inc.getValue('opened_by') });
    assertEqual({ name: 'Caller is set', shouldbe: true, value: !inc.caller_id.nil() });

    stepResult.setOutputMessage(inc.getValue('number') + ' created in state New by ' + gs.getUserName());
    return true;
})(outputs, steps, params, stepResult, assertEqual);
