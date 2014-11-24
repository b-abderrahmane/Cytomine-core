var ProjectDashboardConfig = Backbone.View.extend({
    initialize: function (options) {
        this.el = "#tabs-config-" + this.model.id;
        this.rendered = false;
    },
    render: function () {
        new ImageFiltersProjectPanel({
            el: this.el,
            model: this.model
        }).render();
        new SoftwareProjectPanel({
            el: this.el,
            model: this.model
        }).render();
        new DefaultLayerPanel({
            model: this.model
        }).render();
        new MagicWandConfig({}).render();
        this.rendered = true;

        new CutomUIPanel({}).render();
    },
    refresh: function () {
        if (!this.rendered) {
            this.render();
        }
    }

});

var MagicWandConfig = Backbone.View.extend({
    thresholdKey: null,
    toleranceKey: null,
    initialize: function () {
        this.toleranceKey = "mw_tolerance" + window.app.status.currentProject;
        if (window.localStorage.getItem(this.toleranceKey) == null) {
            window.localStorage.setItem(this.toleranceKey, Processing.MagicWand.defaultTolerance);
        }
        this.thresholdKey = "th_threshold" + window.app.status.currentProject;
        if (window.localStorage.getItem(this.thresholdKey) == null) {
            window.localStorage.setItem(this.thresholdKey, Processing.Threshold.defaultTheshold);
        }
        return this;
    },

    render: function () {
        this.fillForm();
        this.initEvents();
    },

    initEvents: function () {
        var self = this;
        var form = $("#mwToleranceForm");
        var max_euclidian_distance = Math.ceil(Math.sqrt(255 * 255 + 255 * 255 + 255 * 255)) //between pixels
        form.on("submit", function (e) {
            e.preventDefault();
            //tolerance
            var toleranceValue = parseInt($("#input_tolerance").val());
            if (_.isNumber(toleranceValue) && toleranceValue >= 0 && toleranceValue < max_euclidian_distance) {
                window.localStorage.setItem(self.toleranceKey, Math.round(toleranceValue));
                var successMessage = _.template("Tolerance value for project <%= name %> is now <%= tolerance %>", {
                    name: window.app.status.currentProjectModel.get('name'),
                    tolerance: toleranceValue
                });
                window.app.view.message("Success", successMessage, "success");
            } else {
                window.app.view.message("Error", "Tolerance must be an integer between 0 and " + max_euclidian_distance, "error");
            }

            var thresholdValue = parseInt($("#input_threshold").val());
            if (_.isNumber(thresholdValue) && thresholdValue >= 0 && thresholdValue < 255) {
                window.localStorage.setItem(self.thresholdKey, Math.round(thresholdValue));
                successMessage = _.template("Threshold value for project <%= name %> is now <%= threshold %>", {
                    name: window.app.status.currentProjectModel.get('name'),
                    threshold: thresholdValue
                });
                window.app.view.message("Success", successMessage, "success");
            } else {
                window.app.view.message("Error", "Threshold must be an integer between 0 and 255", "error");
            }
        });
    },

    fillForm: function () {
        $("#input_tolerance").val(window.localStorage.getItem(this.toleranceKey));
        $("#input_threshold").val(window.localStorage.getItem(this.thresholdKey));
    }
});

var SoftwareProjectPanel = Backbone.View.extend({

    removeSoftware: function (idSoftwareProject) {
        var self = this;
        new SoftwareProjectModel({ id: idSoftwareProject }).destroy({
            success: function (model, response) {
                $(self.el).find("li.software" + idSoftwareProject).remove();
                window.app.view.message("", response.message, "success");
            },
            error: function (model, response) {

            }
        });
        return false;
    },

    renderSoftwares: function () {
        var self = this;
        var el = $(this.el).find(".softwares");
        new SoftwareProjectCollection({ project: self.model.id}).fetch({
            success: function (softwareProjectCollection, response) {
                softwareProjectCollection.each(function (softwareProject) {
                    self.renderSoftware(softwareProject, el);
                });
            }
        });

    },
    renderSoftware: function (softwareProject, el) {
        var tpl = _.template("<li class='software<%= id %>' style='padding-bottom : 3px;'><a class='btn btn-default  btn-sm btn-danger removeSoftware' data-id='<%= id %>' href='#'><i class='icon-trash icon-white' /> Delete</a> <%= name %></li>", softwareProject.toJSON());
        $(el).append(tpl);
    },

    render: function () {
        var self = this;
        var el = $(this.el).find(".softwares");
        new SoftwareCollection().fetch({
            success: function (softwareCollection, response) {
                softwareCollection.each(function (software) {
                    var option = _.template("<option value='<%= id %>'><%= name %></option>", software.toJSON());
                    $(self.el).find("#addSoftware").append(option);
                });
                $(self.el).find("#addSoftwareButton").click(function (event) {
                    event.preventDefault();
                    new SoftwareProjectModel({ project: self.model.id, software: $(self.el).find("#addSoftware").val()}).save({}, {
                        success: function (softwareProject, response) {
                            self.renderSoftware(new SoftwareProjectModel(softwareProject.toJSON().softwareproject), el);
                            window.app.view.message("", response.message, "success");
                        },
                        error: function (model, response) {
                            window.app.view.message("", $.parseJSON(response.responseText).errors, "error");
                        }
                    });
                    return false;
                });
            }
        });

        self.renderSoftwares();

        $(document).on('click', "a.removeSoftware", function () {
            var idSoftwareProject = $(this).attr('data-id');
            self.removeSoftware(idSoftwareProject);
            return false;
        });

        return this;
    }

});

var DefaultLayerPanel = Backbone.View.extend({

    render: function () {
        var self = this;

        $("#selectedDefaultLayers").hide();

        // load all user and admin of the project
        new UserCollection({project: self.model.id}).fetch({
            success: function (projectUserCollection, response) {
                projectUserCollection.each(function(user) {
                    $('#availableprojectdefaultlayers').append('<option value="'+ user.id +'">' + user.prettyName() + '</option>');
                });
            }
        });




        $('#projectadddefaultlayersbutton').click(function() {

            var container = $('#availableprojectdefaultlayers')[0];
            var selected = container.options[container.options.selectedIndex];
            if(selected.value != null && selected.value != undefined && selected.value != '') {
                $("#selectedDefaultLayers").show();
                // check if not already taken
                if ($('#selectedDefaultLayers #defaultlayer' + selected.value).length == 0) {
                    $('#selectedDefaultLayers').append('<div class="col-md-3 col-md-offset-1"><input type="checkbox" id="hideByDefault' + selected.value + '"> Hide layers by default</div>');
                    $('#selectedDefaultLayers').append('<div class="col-md-5"><p>' + selected.text + '</p></div>');
                    $('#selectedDefaultLayers').append('<div class="col-md-2"><a id="defaultlayer' + selected.value + '" class="projectremovedefaultlayersbutton btn btn-info" href="javascript:void(0);">Remove</a></div>');
                }
            }
        });
        $('#selectedDefaultLayers').on('click', '.projectremovedefaultlayersbutton', function() {
            $(this).parent().prev().prev().remove();
            $(this).parent().prev().remove();
            $(this).parent().remove();
            if($("#selectedDefaultLayers").children().length ==0){
                $("#selectedDefaultLayers").hide();
            }
        });

        // existing default layers
        new ProjectDefaultLayerCollection({project: self.model.id}).fetch({
            success: function (collection) {
                var defaultLayersArray=[]
                collection.each(function(layer) {
                    defaultLayersArray.push({id: layer.id, userId: layer.attributes.user, hideByDefault: layer.attributes.hideByDefault});
                });


                for(var i = 0; i<defaultLayersArray.length; i++){
                    $("#selectedDefaultLayers").show();
                    // check if not already taken
                    $('#selectedDefaultLayers').append('<div class="col-md-3 col-md-offset-1"><input type="checkbox" id="hideByDefault' + defaultLayersArray[i].userId + '"> Hide layers by default</div>');
                    $('#hideByDefault' + defaultLayersArray[i].userId)[0].checked = defaultLayersArray[i].hideByDefault;
                    $('#selectedDefaultLayers').append('<div id = "tmp'+ defaultLayersArray[i].userId +'" class="col-md-5"><p></p></div>');
                    $('#selectedDefaultLayers').append('<div class="col-md-2"><a id="defaultlayer' + defaultLayersArray[i].userId + '" class="projectremovedefaultlayersbutton btn btn-info" href="javascript:void(0);">Remove</a></div>');
                    new UserModel({id: defaultLayersArray[i].userId}).fetch({
                        success: function (model) {
                            $('#tmp'+model.id).find("p").text(model.prettyName());
                            $('#tmp'+model.id).removeAttr('id');
                        }
                    });
                }
            }
        });

        $('#savedefaultlayers').click(function() {

            new ProjectDefaultLayerCollection({project: self.model.id}).fetch({
                success: function (collection) {
                    var model;
                    var destroyed = 0;
                    var models = collection.length;

                    var saveAll = function () {
                        if(destroyed == models){
                            var layers = $('#selectedDefaultLayers .projectremovedefaultlayersbutton');
                            console.log("layers.length");
                            console.log(layers.length);
                            console.log("self.model.id");
                            console.log(self.model.id);

                            for(var i = 0; i<layers.length;i++){
                                var id = $(layers[i]).attr("id").replace("defaultlayer","");
                                var hide = $('#hideByDefault' + id)[0].checked;
                                var layer = new ProjectDefaultLayerModel({user: id, project: self.model.id, hideByDefault: hide});
                                layer.save(null, {
                                    success: function (model) {
                                        console.log("save success");
                                    },
                                    error: function (x, y) {
                                        console.log("save error");
                                        console.log(x);
                                        console.log(y.responseText);
                                    }
                                });
                            }
                            window.app.view.message("Project Default Layers", "Default layers saved!", "success");
                        }
                    };

                    if(models == 0){
                        saveAll();
                    }

                    while (model = collection.first()) {
                        model.destroy({
                            success: function () {
                                console.log("destroy");
                                destroyed++;
                                saveAll();
                            }
                        });
                    }
                }
            });
        });
        return this;
    }

});

var ImageFiltersProjectPanel = Backbone.View.extend({
    removeImageFilter: function (idImageFilter) {
        var self = this;
        new ProjectImageFilterModel({ id: idImageFilter}).destroy({
            success: function (model, response) {
                $(self.el).find("li.imageFilter" + idImageFilter).remove();
                window.app.view.message("", response.message, "success");
            }
        });
        return false;
    },
    renderFilters: function () {
        var self = this;
        var el = $(this.el).find(".image-filters");
        new ProjectImageFilterCollection({ project: self.model.id}).fetch({
            success: function (imageFilters, response) {
                imageFilters.each(function (imageFilter) {
                    self.renderImageFilter(imageFilter, el);
                });
            }
        });
    },
    renderImageFilter: function (imageFilter, el) {
        var tpl = _.template("<li class='imageFilter<%= id %>' style='padding-bottom : 3px;'> <a class='btn btn-default  btn-sm btn-danger removeImageFilter' data-id='<%= id %>' href='#'><i class=' icon-trash icon-white' /> Delete</a> <%= name %></li>", imageFilter.toJSON());
        $(el).append(tpl);
    },
    render: function () {
        var self = this;
        var el = $(this.el).find(".image-filters");
        new ImageFilterCollection().fetch({
            success: function (imageFilters, response) {
                imageFilters.each(function (imageFilter) {
                    var option = _.template("<option value='<%=  id %>'><%=   name %></option>", imageFilter.toJSON());
                    $(self.el).find("#addImageFilter").append(option);

                });
                $(self.el).find("#addImageFilterButton").click(function (event) {
                    event.preventDefault();
                    new ProjectImageFilterModel({ project: self.model.id, imageFilter: $(self.el).find("#addImageFilter").val()}).save({}, {
                        success: function (imageFilter, response) {
                            self.renderImageFilter(new ImageFilterModel(imageFilter.toJSON().imagefilterproject), el);
                            window.app.view.message("", response.message, "success");
                        },
                        error: function (response) {
                            window.app.view.message("", $.parseJSON(response.responseText).errors, "error");
                        }
                    });
                    return false;
                });
            }
        });

        self.renderFilters();

        $(document).on('click', "a.removeImageFilter", function () {
            var idImageFilter = $(this).attr("data-id");
            self.removeImageFilter(idImageFilter);
            return false;
        });
        return this;

    }
});


var CutomUIPanel = Backbone.View.extend({
    obj : null,

    refresh : function() {
        var self = this;
        var elTabs = $("#custom-ui-table-tabs");
        var elPanels = $("#custom-ui-table-panels");
        var elTools = $("#custom-ui-table-tools");

        var fn = function() {
            require(["text!application/templates/dashboard/config/CustomUIItem.tpl.html"], function (customUIItemTpl) {
                elTabs.empty();
                elPanels.empty();
                elTools.empty();

                _.each(CustomUI.components,function(component) {
                    self.createComponentConfig(component,customUIItemTpl,elTabs);
                });
                _.each(CustomUI.componentsPanels,function(component) {
                    self.createComponentConfig(component,customUIItemTpl,elPanels);
                });
                _.each(CustomUI.componentsTools,function(component) {
                    self.createComponentConfig(component,customUIItemTpl,elTools);
                });

                $("#btn-project-configuration-tab-ADMIN_PROJECT").attr("disabled", "disabled");

                $("#custom-ui-table").find("button").click(function(eventData,ui) {

                    console.log(eventData.target.id);
                    var currentButton = $("#"+eventData.target.id);
                    var isActiveNow = self.obj[currentButton.data("component")][currentButton.data("role")]==true;
                    currentButton.removeClass(isActiveNow? "btn-success" : "btn-danger");
                    currentButton.addClass(isActiveNow? "btn-danger" : "btn-success");
                    self.obj[currentButton.data("component")][currentButton.data("role")]=!self.obj[currentButton.data("component")][currentButton.data("role")];
                    self.addConfig();
                })

            });
        }
        self.retrieveConfig(fn);
    },
    createComponentConfig : function(component, template,mainElement) {
        var self = this;
        var customUI = _.template(template,component);
        $(mainElement).append(customUI);
        var tr = $(mainElement).find("#customUI-"+component.componentId+"-roles");
        tr.append("<td>"+component.componentName+"</td>");
        if(!self.obj[component.componentId]) {
            //component is not define in the project config, active by default
            self.obj[component.componentId] = {};
            _.each(CustomUI.roles,function(role) {
                var active = true;
                self.obj[component.componentId][role.authority] = active;
                tr.append(self.createButton(role,component,active));
            });
        } else {
            _.each(CustomUI.roles,function(role) {
                var active = true;
                if( !self.obj[component.componentId][role.authority]) {
                    active = false;
                }
                tr.append(self.createButton(role,component,active));
            });

        }
    },
    render: function () {
        var self = this;

        self.refresh();
        return this;
    },
    addConfig : function() {
        var self = this;
        $.ajax({
            type: "POST",
            url: "custom-ui/project/"+window.app.status.currentProject+".json",
            data: JSON.stringify(self.obj),
            contentType:"application/json; charset=utf-8",
            dataType:"json",
            success: function() {
                self.refresh();
                window.app.view.message("Project", "Configuration save!", "success");
                CustomUI.customizeUI(function() {CustomUI.hideOrShowComponents();});
            }
        });
    },
    retrieveConfig : function(callback) {
        var self = this;
        $.get( "custom-ui/project/"+window.app.status.currentProject+".json", function( data ) {
            self.obj = data;
            callback();
        });
    },
    createButton : function(role,component, active) {
        var classBtn = active? "btn-success" : "btn-danger";
        return '<td><button type="radio" data-component="'+component.componentId+'" data-role="'+role.authority+'" id="btn-' + component.componentId +'-'+role.authority+'" class="btn  btn-large btn-block '+classBtn+'">'+role.name+'</button></td>';
    }

});
