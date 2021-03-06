$(document).ready(function () {
  
  // This line SHOULD allow the scrollBar to stay fixed at the bottom of the screen. But not working
  // https://github.com/gromo/jquery.scrollbar. 
  // If not used: remove src/main/webapp/css/jquery.floatingscroll.css and src/main/webapp/scripts/jquery.floatingscroll.min.js
  $(".validationForm").floatingScroll();
  
// Function to resize navbar, footer and right entity details window depending on screen size
  function resizePanels() {
    var contentSourceSize = $(".entity-source .entity-inner-content").height();
    var contentTargetSize = $(".entity-target .entity-inner-content").height();
    var headerHeight = $("header").height();
    var footerHeight = $("footer").height();
    var contentWidth = $(".entities").width() - 30;
    var totalSize = $(window).height() - headerHeight - footerHeight;
    var halfSize = Math.floor(totalSize / 2);
    var newSourceSize = (contentSourceSize < halfSize) ? contentSourceSize : halfSize;
    var newTargetSize = (contentTargetSize < halfSize) ? contentTargetSize : halfSize;
    //console.log("contentSourceSize", contentSourceSize, "contentTargetSize", contentTargetSize, "totalSize", totalSize)
    $(".entity-source").css({"flexBasis": newSourceSize + "px"});
    $(".entity-target").css({"flexBasis": newTargetSize + "px"});
    $("aside").css({"paddingTop": headerHeight + "px", "paddingBottom": footerHeight + "px"})
    $("main").css({"paddingTop": headerHeight + "px", "paddingBottom": footerHeight + "px"})

    $(".entity-source .entity-content").css({"height": $(".entity-source").height() + "px", "width": contentWidth + "px"});
    $(".entity-target .entity-content").css({"height": $(".entity-target").height() + "px", "width": contentWidth + "px"});
  }

// Button to switch between text and graph entities details
  $(".switch-nav").on("click", "li", function () {
    $(".entity-view").hide();
    $(this).find("button").addClass("btn-info");
    $(this).siblings("li").find("button").removeClass("btn-info");
    $(".entity-" + $(this).attr("class")).show();
  })

  $(window).on('resize', function () {
    resizePanels();
  })
  resizePanels();
});
// Using rzSlider for 2 sliders range input
var validationApp = angular.module('validationApp', ['rzModule', 'ui.bootstrap']);
/**
 * ValidationApp controller, define all angular interactions. A lot happens here.
 */
validationApp.controller('ValidationCtrl', function ($scope, $window) {
  console.log("Alignment JSON:");
  console.log($window.alignmentJson);
  
  // USE TEST VALUES (to comment or erase to use values send by sameAsValidator) to be able to use the html
  //$window.alignmentJson = require('scripts/alignment.json');
  
  // Get the 2 ont in an object
  if ($window.alignmentJson.srcOntologyURI === undefined) {
    $window.alignmentJson.srcOntologyURI = "Source entities";
  }
  if ($window.alignmentJson.tarOntologyURI === undefined) {
    $window.alignmentJson.tarOntologyURI = "Target entities";
  }
  
  // Get ontologies URI (and name if saved)
  var srcOntoUri = $window.alignmentJson.srcOntologyURI;
  var tarOntoUri = $window.alignmentJson.tarOntologyURI;
  if (!srcOntoUri) {
    srcOntoUri = "Source Entities"
  }
  if (!tarOntoUri) {
    tarOntoUri = "Target Entities"
  }
  
  // Get source/target Name if provided
  $scope.sourceName = $window.sourceName.replace(new RegExp("\/|:", 'g'), "_");
  $scope.targetName = $window.targetName.replace(new RegExp("\/|:", 'g'), "_");
  if ($scope.sourceName === "null") {
    $scope.sourceName = srcOntoUri.replace(new RegExp("\/|:", 'g'), "_");
  }
  if ($scope.targetName === "null") {
    $scope.targetName = tarOntoUri.replace(new RegExp("\/|:", 'g'), "_");
  }

  // To handle the 2 range slider for Score filtering
  $scope.rangeSlider = {"minValue": 0, "maxValue": 1};
  $(function () {
    $("#slider-range").slider({
      range: true,
      min: 0,
      max: 1,
      step: 0.01,
      values: [0, 1],
      slide: function (event, ui) {
        $scope.rangeSlider.minValue = ui.values[ 0 ];
        $scope.rangeSlider.maxValue = ui.values[ 1 ];
        $scope.$apply();
      }
    });
  });

  $scope.ontologies = {"ont1": $window.sourceOnt, "ont2": $window.targetOnt, "srcOntUri": srcOntoUri, "tarOntUri": tarOntoUri};
  // USE TEST VALUES (to comment or erase to use values send by sameAsValidator)
  //$scope.ontologies = require('scripts/ontologies.json');
  console.log("Ontologies JSON:");
  console.log($scope.ontologies);
  console.log(JSON.stringify($scope.ontologies));
  // Convert ontologies entity object to an array for filter
  $scope.srcOntArray = $.map($scope.ontologies.ont1.entities, function (value, index) {
    return [value];
  });
  $scope.tarOntArray = $.map($scope.ontologies.ont2.entities, function (value, index) {
    return [value];
  });

  // Merge namespaces from the 2 ont:
  $scope.namespaces = $.extend($window.sourceOnt.namespaces, $window.targetOnt.namespaces);
  $scope.detailsLocked = false;
  $scope.tarDetailsLocked = false;
  $scope.srcDetailsLocked = false;

  // init the ng-model used by the relation select dropdown
  $scope.selectRelationModel = {};
  $scope.hideValidatedAlignments = false;
  
  // Get an object with the entities of the alignment as key and their properties
  // (extracted from the ontologies) as object
  $scope.alignments = getAlignmentsWithOntologiesData($window.alignmentJson.entities, $scope.ontologies);
  alignments = $scope.alignments;
  $scope.langSelect = {"en": "en", "fr": "fr"};

  // Little function to get the first element of an object (used to get first label if selectedLang not available
  $scope.getEntityLabel = function (entity, selectedLang) {
    if (entity.label !== undefined) {
      if (entity.label[selectedLang]) {
        return entity.label[selectedLang];
      } else if (entity.label[Object.keys(entity.label)[0]]) {
        return entity.label[Object.keys(entity.label)[0]];
      }
    }
    return entity.id;
  };

  /**
   * Hide all validated alignments when click on hideValidatedAlignments button
   * @param {type} $event
   * @returns {undefined}
   */
  $scope.hideAlignments = function ($event) {
    $scope.hideValidatedAlignments = !$scope.hideValidatedAlignments;
    // Change button color
    if ($scope.hideValidatedAlignments === true) {
      angular.element($event.currentTarget).css('background', '#d531b9');
    } else {
      angular.element($event.currentTarget).css('background', 'linear-gradient(to bottom, #5bc0de 0%, #2aabd2 100%)');
    }
  };

  $scope.addMapping = function ($event) {
    // add it to $scope.alignments
    var newMapping = {index: $scope.alignments.length, relation: $scope.addRelation, measure: 1,
      entity1: $scope.selectedSrcEntity, entity2: $scope.selectedTarEntity};
    $scope.alignments.push(newMapping);
  };

  /**
   * Generate the ng if condition to manage which rows will be display
   * @param {type} alignment
   * @returns {Boolean}
   */
  $scope.generateTableNgIf = function (alignment) {
    if (alignment.measure >= $scope.rangeSlider.minValue
            && alignment.measure <= $scope.rangeSlider.maxValue) {
      if ($scope.hideValidatedAlignments === true && alignment.relation == "notvalid") {
        return false;
      }
      ;
      return true;
    }
    return false;
  };
  /**
   * Used to change relation select color when notvalid selected. Generate the style string for the relation select dropdown to change background color
   * @param {type} alignment
   * @returns {String}
   */
  $scope.generateStyleForSelect = function (alignment) {
    var styleString = null;
    if (alignment.relation === "notvalid") {
      // Red
      styleString = "background-color: #d9534f;";
      // Orange "color: #fff; background-color: #f0ad4e;"
      // Green "color: #fff; background-color: #5cb85c;"
    } else {
      styleString = "background-color: #fff;";
    }
    return styleString;
  };
  /**
   * Generate the id of an HTML element by concatenating a "relationSelect" with the id
   * @param {int} id
   * @returns {undefined}
   */
  $scope.generateRelationSelectId = function (id) {
    return "relationSelect" + id;
  };
  /**
   * Put the new value in the relation select dropdown ng-model and change the value in the alignment object
   * @param {type} $event
   * @param {type} alignment
   * @returns {undefined}
   */
  $scope.updateSelectRelationModels = function ($event, alignment) {
    $scope.selectRelationModel[alignment.index] = angular.element($event.currentTarget).val();
    alignment.relation = angular.element($event.currentTarget).val();
  };
  /**
   * Change details div to show selected entity details
   * @param {boolean} clickedOn
   * @returns {undefined}
   */
  $scope.changeDetails = function (clickedOn) {
    //console.log(this.alignment);
    if ($scope.detailsLocked === false || clickedOn === true) {
      var stringDetail1 = buildEntityDetailsHtml(this.alignment.entity1, "Source", $scope.selectedLang, $scope.ontologies.ont1);
      var stringDetail2 = buildEntityDetailsHtml(this.alignment.entity2, "Target", $scope.selectedLang, $scope.ontologies.ont2);
      document.getElementById("entityDetail1").innerHTML = stringDetail1;
      document.getElementById("entityDetail2").innerHTML = stringDetail2;
      if (clickedOn === true) {
        $scope.detailsLocked = true;
        if ($scope.lastSelected) {
          var selected = this.selected;
          $scope.lastSelected.selected = "";
        }

        // Remove selected if click again on selected row
        if (selected === "selected") {
          this.selected = "";
          $scope.detailsLocked = false;
        } else {
          this.selected = "selected";
        }
        $scope.lastSelected = this;
      }
      // HERE add change for network
      buildNetwork("source", this.alignment.entity1, $scope.selectedLang, $scope.ontologies);
      buildNetwork("target", this.alignment.entity2, $scope.selectedLang, $scope.ontologies);
    }
  };

  /**
   * Change details div to show selected entity details for the extended UI (add new mappings)
   * @param {boolean} clickedOn
   * @returns {undefined}
   */
  $scope.changeDetailsExtended = function (ontologyName, selectedEntity, clickedOn) {
    // Set selected lang to en by default (see $scope.selectedLang to change it dynamically)
    var selectedLang = "en";
    if (ontologyName == 'Source') {
      if ($scope.srcDetailsLocked === false || clickedOn === true) {

        var elementId = "entityDetail1";
        var ontology = $scope.ontologies.ont1;

        // Handle if we need to lock the change of concept details if click
        if (clickedOn === true) {
          $scope.srcDetailsLocked = true;
          if ($scope.srcLastSelected) {
            var selected = this.selected;
            $scope.srcLastSelected.selected = "";
          }

          // Remove selected if click again on selected row
          if (selected === "selected") {
            this.selected = "";
            $scope.srcDetailsLocked = false;
          } else {
            $scope.selectedSrcEntity = selectedEntity;
            this.selected = "selected";
          }
          $scope.srcLastSelected = this;
        }

        var stringDetail = buildEntityDetailsHtml(this.entity, ontologyName, selectedLang, ontology);
        document.getElementById(elementId).innerHTML = stringDetail;

        buildNetwork("source", this.entity, selectedLang, $scope.ontologies);
      }
    } else if (ontologyName == 'Target') {
      if ($scope.tarDetailsLocked === false || clickedOn === true) {
        var elementId = "entityDetail2";
        var ontology = $scope.ontologies.ont2;

        // Handle if we need to lock the change of concept details if click
        if (clickedOn === true) {
          $scope.tarDetailsLocked = true;
          if ($scope.tarLastSelected) {
            var selected = this.selected;
            $scope.tarLastSelected.selected = "";
          }

          // Remove selected if click again on selected row
          if (selected === "selected") {
            this.selected = "";
            $scope.tarDetailsLocked = false;
          } else {
            $scope.selectedTarEntity = selectedEntity;
            this.selected = "selected";
          }
          $scope.tarLastSelected = this;
        }

        var stringDetail = buildEntityDetailsHtml(this.entity, ontologyName, selectedLang, ontology);
        document.getElementById(elementId).innerHTML = stringDetail;

        buildNetwork("target", this.entity, selectedLang, $scope.ontologies);
      }
    }
  };
});

/**
 * a function to get the ontology that is linked to an alignment
 * Example of the alignments object:
 * {"entity1": {"attr1": "http://attr1.fr"}, "entity2": {"attr1": "http://attr1.fr"}, 
 * "measure": 0.84, "relation": "skos:exactMatch", "index": 1}
 * @param {type} alignment
 * @param {type} ontologies
 * @returns {Array|getAlignmentsWithOntologiesData.alignments}
 */
function getAlignmentsWithOntologiesData(alignment, ontologies) {
  var alignments = [];
  for (var key in alignment) {
    var alignToAdd = {"entity1": {}, "entity2": {}};
    if (alignment[key]['entity1'] in ontologies["ont1"]["entities"]) {
      alignToAdd["entity1"] = ontologies["ont1"]['entities'][alignment[key]['entity1']];
    } else {
      alignToAdd["entity1"] = {"id": alignment[key]['entity1'].toString()};
    }

    if (alignment[key]['entity2'] in ontologies["ont2"]["entities"]) {
      alignToAdd["entity2"] = ontologies["ont2"]['entities'][alignment[key]['entity2']];
    } else {
      alignToAdd["entity2"] = {"id": alignment[key]['entity2'].toString()};
    }
    alignToAdd["measure"] = alignment[key]['measure'];
    if (alignment[key]['relation'] == "=") {
      // If relation is "=" (default from Yam matcher) we set it to skos:exactMatch
      alignToAdd["relation"] = "http://www.w3.org/2004/02/skos/core#exactMatch";
    } else {
      alignToAdd["relation"] = alignment[key]['relation'];
    }
    alignToAdd["index"] = key;
    // All entities are "waiting" for the moment, but we need to extract it from the uploaded alignment

    alignments.push(alignToAdd);
  }
  return alignments;
}

/**
 * 
 * @param {type} entity
 * @param {type} selectedLang
 * @returns {entity@arr;label|id|String}
 */
function getEntityLabelLang(entity, selectedLang) {
  // Get the label (using "!=" instead of "!==" allows to avoid null AND undefined)
  if (entity["label"] != null) {
    // Select label according to user selection
    if (entity["label"].hasOwnProperty(selectedLang)) {
      var label = entity["label"][selectedLang] + " (" + selectedLang + ")";
    } else {
      var labelLang = Object.keys(entity["label"])[0];
      // Take first label in object if selected lang not available (using == to not take account of types)
      //console.log(labelLang);
      if (labelLang == null || labelLang == "" || labelLang.toString().toLowerCase() === "n/a") {
        var label = entity["label"][labelLang];
      } else {
        // Add language between parenthesis if not undefined
        var label = entity["label"][labelLang] + " (" + labelLang + ")";
      }
    }
  } else {
    var label = entity["id"];
  }
  return label;
}

/**
 * Build the HTML to display entity details (list ul li). 
 * It takes the following objetc as entity:
 * {"http://entity1.org/": {"id": "http://entity1.org/", "label": {"fr":
 * "bonjour", "en": "hello"}, "http://rdfs.org/label": [{"type": "literal",
 * "value": "bonjour", "lang": "fr"}, {"type": "literal", "value": "hello",
 * "lang": "en"}]}}
 * @param {type} entity
 * @param {type} entityName
 * @param {type} selectedLang
 * @returns {undefined}
 */
function buildEntityDetailsHtml(entity, entityName, selectedLang, ontologies) {
  // Order the JSON string to have id and label at the beginning
  var orderedEntities = {};
  var id = entity["id"].link(entity["id"]);
  //orderedEntities["id"] = entity["id"].link(entity["id"]);

  var label = getEntityLabelLang(entity, selectedLang);

  // add each property object linked to each subject
  // Iterate over the different properties (predicates) of an entity
  Object.keys(entity).sort().forEach(function (key) {
    if (key !== "id" && key !== "label") {
      orderedEntities[key] = null;
      // Iterate over the different values of the object of a predicate (the same property can point to different objects)
      for (var valuesObject in entity[key]) {
        if (typeof entity[key][valuesObject]["value"] !== "undefined") {
          // to get the value of the object depending if it's an URI or a literal
          if (entity[key][valuesObject]["value"].startsWith("http://") || entity[key][valuesObject]["value"].startsWith("https://")) {
            // Concatenate URI too ? With <a href>

            // Get label of the URI object if in ontologies to display label that link to the URI
            //Object.keys(ontologies['entities'][entity[key][valuesObject]["value"]]["label"])[0].link();
            if (orderedEntities[key] === null) {
              // Here 0 because we take the first language available in labels
              if (ontologies['entities'][entity[key][valuesObject]["value"]] != null) {
                orderedEntities[key] = getEntityLabelLang(ontologies['entities'][entity[key][valuesObject]["value"]]).link(entity[key][valuesObject]["value"]);
              } else {
                orderedEntities[key] = entity[key][valuesObject]["value"].link(entity[key][valuesObject]["value"]);
              }
            } else {
              if (ontologies['entities'][entity[key][valuesObject]["value"]] != null && Object.keys(ontologies['entities'][entity[key][valuesObject]["value"]]["label"])[0] != null) {
                orderedEntities[key] = orderedEntities[key] + "<br/> " + getEntityLabelLang(ontologies['entities'][entity[key][valuesObject]["value"]]).link(entity[key][valuesObject]["value"]);
              } else {
                orderedEntities[key] = orderedEntities[key] + "<br/> " + entity[key][valuesObject]["value"].link(entity[key][valuesObject]["value"]);
              }
            }
            break;
          } else {
            // If it is a literal then we concatenate them
            if (orderedEntities[key] === null) {
              orderedEntities[key] = entity[key][valuesObject]["value"];
            } else {
              orderedEntities[key] = orderedEntities[key] + "<br/> " + entity[key][valuesObject]["value"];
            }
          }
        }
      }
    }
  });
  // Build String to be put in the details div
  var htmlString = "<h1 style='text-align: center; color: #5cb85c'>" + entityName + " entity details</h1><h1 style='padding-top: 10px;'>" + label + "</h1><h2>" + id + "</h2><dl>";
  for (var attr in orderedEntities) {
    var prefixedPredicate = attr;
    if (entity[attr][0]["prefixedPredicate"] !== null) {
      // Display full URI when mouseover
      //<dt><abbr title="http://www.w3.org/1999/02/22-rdf-syntax-ns#type">rdf:type</abbr></dt>
      prefixedPredicate = '<abbr title="' + attr + '">' + entity[attr][0]["prefixedPredicate"] + "</abbr>";
    }
    htmlString = htmlString + "<dt>" + prefixedPredicate + "</dt><dd>" + orderedEntities[attr] + "</dd>";
  }
  return htmlString + "</dl>";
}

/**
 * Display the property recursily, giving a depth
 * @param {type} depth
 * @param {type} entity
 * @param {type} ontology
 * @returns {undefined}
 */
function getPropertyRecursive(depth, entity, ontology, nodeIds, networkData) {

}

/**
 * Build the network of properties around an entity
 * @param {type} ontology
 * @param {type} entity
 * @returns {undefined}
 */
function buildNetwork(ontology, entity, selectedLang, ontologies) {
  // create an array with nodes
  var label = getEntityLabelLang(entity, selectedLang);
  var nodes = new vis.DataSet([
    {id: 1, label: label, color: '#FB7E81'}
  ]);
  // create an array with edges
  var edges = new vis.DataSet();
  var propertyCount = 2; // init at 2 since the entity is 1

  var orderedEntities = {};
  // Iterate over the different properties (predicates) of an entity
  // To get properties values grouped by property
  Object.keys(entity).sort().forEach(function (key) {
    if (key !== "id" && key !== "label") {
      orderedEntities[key] = null;
      // Iterate over the different values of the object of a predicate (the same property can point to different objects)
      for (var valuesObject in entity[key]) {
        if (typeof entity[key][valuesObject]["value"] !== "undefined") {
          // If it is a literal then we concatenate them
          if (orderedEntities[key] === null) {
            orderedEntities[key] = entity[key][valuesObject]["value"];
          } else {
            // Limit the size of the object
            if (orderedEntities[key].length < 70) {
              orderedEntities[key] = orderedEntities[key] + " \n" + entity[key][valuesObject]["value"];
            }
          }
        }
      }
    }
  });
  var nodeIds = {};
  // Add each property and its value to the network
  for (var attr in orderedEntities) {
    // Don't create a new node if node exist already, just add a new edge
    if (nodeIds[orderedEntities[attr]] != null) {
      edges.add([
        {from: 1, to: nodeIds[orderedEntities[attr]], label: attr, font: {align: 'horizontal'}}
      ]);
      var getLinkedProperties = false;
    } else {
      nodes.add([
        {id: propertyCount, label: orderedEntities[attr]}
      ]);
      var getLinkedProperties = true;
      nodeIds[orderedEntities[attr]] = propertyCount;
      if (entity[attr][0]["prefixedPredicate"] !== null) {
        edges.add([
          {from: 1, to: propertyCount, label: entity[attr][0]["prefixedPredicate"], font: {align: 'horizontal'}}
        ]);
      } else {
        edges.add([
          {from: 1, to: propertyCount, label: attr, font: {align: 'horizontal'}}
        ]);
      }
      var entityCount = propertyCount;
      propertyCount++;
    }

    // If property is an URI we check if it has properties in our ontology
    if (orderedEntities[attr] != null && orderedEntities[attr].startsWith("http")) {
      if (ontology === "target") {
        var ontoNumber = "ont2";
      } else if (ontology === "source") {
        var ontoNumber = "ont1";
      }
      //console.log(ontologies);

      // Get the entity linked to the mapped concept from the ontology:
      var linkedEntity = ontologies[ontoNumber]['entities'][orderedEntities[attr]];
      var linkedEntityProperties = {};
      // Iterate over the different properties (predicates) of an entity
      // To get properties values grouped by property
      if (linkedEntity != null && getLinkedProperties === true) {
        Object.keys(linkedEntity).sort().forEach(function (key) {
          if (key !== "id" && key !== "label") {
            linkedEntityProperties[key] = null;
            // Iterate over the different values of the object of a predicate (the same property can point to different objects)
            for (var valuesObject in linkedEntity[key]) {
              if (typeof linkedEntity[key][valuesObject]["value"] !== "undefined") {
                // If it is a literal then we concatenate them
                if (linkedEntityProperties[key] === null) {
                  linkedEntityProperties[key] = linkedEntity[key][valuesObject]["value"];
                } else {
                  // Limit the size of the object
                  if (linkedEntityProperties[key].length < 70) {
                    linkedEntityProperties[key] = linkedEntityProperties[key] + " \n" + linkedEntity[key][valuesObject]["value"];
                  }
                }
              }
            }
          }
        });
        // Add each property and its value to the network 
        for (var linkedAttr in linkedEntityProperties) {

          // Don't create a new node if node exist already, just add a new edge
          if (nodeIds[linkedEntityProperties[linkedAttr]] != null) {
            var nodeNumber = nodeIds[linkedEntityProperties[linkedAttr]];
          } else {
            var nodeNumber = propertyCount;
            nodes.add([
              {id: nodeNumber, label: linkedEntityProperties[linkedAttr]}
            ]);
            nodeIds[linkedEntityProperties[linkedAttr]] = propertyCount;
            propertyCount++;
          }

          // Create edge with prefixed predicate when possible
          if (entity[linkedAttr] != null && entity[linkedAttr][0]["prefixedPredicate"] !== null) {
            edges.add([
              {from: entityCount, to: nodeNumber, label: entity[linkedAttr][0]["prefixedPredicate"], font: {align: 'horizontal'}}
            ]);
          } else {
            edges.add([
              {from: entityCount, to: nodeNumber, label: linkedAttr, font: {align: 'horizontal'}}
            ]);
          }
        }
      }
    }
  }
  // create a network
  var container = document.getElementById(ontology + 'Network');
  // provide the data in the vis format
  var data = {
    nodes: nodes,
    edges: edges
  };
  // Get height of div
  var networkHeight = document.getElementById(ontology + "Section").clientHeight.toString();
  var options = {
    autoResize: true,
    height: networkHeight,
    physics: {
      enabled: true,
      /*barnesHut: {
       avoidOverlap: 0.5
       },*/
      /* Separate the nodes enough to make it readable */
      hierarchicalRepulsion: {
        centralGravity: 0.0,
        springLength: 400,
        springConstant: 0.01,
        damping: 0.09,
        nodeDistance: 50
      },
      solver: 'hierarchicalRepulsion'
    }
  };

  // initialize your network!
  //console.log(data);
  var network = new vis.Network(container, data, options);
  network.fit();
}

/**
 * To switch the UI between normal validation and extended validation (to add new mappings manually)
 */
function toggleExtended()
{
  var validationDiv = document.getElementById("validationForm");
  var extendedDiv = document.getElementById("extendedValidationDiv");
  var fixAddMapping = document.getElementById("fixAddMapping");
  if (extendedDiv.style.display == 'block') {
    // If add new mapping UI already on we change to align validation
    extendedDiv.style.display = 'none';
    validationDiv.style.display = 'block';
    fixAddMapping.style.display = 'none';
    document.getElementById("extendedBtn").innerText = "Add new mappings to the alignment";
  } else {
    extendedDiv.style.display = 'block';
    validationDiv.style.display = 'none';
    fixAddMapping.style.display = 'flex';
    document.getElementById("extendedBtn").innerText = "Validate existing mappings";
  }
}

/* Remember on how to make a little window that show when mouseover with angularjs
 * Uncomment popover in style.css if you want to use it
 .directive('toggle', function () {
 return {
 restrict: 'A',
 link: function (scope, element, attrs) {
 if (attrs.toggle == "tooltip") {
 $(element).tooltip();
 }
 if (attrs.toggle == "popover") {
 // Allows the popover to stay when mouseovered
 // And allows us to setup the popover
 
 var entity = JSON.parse(attrs.entity);
 // Not working properly: it doesn't change with selectedLang
 var popoverString = buildEntityDetailsHtml(entity);
 
 $(element).popover({
 html: true,
 trigger: 'manual',
 container: $(this).attr('id'),
 content: popoverString
 }).on("mouseenter", function () {
 var _this = this;
 $(this).popover("show");
 $(this).siblings(".popover").on("mouseleave", function () {
 $(_this).popover('hide');
 });
 }).on("mouseleave", function () {
 var _this = this;
 setTimeout(function () {
 if (!$(".popover:hover").length) {
 $(_this).popover("hide")}}, 100); }); }}}; });
 */