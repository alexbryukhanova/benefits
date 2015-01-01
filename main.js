if (Meteor.isClient) {
    Session.set("providersSearchResults", { message: "" });

    Meteor.methods({
        getProviders: function (searchString, location) {
            //Session.set("providersSearchResults", { message: "Searching for [" + searchString + "]" });
        }
    });

    var plans = new Meteor.Collection(null);
    HTTP.get("https://test-api.adp.com/benefits/v1/associates/G4O73G9Z62SL2NFM/benefit-elections",
        function(err, response) {
            var planData = JSON.parse(response.content);

            var plansFactory = new PlanFactory();
            var elections = planData.participantBenefitElections.currentElection.elections;
            for (var i = 0; i < elections.length; i++) {
                plans.insert(plansFactory.getPlan(elections[i]));
            }
            //selectedPlan.set(plans.find().fetch()[5]);
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

            var $parent = $(event.currentTarget).parent();
            var parentHeight = $parent.height();
            $parent.height(parentHeight);

            $(event.currentTarget)
                .css("z-index", 500)
                .animate({
                    height: "2000%",
                    width: "2000%",
                    left: "-950%",
                    top: "-950%"
                }, 500)
                .addClass("full-screen")
                .children().not(".close").css("visibility", "hidden");

            $(".benefits-details")
                .css("top", window.pageYOffset+"px")
                .css("left", window.pageXOffset+"px")
                .fadeToggle(750);

            $("body").css("overflow", "hidden");
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
        },
        planActivity: function () {
            var plan = selectedPlan.get();
            if(plan && plan !== null) {
                var activity = plan.getPlanActivity();
                return activity;
            } else {
                return null;
            }
        }
    });

    Template.benefitsDetails.events({
        "click .close": function (event, template) {
            //height/width=auto animation hack; thanks, jQuery! :(
            var summaryDiv = $(".summary.full-screen");
            var $parent = summaryDiv.parent();
            var targetHeight = ($parent.height() + 35) + "px";
            var targetWidth = (summaryDiv.parent().width()) + "px";

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
                    $parent.css("height", "");
                })
                .children().not(".close").css("visibility", "visible");
            $(".benefits-details")
                // Just in case user changes viewport
                .css("top", window.pageYOffset+"px")
                .css("left", window.pageXOffset+"px")
                .fadeToggle(750);
            $("body").css("overflow", "auto");

            // Clear all search forms/results
        },
        "submit #providersSearch": function(event, template) {
            var postCode = $("#postCode").val();
            var searchTerm = $("#providersSearchString").val();
            var submitButton = $("form#providersSearch").find("button[type=submit]");
            submitButton.html('<i class="fa fa-spinner fa-spin"></i> Searching for [' + searchTerm + ']');
            Meteor.call("getProviders", searchTerm, postCode, function success(error, data) {
                if(data.isSuccess) {
                    var providers = $.grep($(data.results), function (e) {
                        return e.id == "providers";
                    });
                    var providersTable = $(providers).find("#providersTable tr td:nth-child(2)");
                    var results = [];
                    $(providersTable).each(function (index, element) {
                        $(element).contents().not("br, b, a.links").filter(function () {
                            return this.nodeType != 3;
                        }).remove();

                        var name = $(element).find("a.links").text();
                        $(element).children("a").remove();

                        var firstBr;
                        var secondBr;
                        var bTag;

                        var address = "";
                        var phone = "";
                        var specialties = "";
                        $(element).contents().each(function (index, content) {
                            if (firstBr && firstBr > 0) {
                                address += $(content).text().trim();
                            } else if (secondBr && secondBr > 0) {
                                phone += $(content).text().trim();
                            } else if (bTag) {
                                specialties += $(content).text().trim();
                            }

                            if (content.nodeType === 1) {
                                if (!firstBr) {
                                    firstBr = index;
                                } else if (!secondBr) {
                                    secondBr = index;
                                    firstBr = -1;
                                } else if (!bTag) {
                                    if (secondBr && secondBr > 0) {
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
                } else {
                    Session.set("providersSearchResults", { message: data.message });
                }
                submitButton.html("Find professionals");
            });
            return false;
        }
    });
}

if (Meteor.isServer) {
    Meteor.startup(function () {
        Meteor.methods({
            getProviders: function (searchString, zipCode) {
                console.log("Searching " + searchString);

                //TODO: There seems to be another/better to do this: https://www.discovermeteor.com/blog/wrapping-npm-packages/
                Future = Npm.require('fibers/future');
                var futureResults = new Future();

                var URL = "http://www.aetna.com/dse/search/results?searchQuery=" + searchString.replace(" ", "+") +
                    "&geoSearch=" + zipCode +
                    "&pagination.offset=" +
                    "&zipCode=" + zipCode +
                    "&geoMainTypeAheadLastQuickSelectedVal=" + zipCode +
                    "&modalSelectedPlan=NJDMC" +
                    "&filterValues=";

                HTTP.get(URL,
                    //{ timeout: 300 },
                    function (err, response) {
                        if(err) {
                            console.log(err);
                            futureResults.return({ isSuccess: false, message: "Can't find anything"});
                            return;
                        } else {
                            futureResults.return({ isSuccess: true, results: response.content });
                            return;
                        }
                    }
                );
                return futureResults.wait();
            },
            getNearby: function(searchString, location, searchType) {
                Future = Npm.require('fibers/future');
                var futureResults = new Future();

                HTTP.get("https://maps.googleapis.com/maps/api/geocode/json?address=" + postCode + "&key=AIzaSyDQVpXtlofn54NisnHdzf4g7bn-n7tiQCU",
                    function done(err, response) {
                        console.log(err);
                        var results = JSON.parse(response.content);
                        var location = {
                            lat: results.results[0].geometry.location.lat,
                            lng: results.results[0].geometry.location.lng
                        };

                        HTTP.get("https://maps.googleapis.com/maps/api/place/nearbysearch/json?key=AIzaSyDQVpXtlofn54NisnHdzf4g7bn-n7tiQCU" +
                                "&location=" + location.lat + "," + location.lng +
                                "&types=" + searchType +
                                "&keyword=" + searchString +
                                "&radius=3000",
                            function (err, response) {
                                console.log(err);
                                var results = JSON.parse(response.content);

                                futureResults.return({ isSuccess: true, results: results });
                            }
                        );
                    });
                return futureResults.wait();
            }
        });
    });
}
