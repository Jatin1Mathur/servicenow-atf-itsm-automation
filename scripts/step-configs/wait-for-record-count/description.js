/**
 * Custom ATF Step Configuration: "Wait for Record Count"
 * Field: Description generation script
 *
 * Builds the one-line summary shown in the test's step list.
 */
(function generateDescription() {
    var where = step.inputs.u_filter_field ? step.inputs.u_filter_field + ' = <value>' : 'all records';
    if (step.inputs.u_extra_query) {
        where += ' and ' + step.inputs.u_extra_query;
    }
    return gs.getMessage('Wait up to {0}s until {1} has {2} record(s) where {3}', [
        step.inputs.u_max_wait_seconds || '30',
        step.inputs.u_table,
        step.inputs.u_expected_count,
        where
    ]);
})();
