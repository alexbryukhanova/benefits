BenefitsPlan = (function() {
    var constructor = function(data) {
        //this.planType = data.typeCodeName;
        //this.planName = data.electionDetails[0].values[0];
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

    constructor.prototype.testParent = function () {
        alert("Parent!");
    };

    return constructor;
})();

MedicalPlan = (function(_super) {
    function tmp() { }
    tmp.prototype = Object.create(_super.prototype);
    var constructor = new tmp();

//    var constructor = function(planData) {
//        this.prototype = new BenefitsPlan(planData);
//        _super.call(this, planData);
//
//        this.test = function() {
//            alert("Just testing");
//        }
//        this.testString = "Just testing";
//    }

    constructor.prototype.testChild = function () {
        alert("Parent!");
    };

    // code goes here
    constructor.prototype.labelColour = "danger";

    return constructor;
})(BenefitsPlan);

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