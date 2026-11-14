/**
 * Script Include: ATFItsmTestUtils
 *
 * Shared helpers used by the "Run Server Side Script" steps in this project,
 * so that each test step stays short and only contains its assertions.
 *
 * Create in: System Definition > Script Includes > New
 *   Name:            ATFItsmTestUtils
 *   Application:     Global
 *   Accessible from: This application scope only
 *   Client callable: false
 *
 * Written in ES5 so it runs in the Global scope on any release.
 */
var ATFItsmTestUtils = Class.create();
ATFItsmTestUtils.prototype = {
    initialize: function () {},

    /**
     * Returns a GlideRecord positioned on the record, or null if not found.
     */
    getRecord: function (table, sysId) {
        var gr = new GlideRecord(table);
        if (sysId && gr.get(sysId)) {
            return gr;
        }
        return null;
    },

    /**
     * Counts records matching an encoded query (ignores ACLs).
     */
    count: function (table, encodedQuery) {
        var ga = new GlideAggregate(table);
        if (encodedQuery) {
            ga.addEncodedQuery(encodedQuery);
        }
        ga.addAggregate('COUNT');
        ga.query();
        return ga.next() ? parseInt(ga.getAggregate('COUNT'), 10) : 0;
    },

    /**
     * Most recent RITM for a catalog item opened by a user in the last N minutes.
     * Used instead of step references so catalog tests survive step reordering.
     */
    latestRitm: function (catItemName, openedBy, withinMinutes) {
        var ritm = new GlideRecord('sc_req_item');
        ritm.addQuery('cat_item.name', catItemName);
        ritm.addQuery('opened_by', openedBy);
        ritm.addQuery('sys_created_on', '>=', gs.minutesAgoStart(withinMinutes || 10));
        ritm.orderByDesc('sys_created_on');
        ritm.setLimit(1);
        ritm.query();
        return ritm.next() ? ritm : null;
    },

    /**
     * Value of a catalog variable on a RITM, as a string ('' if missing).
     */
    getVariable: function (ritm, variableName) {
        var v = ritm.variables[variableName];
        return v === undefined || v === null ? '' : String(v);
    },

    /**
     * Approval records (sysapproval_approver) for a task, optionally by state.
     */
    approvalsFor: function (taskSysId, state) {
        var appr = new GlideRecord('sysapproval_approver');
        appr.addQuery('sysapproval', taskSysId);
        if (state) {
            appr.addQuery('state', state);
        }
        appr.query();
        return appr;
    },

    /**
     * Ordered list of "old->new" value changes of one field from sys_audit.
     * Example result for an incident state field: ['1->2', '2->3', '3->2', '2->6']
     */
    auditTransitions: function (table, sysId, fieldName) {
        var result = [];
        var audit = new GlideRecord('sys_audit');
        audit.addQuery('tablename', table);
        audit.addQuery('documentkey', sysId);
        audit.addQuery('fieldname', fieldName);
        audit.addNotNullQuery('oldvalue');
        audit.orderBy('sys_created_on');
        audit.orderBy('record_checkpoint');
        audit.query();
        while (audit.next()) {
            result.push(audit.getValue('oldvalue') + '->' + audit.getValue('newvalue'));
        }
        return result;
    },

    type: 'ATFItsmTestUtils'
};
