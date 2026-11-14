/**
 * CHG-02 - Negative test: the change state model blocks New -> Implement
 * ATF step type: Run Server Side Script
 *
 * Tries to skip Assess/Authorize/Scheduled by writing the state directly on
 * the server, then re-reads the record from the database. The state model
 * business rules must abort the update and leave the change in New.
 *
 * SETUP: replace STEP_INSERT with the sys_id of the "Record Insert" step that created the change.
 */
(function (outputs, steps, params, stepResult, assertEqual) {
    var STEP_INSERT = 'REPLACE_WITH_RECORD_INSERT_STEP_SYS_ID';
    var STATE_NEW = '-5';
    var STATE_IMPLEMENT = '-1';

    var utils = new ATFItsmTestUtils();
    var chgId = steps(STEP_INSERT).record_id;
    var chg = utils.getRecord('change_request', chgId);
    if (!chg) {
        stepResult.setOutputMessage('Change from the insert step was not found');
        return false;
    }

    chg.setValue('state', STATE_IMPLEMENT);
    chg.update();

    var reloaded = utils.getRecord('change_request', chgId);
    assertEqual({ name: 'State after illegal jump to Implement', shouldbe: STATE_NEW, value: reloaded.getValue('state') });

    stepResult.setOutputMessage(reloaded.getValue('number') + ' stayed in ' + reloaded.state.getDisplayValue());
    return true;
})(outputs, steps, params, stepResult, assertEqual);
