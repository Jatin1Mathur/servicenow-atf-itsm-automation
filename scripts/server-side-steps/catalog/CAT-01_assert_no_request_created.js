/**
 * CAT-01 - Negative test: ordering without the mandatory justification creates nothing
 * ATF step type: Run Server Side Script (runs after the expected-to-fail order step)
 *
 * The UI steps already assert that the order was blocked in the browser.
 * This step confirms nothing slipped through on the server either.
 */
(function (outputs, steps, params, stepResult, assertEqual) {
    var ITEM = 'Software Access Request';

    var ritm = new ATFItsmTestUtils().latestRitm(ITEM, gs.getUserID(), 5);
    assertEqual({ name: 'RITM created without justification', shouldbe: false, value: ritm !== null });

    stepResult.setOutputMessage('No ' + ITEM + ' RITM was created for ' + gs.getUserName());
    return true;
})(outputs, steps, params, stepResult, assertEqual);
