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
            default:
                plan = new BenefitsPlan(planData);
                break;
        }

        return plan;
    }

    return constructor;
})();