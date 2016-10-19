/**
 * @module ui/inspectors/vmware-credentials.reel/vmware-credentials.reel
 */
var Component = require("montage/ui/component").Component;

/**
 * @class VmwareCredentials
 * @extends Component
 */
exports.VmwareCredentials = Component.specialize(/** @lends VmwareCredentials# */ {
    enterDocument: {
        value: function() {
            this.object.credentials = {};
            this.object.credentials['%type'] = this.object.type + '-credentials';
        }
    },

    exitDocument: {
        value: function() {
            this.object.credentials.password = null;
        }
    }
});
