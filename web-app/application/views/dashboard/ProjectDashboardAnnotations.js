var ProjectDashboardAnnotations = Backbone.View.extend({
   tabsAnnotation : null,
   annotationsViews : [], //array of annotation view
   selectedTerm: new Array(),
   selectUser : null,
   terms : null,
   ontology : null,
   doLayout : function (termTabTpl, termTabContentTpl, callback) {
      var self = this;
      this.selectUser =  "#filterAnnotationByUser"+self.model.id;
      new OntologyModel({id:self.model.get('ontology')}).fetch({
         success : function(model, response) {
            self.ontology = model;
            $(self.el).find("input.undefinedAnnotationsCheckbox").change(function(){
               if ($(this).attr("checked") == "checked") {
                  self.updateContentVisibility();
                  self.refreshAnnotations(0,self.getSelectedUser());
                  self.selectedTerm.push(0);
                  $("#tabsterm-panel-"+self.model.id+"-0").show();
               } else {
                  self.updateContentVisibility();
                  $("#tabsterm-panel-"+self.model.id+"-0").hide();
                  self.selectedTerm = _.without(self.selectedTerm, 0);
               }
            });
            $(self.el).find('#treeAnnotationListing').dynatree({
               checkbox: true,
               selectMode: 2,
               expand : true,
               onExpand : function() {},
               children: model.toJSON(),
               onSelect: function(select, node) {
                  //if(!self.activeEvent) return;
                  if (node.isSelected()) {
                     self.updateContentVisibility();
                     self.refreshAnnotations(node.data.key,self.getSelectedUser());
                     $("#tabsterm-panel-"+self.model.id+"-"+node.data.key).show();
                     console.log("select term "+node.data.key);
                     self.selectedTerm.push(node.data.key);
                     console.log("select term "+self.selectedTerm);
                  }
                  else {
                     self.updateContentVisibility();
                     $("#tabsterm-panel-"+self.model.id+"-"+node.data.key).hide();
                     console.log("unselect term "+node.data.key);
                     self.selectedTerm = _.without(self.selectedTerm, node.data.key);
                  }
               },
               onDblClick: function(node, event) {
                  //node.toggleSelect();
               },

               // The following options are only required, if we have more than one tree on one page:
               initId: "treeData-annotations-"+self.model.get('ontology'),
               cookieId: "dynatree-Cb-annotations-"+self.model.get('ontology'),
               idPrefix: "dynatree-Cb-annotations-"+self.model.get('ontology')+"-"
            });
            //expand all nodes
            $(self.el).find('#treeAnnotationListing').dynatree("getRoot").visit(function(node){
               node.expand(true);
            });
            $("#ontology-annotations-panel-"+self.model.id).panel();

            self.initSelectUser();

            $(self.el).find("#hideAllAnnotations").click(function(){
               self.hideAllUsers();
               self.hideAllTerms();
            });

            $(self.el).find("#showAllAnnotations").click(function(){
               self.showAllUsers();
               self.showAllTerms();
            });

            $(self.el).find("#refreshAnnotations").click(function(){
               self.refreshSelectedTermsWithUserFilter();
            });
            new TermCollection({idOntology:self.model.get('ontology')}).fetch({
               success : function (collection, response) {
                  self.terms = collection;
                  window.app.status.currentTermsCollection = collection;
                  $("#listtabannotation").prepend(_.template(termTabContentTpl, { project : self.model.id, id : 0, name : "Undefined"}));
                  $("#tabsterm-panel-"+self.model.id+"-0").panel();
                  $("#tabsterm-panel-"+self.model.id+"-0").hide();
                  collection.each(function(term) {
                     //add x term tab
                     $("#listtabannotation").prepend(_.template(termTabContentTpl, { project : self.model.id, id : term.get("id"), name : term.get("name")}));
                     $("#tabsterm-panel-"+self.model.id+"-"+term.get("id")).panel();
                     $("#tabsterm-panel-"+self.model.id+"-"+term.get("id")).hide();
                  });
                  callback.call();
               }});
         }
      });

   },
   checkTermsAndUsers : function(terms, users) {


      var _terms = (terms !="" && terms!= undefined);
      var _users = (users != "" && users != undefined);
      if (!_users && !_terms) {
         return;
      }
      this.hideAllTerms();
      this.hideAllUsers();
      if (_users && !_terms) {
         this.selectUsers(users);
         this.showAllTerms();
      } else if (_users && _terms) {
         this.selectUsers(users);
         this.selectTerms(terms);

      } else if (!_users && _terms) {
         this.showAllUsers();
         this.selectTerms(terms);
      }
      //self.projectDashboardAnnotations.refreshSelectedTermsWithUserFilter();
   },
   showAllTerms : function() {
      $(this.el).find("input.undefinedAnnotationsCheckbox").attr("checked", "checked");
      $(this.el).find("input.undefinedAnnotationsCheckbox").trigger("change");
      this.selectAnnotations(true);
   },
   showAllUsers : function() {
      $(this.selectUser).multiselect("checkAll");
   },
   hideAllTerms : function() {
      $(this.el).find("input.undefinedAnnotationsCheckbox").removeAttr("checked");
      $(this.el).find("input.undefinedAnnotationsCheckbox").trigger("change");
      this.selectAnnotations(false);
   },
   hideAllUsers : function() {
      $(this.selectUser).multiselect("uncheckAll");
   },
   render : function(callback) {
      var self = this;
      require(["text!application/templates/dashboard/TermTab.tpl.html", "text!application/templates/dashboard/TermTabContent.tpl.html"], function(termTabTpl, termTabContentTpl) {
         self.doLayout(termTabTpl, termTabContentTpl, callback);
      });
   },
   initSelectUser : function () {
      var self = this;
      $(self.selectUser).empty();
      $(self.selectUser).multiselect({
         selectedText: "# of # users selected",
         noneSelectedText : "No user are selected",
         checkAll: function(){
            console.log("click on user :"+self.selectedTerm + " users="+self.getSelectedUser());
            self.printAnnotationThumbAllTerms(self.selectedTerm,self.getSelectedUser());
         },
         uncheckAll: function(){
            console.log("click on user :"+self.selectedTerm + " users="+self.getSelectedUser());
            self.printAnnotationThumbAllTerms(self.selectedTerm,self.getSelectedUser());
         }
      });


      new UserCollection({project:self.model.id}).fetch({
         success : function (collection, response) {
            window.app.status.currentUsersCollection = collection;

            collection.each(function(user) {
               console.log('<option value="'+user.id+'">'+user.get("username")+'</option>');
               $(self.selectUser).append('<option value="'+user.id+'">'+user.get("username")+'</option>');
            });
            $(self.selectUser).multiselect("refresh");
            $(self.selectUser).multiselect("checkAll");

            $(self.selectUser).bind("multiselectclick", function(event, ui){
               console.log("click on "+ui.value);
               //self.refreshAnnotations(undefined,self.getSelectedUser());
               console.log("click on user :"+self.selectedTerm + " users="+self.getSelectedUser());
               self.printAnnotationThumbAllTerms(self.selectedTerm,self.getSelectedUser());

               /*
                event: the original event object

                ui.value: value of the checkbox
                ui.text: text of the checkbox
                ui.checked: whether or not the input was checked
                or unchecked (boolean)
                */
            });
         }});

//                    <option value="5">Option 5</option>
      //filterAnnotationByUser<%=   id %>
   },
   getSelectedUser : function() {
      var userArray = $(this.selectUser).multiselect("getChecked");
      var userId = new Array();
      _.each(userArray,function(user) {
         userId.push($(user).attr("value"));
      });
      if(userId.length==0)userId.push(-1); //WHY ?
      return userId;
   },

   /**
    * Add the the tab with term info
    * @param id  term id
    * @param name term name
    */
   addTermToTab : function(termTabTpl, termTabContentTpl, data) {
      //$("#ultabsannotation").append(_.template(termTabTpl, data));
      $("#listtabannotation").append(_.template(termTabContentTpl, data));

   },
   selectAnnotations : function (selected) {
      var self = this;
      this.terms.each(function(term) {
         $(self.el).find('#treeAnnotationListing').dynatree("getTree").selectKey(term.get("id"), selected);
      });
   },
   updateContentVisibility : function () {
      var tree = $(this.el).find('#treeAnnotationListing').dynatree("getRoot");
      if (!_.isFunction(tree.visit)) return; //tree is not yet loaded
      var nbTermSelected = 0;
      tree.visit(function(node){
         if (!node.isSelected()) return;
         nbTermSelected++;
      });
      nbTermSelected += ($(this.el).find("input.undefinedAnnotationsCheckbox").attr("checked") == "checked") ? 1 : 0;
      if (nbTermSelected > 0){
         $("#listtabannotation").show();
      } else {
         $("#listtabannotation").hide();
      }
   },
   refreshSelectedTerms : function () {
      var self = this;
      var tree = $(this.el).find('#treeAnnotationListing').dynatree("getRoot");
      if (!_.isFunction(tree.visit)) return; //tree is not yet loaded
      tree.visit(function(node){
         if (!node.isSelected()) return;
         self.refreshAnnotations(node.data.key);
      });
      if ($(this.el).find("input.undefinedAnnotationsCheckbox").attr("checked") == "checked") {
         self.refreshAnnotations(0);
      }
      self.updateContentVisibility();
   },
   selectTerms : function(terms) {
      terms = terms.split(",");
      var tree = $(this.el).find('#treeAnnotationListing').dynatree("getTree");
      _.each(terms, function (term) {
         var node = tree.getNodeByKey(term);
         node.select(true);
      });

   },
   selectUsers : function(users) {
      users = users.split(",");
      _.each(users, function (user) {
         $(".ui-multiselect-menu").find("input[value='"+user+"']").click();
      });
   },
   refreshSelectedTermsWithUserFilter : function () {
      return;
      var self = this;
      var users = self.getSelectedUser();
      var tree = $(this.el).find('#treeAnnotationListing').dynatree("getRoot");
      if (!_.isFunction(tree.visit)) return; //tree is not yet loaded
      tree.visit(function(node){
         if (!node.isSelected()) return;
         self.refreshAnnotations(node.data.key,users);
      });
      if ($(this.el).find("input.undefinedAnnotationsCheckbox").attr("checked") == "checked") {
         self.refreshAnnotations(0,users);
      }
      self.updateContentVisibility();
   },
   /**
    * Refresh all annotation dor the given term
    * @param term annotation term to be refresh (all = 0)
    */
   refreshAnnotations : function(term,users) {
      console.log("refreshAnnotations");
      this.printAnnotationThumb(term,"#tabsterm-"+this.model.id+"-"+term,users);
   },
   clearAnnotations : function (term) {
      console.log("clearAnnotations");
      var self = this;
      $("#tabsterm-"+self.model.id+"-"+term).empty();
   },
   /**
    * Print annotation for the given term
    * @param term term annotation term to be refresh (all = 0)
    * @param $elem  elem that will keep all annotations
    */
   printAnnotationThumbAllTerms : function(terms,users) {
      console.log("printAnnotationThumb="+users);
      var self = this;
      for(var i=0;i<terms.length;i++) {
         console.log("printAnnotationThumb loop="+users);
         self.printAnnotationThumb(terms[i],"#tabsterm-"+self.model.id+"-"+terms[i],users);
      }
   },
   printAnnotationThumb : function(idTerm,$elem,users){
      var self = this;
      console.log("users="+users);
      /*var idTerm = 0;
       if(term==0) {idTerm = undefined;}
       else idTerm = term*/
      console.log("AnnotationCollection: project="+self.model.id + " term="+idTerm + " users="+users);
      new AnnotationCollection({project:self.model.id,term:idTerm,users:users}).fetch({
         success : function (collection, response) {
            console.log("success");
            if (self.annotationsViews[idTerm] != null && users==undefined) { //only refresh
               self.annotationsViews[idTerm].refresh(collection,users);
               return;
            }
            console.log($elem);
            console.log($($elem).children().length);
            $($elem).empty();
            console.log($($elem).children().length);
            console.log("annotation size="+collection.length);
            self.annotationsViews[idTerm] = new AnnotationView({
               page : undefined,
               model : collection,
               el:$($elem),
               container : window.app.view.components.warehouse
            }).render();

            //self.annotationsViews[term].refresh(collection);
            $("#listtabannotation > div").tsort();
         }
      });
   }
});