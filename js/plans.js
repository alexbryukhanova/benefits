BenefitsPlan = (function() {
    var constructor = function(data) {
        this.planType = data.typeCodeName;
        this.planName = data.electionDetails[0].values[0];
    };
    constructor.prototype.labelColour = "default";

    constructor.prototype.getContactInfo = function() {
        // request info
        console.log("Requesting Contact Information at [" + this.providerContactInfoUrl + "]");

        return {
            phone: "1-800-US-AETNA (1-800-872-3862) between 7:00am and 7:00pm ET",
            address: "Aetna Inc.\n" +
                "151 Farmington Avenue\n" +
                "Hartford, CT 06156\n" +
                "USA",
            geo: {
                lat: 41.766781,
                lng:-72.689567
            }
        };
    };

    return constructor;
})();

MedicalPlan = (function(_super) {
    var constructor = function(planData) {
        BenefitsPlan.call(this, planData);
    }
    constructor.prototype = Object.create(BenefitsPlan.prototype);
    constructor.prototype.constructor = constructor.constructor;

    // code goes here
    constructor.prototype.labelColour = "danger";

    return constructor;
})();

DentalPlan = (function(_super) {
    var constructor = function(planData) {
        this.prototype = _super;
        _super.call(this, planData);
    };

    // code goes here
    constructor.prototype.labelColour = "warning";

    return constructor;
})(BenefitsPlan);

VisionPlan = (function(_super) {
    var constructor = function(planData) {
        this.prototype = _super;
        _super.call(this, planData);
    };

    // code goes here
    constructor.prototype.labelColour = "success";

    return constructor;
})(BenefitsPlan);