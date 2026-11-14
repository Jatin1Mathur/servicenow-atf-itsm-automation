/**
 * Custom ATF Step Configuration: "Assert Record Matches Condition"
 * Field: Step execution script
 *
 * Passes when a single record satisfies an encoded-query condition,
 * e.g. "state=6^resolved_byISNOTEMPTY^close_codeISNOTEMPTY".
 * Lets testers write server-side checks without writing a script step,
 * and reports exactly which condition terms failed.
 *
 * Inputs:  u_table, u_record, u_condition
 * Outputs: u_failed_terms
 */
(function executeStep(inputs, outputs, stepResult, timeout) {
    var table = String(inputs.u_table);
    var condition = String(inputs.u_condition);

    var gr = new GlideRecord(table);
    if (!gr.get(inputs.u_record)) {
        stepResult.setOutputMessage('Record ' + inputs.u_record + ' not found in ' + table);
        stepResult.setFailed();
        return;
    }

    if (GlideFilter.checkRecord(gr, condition)) {
        outputs.u_failed_terms = '';
        stepResult.setOutputMessage(gr.getDisplayValue() + ' matches ' + condition);
        stepResult.setSuccess();
        return;
    }

    // Find which individual terms failed, to make the failure easy to triage.
    var failed = [];
    var terms = condition.split('^');
    for (var i = 0; i < terms.length; i++) {
        if (terms[i] && terms[i] !== 'EQ' && !GlideFilter.checkRecord(gr, terms[i])) {
            failed.push(terms[i]);
        }
    }

    outputs.u_failed_terms = failed.join('^');
    stepResult.setOutputMessage(gr.getDisplayValue() + ' does not match. Failed terms: ' + failed.join(', '));
    stepResult.setFailed();
}(inputs, outputs, stepResult, timeout));
