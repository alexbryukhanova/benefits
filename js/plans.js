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

    constructor.prototype.getQueryString = function(query, location) {
        return "https://maps.googleapis.com/maps/api/place/nearbysearch/json?" +
            "key=AIzaSyDQVpXtlofn54NisnHdzf4g7bn-n7tiQCU" +
            "&location=" + location.lat + "," + location.lng +
            "&types=doctor" +
            //"&rankby=distance" +
            "&keyword=" + query.replace(" ", "+") +
            "&radius=3000";

        // Will have to wait until AETNA opens up APIs
//        return "http://www.aetna.com/dse/search/results?searchQuery=" + query.replace(" ", "+") +
//            "&geoSearch=07302" +
//            "&pagination.offset=" +
//            "&zipCode=07302" +
//            "&geoMainTypeAheadLastQuickSelectedVal=07302" +
//            "&modalSelectedPlan=NJDMC" +
//            "&filterValues=" +
//            "";


        // Other available URL parameters
//            "distance=0" +
//            "productPlanName=New+Jersey+Elect+Choice+w%2FPediatric+Dental+include%3A+Aetna+Advantage+2500+PD" +
//            "useZipForLatLonSearch=true" +
//        fastProduct=
//        currentSelectedPlan=
//        selectedMemberForZip=
//        sessionCachingKey=
//        loggedInZip=true

//        isTab1Clicked=
//        isTab2Clicked=
//        quickSearchTypeMainTypeAhead=
//        quickSearchTypeThrCol=
//        mainTypeAheadSelectionVal=
//        thrdColSelectedVal=
//        isMultiSpecSelected=
//        hospitalNavigator=

//        hospitalNameFromDetails=
//        planCodeFromDetails=
//        hospitalFromDetails=false
//        aetnaId=
//        Quicklastname=
//        Quickfirstname=
//        QuickZipcode=07302
//        QuickCoordinates=40.714676%2C-74.04996400000002
//        quickSearchTerm=
//        ipaFromDetails=
//        ipaFromResults=
//        ipaNameForProvider=
//        porgId=
//        officeLocation=
//        otherOfficeProviderName=
//        officesLinkIsTrueDetails=false
//        groupnavigator=
//        groupFromDetails=
//        groupFromResults=
//        groupNameForProvider=
//        suppressFASTCall=
//        classificationLimit=
//        suppressFASTDocCall=
//        axcelSpecialtyAddCatTierTrueInd=
//        suppressHLCall=
//        pcpSearchIndicator=
//        specSearchIndicator=
//        stateCode=

//        geoBoxSearch=true
//        lastPageTravVal=
//            debugInfo=
//                linkwithoutplan=
//                    site_id=ivl
//        sendZipLimitInd=
//            ioeqSelectionInd=
//                ioe_qType=
                    //sortOrder=
    };

    constructor.prototype.getPlanActivity = function () {

    };

    return constructor;
})();

DeductiblePlan = (function(_super) {
    var constructor = function(planData) {
        _super.call(this, planData);

        this.deduction = {
            nextDeduction: planData.electionDetails[1].values[0],
            nextDeductionDate: moment().startOf('month').add(1, 'M').format('MMMM YYYY') //next month
        };
    };
    constructor.prototype = Object.create(_super.prototype);
    constructor.prototype.constructor = constructor.constructor;

    // code goes here
    constructor.prototype.labelColour = "default";

    return constructor;
})(BenefitsPlan);

MedicalPlan = (function(_super) {
    var constructor = function(planData) {
        _super.call(this, planData);

        this.deduction = {
            nextDeduction: planData.electionDetails[1].values[0],
            nextDeductionDate: moment().startOf('month').add(1, 'M').format('MMMM YYYY') //next month
        };
    };
    constructor.prototype = Object.create(_super.prototype);
    constructor.prototype.constructor = constructor.constructor;

    // code goes here
    constructor.prototype.labelColour = "danger";

    return constructor;
})(BenefitsPlan);

DentalPlan = (function(_super) {
    var constructor = function(planData) {
        _super.call(this, planData);

        this.deduction = {
            nextDeduction: planData.electionDetails[1].values[0],
            nextDeductionDate: moment().startOf('month').add(1, 'M').format('MMMM YYYY') //next month
        };
    };
    constructor.prototype = Object.create(_super.prototype);
    constructor.prototype.constructor = constructor.constructor;

    // code goes here
    constructor.prototype.labelColour = "warning";

    return constructor;
})(BenefitsPlan);

VisionPlan = (function(_super) {
    var constructor = function(planData) {
        _super.call(this, planData);

        this.deduction = {
            nextDeduction: planData.electionDetails[1].values[0],
            nextDeductionDate: moment().startOf('month').add(1, 'M').format('MMMM YYYY') //next month
        };
    };
    constructor.prototype = Object.create(_super.prototype);
    constructor.prototype.constructor = constructor.constructor;

    // code goes here
    constructor.prototype.labelColour = "info";

    return constructor;
})(BenefitsPlan);

FSA = (function(_super) {
    var constructor = function(planData) {
        _super.call(this, planData);

        var spent = Random.fraction();
        var goalLabel = planData.electionDetails[1].values[0];
        var goal = parseInt(goalLabel.substring(1, goalLabel.length-1));

        this.spending = {
            currentSpent: (goal * spent).toFixed(2),
            currentSpentFraction: spent * 100,
            goal: goal
        };
    };
    constructor.prototype = Object.create(_super.prototype);
    constructor.prototype.constructor = constructor.constructor;

    // code goes here
    constructor.prototype.labelColour = "success";

    constructor.prototype.getPlanActivity = function () {
        var startOfYear = moment().startOf('year');
        var dayCount = moment().diff(startOfYear, 'days');
        var goalCounter = this.spending.goal;
        var activity = [];
        activity.push({
            name: "Store purchase",
            date: startOfYear.add(Random.fraction() * dayCount, 'd').format('YYYY/MM/DD'),
            amount: (Random.fraction() * goalCounter).toFixed(2)
        });
        goalCounter -= activity[0].amount;
        dayCount = moment().diff(startOfYear, 'days');
        activity.push({
            name: "Store purchase",
            date: startOfYear.add(Random.fraction() * dayCount, 'd').format('YYYY/MM/DD'),
            amount: (Random.fraction() * goalCounter).toFixed(2)
        });
        goalCounter -= activity[1].amount;
        dayCount = moment().diff(startOfYear, 'days');
        activity.push({
            name: "Procedure",
            date: startOfYear.add(Random.fraction() * dayCount, 'd').format('YYYY/MM/DD'),
            amount: (Random.fraction() * goalCounter).toFixed(2)
        });
        goalCounter -= activity[2].amount;
        dayCount = moment().diff(startOfYear, 'days');
        activity.push({
            name: "Procedure",
            date: startOfYear.add(Random.fraction() * dayCount, 'd').format('YYYY/MM/DD'),
            amount: (Random.fraction() * goalCounter).toFixed(2)
        });
        goalCounter -= activity[3].amount;
        dayCount = moment().diff(startOfYear, 'days');
        activity.push({
            name: "Store purchase",
            date: startOfYear.add(Random.fraction() * dayCount, 'd').format('YYYY/MM/DD'),
            amount: (Random.fraction() * goalCounter).toFixed(2)
        });
        return activity;
    };

    return constructor;
})(BenefitsPlan);
