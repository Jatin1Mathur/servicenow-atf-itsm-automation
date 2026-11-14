/**
 * CAT-02 - Ordering "Software Access Request" creates one REQ with one RITM
 * ATF step type: Run Server Side Script (runs after "Order Catalog Item",
 * still impersonating the requester)
 *
 * Checks: exactly one RITM under the REQ, correct catalog item,
 * variable values stored on the RITM, and approval pending.
 */
(function (outputs, steps, params, stepResult, assertEqual) {
    var ITEM = 'Software Access Request';
    var EXPECTED_SOFTWARE = 'visio';
    var EXPECTED_JUSTIFICATION = 'Needed for ATF process diagrams';

    var utils = new ATFItsmTestUtils();
    var ritm = utils.latestRitm(ITEM, gs.getUserID(), 5);
    if (!ritm) {
        stepResult.setOutputMessage('No ' + ITEM + ' RITM found for ' + gs.getUserName());
        return false;
    }

    var reqId = ritm.getValue('request');
    assertEqual({ name: 'RITMs under the request', shouldbe: 1, value: utils.count('sc_req_item', 'request=' + reqId) });
    assertEqual({ name: 'Catalog item', shouldbe: ITEM, value: ritm.cat_item.getDisplayValue() });
    assertEqual({ name: 'Variable: software', shouldbe: EXPECTED_SOFTWARE, value: utils.getVariable(ritm, 'software') });
    assertEqual({ name: 'Variable: business_justification', shouldbe: EXPECTED_JUSTIFICATION, value: utils.getVariable(ritm, 'business_justification') });
    assertEqual({ name: 'Requested for', shouldbe: gs.getUserID(), value: ritm.getValue('requested_for') });
    assertEqual({ name: 'RITM approval', shouldbe: 'requested', value: ritm.getValue('approval') });

    outputs.table = 'sc_req_item';
    outputs.record_id = ritm.getUniqueValue();
    stepResult.setOutputMessage(ritm.request.getDisplayValue() + ' / ' + ritm.getValue('number') + ' created and waiting for approval');
    return true;
})(outputs, steps, params, stepResult, assertEqual);
