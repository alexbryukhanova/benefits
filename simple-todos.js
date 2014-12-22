if (Meteor.isClient) {
    var plans = new Meteor.Collection(null);

    var planData = HTTP.get("https://test-api.adp.com/benefits/v1/associates/G4O73G9Z62SL2NFM/benefit-elections",
        function(err, response) {
            var planData = JSON.parse(response.content);

            var plansFactory = new PlanFactory();
            var elections = planData.participantBenefitElections.currentElection.elections;
            for (var i = 0; i < elections.length; i++) {
                plans.insert(plansFactory.getPlan(elections[i]));
            }
        }
    );
    Template.profile.helpers({
        user: {
         user_name: "Alex Bryukhanova",
         user_picture: "/tmp/alex_square.jpg"
        },
        plans: function() {
            return plans.find();
        }
    });

    var selectedPlan = {
        dep: new Deps.Dependency(),
        currentPlan: null,
        get: function () {
            this.dep.depend();
            return this.currentPlan;
        },
        set: function (newPlan) {
            this.currentPlan = newPlan;
            this.dep.changed();
        }
    };
    Template.planSummary.events({
        "click .summary": function(event, template){
            selectedPlan.set(template.data);

            $(event.currentTarget)
                .css("z-index", 500)
                .animate({
                    height: "2000%",
                    width: "2000%",
                    left: "-950%",
                    top: "-950%"
                }, 500)
                .scrollTop();
            $(".benefits-details").fadeToggle(750);
        }
    });

    Template.benefitsDetails.helpers({
        plan: function() {
            return selectedPlan.get();
        },
        contactInfo: function () {
            var plan = selectedPlan.get();
            console.log(plan);
            if(plan && plan !== null) {
                var info = plan.getContactInfo();
                console.log(info);
                return info;
            } else {
                return {};
            }
        }
    });

    Template.benefitsDetails.events({
        "click .benefits-details": function(event, template) {
            console.log(Session.get("selectedPlan"))
        }
    });
}

if (Meteor.isServer) {
    Meteor.startup(function () {

    });
}
