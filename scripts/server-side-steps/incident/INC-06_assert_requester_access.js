/**
 * INC-06 - Role-based access: a requester (no roles) can read only their own incidents
 * ATF step type: Run Server Side Script (runs while impersonating the requester)
 *
 * Server-side script steps run as the impersonated user, so GlideRecordSecure
 * applies that user's ACLs. Plain GlideRecord would ignore ACLs and prove nothing.
 *
 * SETUP: replace the two constants with the sys_ids of the "Record Insert" steps
 * that created the incidents (one with the requester as caller, one with someone else).
 */
(function (outputs, steps, params, stepResult, assertEqual) {
    var STEP_OWN_INCIDENT = 'REPLACE_WITH_INSERT_OWN_INCIDENT_STEP_SYS_ID';
    var STEP_OTHER_INCIDENT = 'REPLACE_WITH_INSERT_OTHER_INCIDENT_STEP_SYS_ID';

    function visibleRows(sysId) {
        var gr = new GlideRecordSecure('incident');
        gr.addQuery('sys_id', sysId);
        gr.query();
        return gr.getRowCount();
    }

    assertEqual({ name: 'Requester sees own incident', shouldbe: 1, value: visibleRows(steps(STEP_OWN_INCIDENT).record_id) });
    assertEqual({ name: 'Requester cannot see other incident', shouldbe: 0, value: visibleRows(steps(STEP_OTHER_INCIDENT).record_id) });

    stepResult.setOutputMessage('ACLs enforced for ' + gs.getUserName());
    return true;
})(outputs, steps, params, stepResult, assertEqual);
