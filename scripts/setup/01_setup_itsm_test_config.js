/**
 * One-time setup for a Personal Developer Instance (PDI).
 * Run in: System Definition > Scripts - Background (scope: global), as admin.
 *
 * Safe to run more than once: every record is looked up before it is created.
 *
 * Creates:
 *   1. ATF runner enabled (sys_properties sn_atf.runner.enabled = true)
 *   2. Groups "Network" and "Software" (if missing)
 *   3. Assignment rule: incident category = network -> Network group
 *   4. Catalog item "Software Access Request" with 4 variables and choices
 *
 * Still to do by hand afterwards (see docs/build-guide.md):
 *   - the Flow Designer flow for the catalog item (approval + SC Task)
 *   - the Script Include and the two custom step configurations
 */
(function setupItsmTestConfig() {
    var ITEM_NAME = 'Software Access Request';

    function findOrCreate(table, query, fields) {
        var gr = new GlideRecord(table);
        gr.addEncodedQuery(query);
        gr.setLimit(1);
        gr.query();
        if (gr.next()) {
            gs.info('[ATF setup] exists: ' + table + ' ' + gr.getDisplayValue());
            return gr.getUniqueValue();
        }
        gr.initialize();
        for (var f in fields) {
            if (Object.prototype.hasOwnProperty.call(fields, f)) {
                gr.setValue(f, fields[f]);
            }
        }
        var id = gr.insert();
        gs.info('[ATF setup] created: ' + table + ' ' + gr.getDisplayValue());
        return id;
    }

    // 1. Allow tests to run on this instance
    gs.setProperty('sn_atf.runner.enabled', 'true');

    // 2. Groups
    var networkGroup = findOrCreate('sys_user_group', 'name=Network',
        { name: 'Network', description: 'Network support (ATF ITSM tests)' });
    var softwareGroup = findOrCreate('sys_user_group', 'name=Software',
        { name: 'Software', description: 'Software fulfilment (ATF ITSM tests)' });

    // 3. Assignment rule used by INC-02
    findOrCreate('sysrule_assignment', 'name=ATF - INC Network to Network group', {
        name: 'ATF - INC Network to Network group',
        table: 'incident',
        condition: 'category=network^assignment_groupISEMPTY',
        group: networkGroup,
        order: 100,
        active: true
    });

    // 4. Catalog item and variables used by CAT-01..CAT-04
    var catalog = new GlideRecord('sc_catalog');
    catalog.get('title', 'Service Catalog');
    var category = new GlideRecord('sc_category');
    category.addQuery('title', 'Software');
    category.addQuery('sc_catalog', catalog.getUniqueValue());
    category.query();
    category.next();

    var itemId = findOrCreate('sc_cat_item', 'name=' + ITEM_NAME, {
        name: ITEM_NAME,
        short_description: 'Request a software licence (used by ATF tests)',
        sc_catalogs: catalog.getUniqueValue(),
        category: category.getUniqueValue(),
        active: true
    });

    // item_option_new.type: 5 Select Box, 2 Multi Line Text, 9 Date, 8 Reference
    var variables = [
        { name: 'requested_for', question_text: 'Requested for', type: 8, order: 100, mandatory: true,
            reference: 'sys_user', default_value: 'javascript:gs.getUserID()' },
        { name: 'software', question_text: 'Software', type: 5, order: 200, mandatory: true },
        { name: 'business_justification', question_text: 'Business justification', type: 2, order: 300, mandatory: true },
        { name: 'needed_by', question_text: 'Needed by', type: 9, order: 400, mandatory: false }
    ];
    var softwareVarId = null;
    for (var i = 0; i < variables.length; i++) {
        var v = variables[i];
        v.cat_item = itemId;
        var varId = findOrCreate('item_option_new', 'cat_item=' + itemId + '^name=' + v.name, v);
        if (v.name === 'software') {
            softwareVarId = varId;
        }
    }

    var choices = [
        { text: 'Microsoft Visio', value: 'visio', order: 100 },
        { text: 'Adobe Acrobat Pro', value: 'acrobat', order: 200 },
        { text: 'Jira Software', value: 'jira', order: 300 }
    ];
    for (var c = 0; c < choices.length; c++) {
        choices[c].question = softwareVarId;
        findOrCreate('question_choice', 'question=' + softwareVarId + '^value=' + choices[c].value, choices[c]);
    }

    gs.info('[ATF setup] done. Software group sys_id: ' + softwareGroup + ', catalog item sys_id: ' + itemId);
})();
