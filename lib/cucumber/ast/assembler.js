var Assembler = function (features, filter) {
  var currentFeature, currentScenarioOrBackground, currentStep, suggestedFeature;
  var stashedTags = [];

  var self = {
    setCurrentFeature: function setCurrentFeature(feature) {
      currentFeature = feature;
      self.setCurrentScenarioOrBackground(undefined);
    },

    getCurrentFeature: function getCurrentFeature() {
      return currentFeature;
    },

    setCurrentScenarioOrBackground: function setCurrentScenarioOrBackground(scenarioOrBackground) {
      currentScenarioOrBackground = scenarioOrBackground;
      self.setCurrentStep(undefined);
    },

    getCurrentScenarioOrBackground: function getCurrentScenarioOrBackground() {
      return currentScenarioOrBackground;
    },

    setCurrentStep: function setCurrentStep(step) {
      currentStep = step;
    },

    getCurrentStep: function getCurrentStep() {
      return currentStep;
    },

    stashTag: function stashTag(tag) {
      stashedTags.push(tag);
    },

    revealTags: function revealTags() {
      var revealedTags = stashedTags;
      stashedTags      = [];
      return revealedTags;
    },

    applyCurrentFeatureTagsToElement: function applyCurrentFeatureTagsToElement(element) {
      var currentFeature = self.getCurrentFeature();
      var featureTags    = currentFeature.getTags();
      element.addInheritedtags(featureTags);
    },

    applyStashedTagsToElement: function applyStashedTagsToElement(element) {
      var revealedTags = self.revealTags();
      element.addTags(revealedTags);
    },

    insertBackground: function insertBackground(background) {
      self.setCurrentScenarioOrBackground(background);
      var currentFeature = self.getCurrentFeature();
      currentFeature.addBackground(background);
    },

    insertDataTableRow: function insertDataTableRow(dataTableRow) {
      var currentStep = self.getCurrentStep();
      currentStep.attachDataTableRow(dataTableRow);
    },

    insertDocString: function insertDocString(docString) {
      var currentStep = self.getCurrentStep();
      currentStep.attachDocString(docString);
    },

    insertFeature: function insertFeature(feature) {
      self.tryEnrollingSuggestedFeature();
      self.applyStashedTagsToElement(feature);
      self.setCurrentFeature(feature);
      self.suggestFeature(feature);
    },

    insertScenario: function insertScenario(scenario) {
      self.applyCurrentFeatureTagsToElement(scenario);
      self.applyStashedTagsToElement(scenario);
      self.setCurrentScenarioOrBackground(scenario);
      if (filter.isElementEnrolled(scenario)) {
        var currentFeature = self.getCurrentFeature();
        currentFeature.addFeatureElement(scenario);
      }
    },

    insertExamples: function insertExamples(examples) {
      var currentScenarioOrBackground = self.getCurrentScenarioOrBackground();
      if (currentScenarioOrBackground.payloadType == 'scenarioOutline')
        currentScenarioOrBackground.setExamples(examples);
      else
        throw new Error("Examples are allowed inside scenario outlines only");
      self.setCurrentStep(examples);
    },

    insertStep: function insertStep(step) {
      self.setCurrentStep(step);
      var currentScenarioOrBackground = self.getCurrentScenarioOrBackground();
      currentScenarioOrBackground.addStep(step);
    },

    insertTag: function insertTag(tag) {
      self.stashTag(tag);
    },

    convertScenarioOutlineToScenarios: function convertScenarioOutlineToScenarios(scenario){
        var subScenarios = scenario.buildScenarios();
        subScenarios.syncForEach(self.insertScenario);
    },

    convertScenarioOutlinesToScenarios: function convertScenarioOutlinesToScenarios(){
      var currentFeature = self.getCurrentFeature();
      var scenarios = currentFeature.getFeatureElements();

      scenarios.syncForEach(function(scenario){
          self.convertScenarioOutlineToScenarios(scenario);
      });
    },

    finish: function finish() {
      self.convertScenarioOutlinesToScenarios();
      self.tryEnrollingSuggestedFeature();
    },

    suggestFeature: function suggestFeature(feature) {
      suggestedFeature = feature;
    },

    isSuggestedFeatureEnrollable: function isSuggestedFeatureEnrollable() {
      var enrollable = suggestedFeature && (suggestedFeature.hasFeatureElements() || filter.isElementEnrolled(suggestedFeature));
      return enrollable;
    },

    tryEnrollingSuggestedFeature: function tryEnrollingSuggestedFeature() {
      if (self.isSuggestedFeatureEnrollable())
        self.enrollSuggestedFeature();
    },

    enrollSuggestedFeature: function enrollSuggestedFeature() {
      features.addFeature(suggestedFeature);
      suggestedFeature = null;
    }
  };
  return self;
};

module.exports = Assembler;
