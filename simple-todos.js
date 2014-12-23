if (Meteor.isClient) {
    Session.set("providersSearchResults", { message: "" });

    Meteor.methods({
        getProviders: function (searchString, location) {
            Session.set("providersSearchResults", { message: "Searching for [" + searchString + "]" });
        }
    });

    var plans = new Meteor.Collection(null);

    var planData = HTTP.get("https://test-api.adp.com/benefits/v1/associates/G4O73G9Z62SL2NFM/benefit-elections",
        function(err, response) {
            var planData = JSON.parse(response.content);

            var plansFactory = new PlanFactory();
            var elections = planData.participantBenefitElections.currentElection.elections;
            for (var i = 0; i < elections.length; i++) {
                plans.insert(plansFactory.getPlan(elections[i]));
            }
            //selectedPlan.set(plans.find().fetch()[0]);
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
                .addClass("full-screen")
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
            if(plan && plan !== null) {
                var info = plan.getContactInfo();
                return info;
            } else {
                return {};
            }
        },
        providersSearchResults: function () {
            return Session.get("providersSearchResults");
        }
    });

    Template.benefitsDetails.events({
        "click .close": function (event, template) {
            //height/width=auto animation hack; thanks, jQuery! :(
            var summaryDiv = $(".summary.full-screen");
            var targetHeight = (summaryDiv.css("height", "auto").height() + 20) + "px";
            summaryDiv.css("height", "2000%");
            var targetWidth = (summaryDiv.css("width", "auto").width() + 20) + "px";
            summaryDiv.css("width", "2000%");

            $(".benefits-details").fadeToggle(500);
            summaryDiv
                .animate({
                    left: "0",
                    top: "0",
                    height: targetHeight,
                    width: targetWidth
                }, 500, function done() {
                    $(this)
                        .css("height", "auto")
                        .css("width", "auto")
                        .css("z-index", "auto")
                        .removeClass("full-screen");
                })
                .scrollTop();
        },
        "click #providersSearchBtn": function(event, template) {
            var postCode = $("#postCode").val();
            var searchTerm = $("#providersSearchString").val();
            Meteor.call("getProviders", searchTerm, postCode, function success(error, data) {
                if(!data.isSuccess) {
                    Session.set("providersSearchResults", { message: data.message });
                    return;
                }
                var providers = $.grep($(data.results), function(e){ return e.id == "providers"; });
                var providersTable = $(providers).find("#providersTable tr td:nth-child(2)");
                var results = [];
                $(providersTable).each(function(index, element){
                    $(element).contents().not("br, b, a.links").filter(function(){return this.nodeType != 3;}).remove();

                    var name = $(element).find("a.links").text();
                    $(element).children("a").remove();

                    var firstBr;
                    var secondBr;
                    var bTag;

                    var address = "";
                    var phone = "";
                    var specialties = "";
                    $(element).contents().each(function(index, content){
                        if(firstBr && firstBr > 0) {
                            address += $(content).text().trim();
                        } else if (secondBr && secondBr > 0) {
                            phone += $(content).text().trim();
                        } else if (bTag) {
                            specialties += $(content).text().trim();
                        }

                        if(content.nodeType === 1) {
                            if (!firstBr) {
                                firstBr = index;
                            } else if(!secondBr) {
                                secondBr = index;
                                firstBr = -1;
                            } else if (!bTag) {
                                if(secondBr && secondBr > 0) {
                                    secondBr = -1;
                                } else {
                                    bTag = index;
                                }
                            }
                        }


                    });
                    results.push({
                        name: name,
                        address: address,
                        phone: phone,
                        specialties: specialties
                    });
                });

                Session.set("providersSearchResults", { list: results });
            });
        }
    });
}

if (Meteor.isServer) {
    Meteor.startup(function () {
        Meteor.methods({
            getProviders: function (searchString, location) {
                console.log("Searching " + searchString);
                Future = Npm.require('fibers/future');
                var futureResults = new Future();


                var URL = "http://www.aetna.com/dse/search/results?searchQuery=" + searchString.replace(" ", "+") +
                    "&geoSearch=07302" +
                    "&pagination.offset=" +
                    "&zipCode=07302" +
                    "&geoMainTypeAheadLastQuickSelectedVal=07302" +
                    "&modalSelectedPlan=NJDMC" +
                    "&filterValues=";

                HTTP.get(URL,
                    { timeout: 60000 },
                    function (err, response) {
                        if(err) {
                            console.log(err);
                            futureResults.return({ isSuccess: false, message: "Can't find anything"});
                            return;
                        } else {
                            futureResults.return({ isSuccess: true, results: response.content });
                            return;
                        }
//                        var results = $(response.content).find("#providers");
                        var results = $(response.content).find("#providers");
                        if(results.status === "OK") {
                            console.log(results);
                            futureResults.return(results);
                        } else {
                            futureResults.return("Can't find anything");
                        }
                    }
                );


//                HTTP.get("https://maps.googleapis.com/maps/api/place/nearbysearch/json?key=AIzaSyDQVpXtlofn54NisnHdzf4g7bn-n7tiQCU&location=40.7218318,-74.0447003&types=doctor&keyword=annual+checkup&radius=3000",
//                HTTP.get("https://maps.googleapis.com/maps/api/geocode/json?address=" + postCode + "&key=AIzaSyDQVpXtlofn54NisnHdzf4g7bn-n7tiQCU",
//                    function done(err, response) {
//                        console.log(err);
//                        var results = JSON.parse(response.content);
//                        var location = {
//                            lat: results.results[0].geometry.location.lat,
//                            lng: results.results[0].geometry.location.lng
//                        };
//
//                        var URL = selectedPlan.get().getQueryString(searchString, location);
//                        HTTP.get(URL,
//                            function (err, response) {
//                                console.log(err);
//                                var results = JSON.parse(response.content);
//
//                                futureResults.return({ isSuccess: true, results: results });
//                            }
//                        );
//                    });
                return futureResults.wait();
            }
        });

    });
}
