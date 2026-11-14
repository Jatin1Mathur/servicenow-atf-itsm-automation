/**
 * Custom ATF Step Configuration: "Wait for Record Count"
 * Field: Step execution script
 *
 * Polls a table until the number of matching records equals the expected
 * count, or the wait time runs out. Needed because Flow Designer flows and
 * approval engines run asynchronously, so a plain assertion right after a
 * UI action often runs before the flow has created its records.
 *
 * Inputs (see README.md for types):
 *   u_table, u_filter_field, u_filter_value, u_extra_query,
 *   u_expected_count, u_at_least, u_max_wait_seconds
 * Outputs:
 *   u_actual_count
 */
(function executeStep(inputs, outputs, stepResult, timeout) {
    var table = String(inputs.u_table);
    var expected = parseInt(inputs.u_expected_count, 10);
    var maxWait = parseInt(inputs.u_max_wait_seconds, 10) || 30;
    var atLeast = String(inputs.u_at_least) === 'true';

    if (!table || isNaN(expected)) {
        stepResult.setOutputMessage('Table and expected count are required');
        stepResult.setFailed();
        return;
    }

    var query = [];
    if (inputs.u_filter_field && inputs.u_filter_value) {
        query.push(inputs.u_filter_field + '=' + inputs.u_filter_value);
    }
    if (inputs.u_extra_query) {
        query.push(String(inputs.u_extra_query));
    }
    var encodedQuery = query.join('^');

    function isMet(n) {
        return atLeast ? n >= expected : n === expected;
    }

    function countNow() {
        var ga = new GlideAggregate(table);
        if (encodedQuery) {
            ga.addEncodedQuery(encodedQuery);
        }
        ga.addAggregate('COUNT');
        ga.query();
        return ga.next() ? parseInt(ga.getAggregate('COUNT'), 10) : 0;
    }

    var deadline = new GlideDateTime().getNumericValue() + maxWait * 1000;
    var actual = countNow();
    while (!isMet(actual) && new GlideDateTime().getNumericValue() < deadline) {
        gs.sleep(1000);
        actual = countNow();
    }

    outputs.u_actual_count = actual;
    var summary = table + ' [' + encodedQuery + ']: expected ' + expected + ', found ' + actual;
    stepResult.setOutputMessage(summary);
    if (isMet(actual)) {
        stepResult.setSuccess();
    } else {
        stepResult.setFailed();
    }
}(inputs, outputs, stepResult, timeout));
