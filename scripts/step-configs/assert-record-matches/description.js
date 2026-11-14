/**
 * Custom ATF Step Configuration: "Assert Record Matches Condition"
 * Field: Description generation script
 */
(function generateDescription() {
    return gs.getMessage('Assert that the {0} record matches: {1}', [
        step.inputs.u_table,
        step.inputs.u_condition
    ]);
})();
