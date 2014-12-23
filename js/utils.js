PlanFactory = (function() {
    var constructor = function() { };

    constructor.prototype.getPlan = function(planData) {
        var plan;

        switch(planData.typeCodeName) {
            case "Medical":
                plan = new MedicalPlan(planData);
                break;
            case "Dental":
                plan = new DentalPlan(planData);
                break;
            case "Vision":
                plan = new VisionPlan(planData);
                break;
            case "Spending Account":
                plan = new FSA(planData);
                break;
            case "Long Term Disability":
                plan = new DeductiblePlan(planData);
                break;
            default:
                plan = new BenefitsPlan(planData);
                break;
        }

        return plan;
    }

    return constructor;
})();