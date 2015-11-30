function Assembler(features, filter) {
  var currentFeature, currentFeatureElement, currentStep, suggestedFeature;
  var stashedTags = [];

  var self = {
    setCurrentFeature: function setCurrentFeature(feature) {
      currentFeature = feature;
      self.setCurrentFeatureElement(undefined);
    },

    getCurrentFeature: function getCurrentFeature() {
      return currentFeature;
    },

    setCurrentFeatureElement: function setCurrentFeatureElement(featureElement) {
      currentFeatureElement = featureElement;
      self.setCurrentStep(undefined);
    },

    getCurrentFeatureElement: function getCurrentFeatureElement() {
      return currentFeatureElement;
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
      element.addInheritedTags(featureTags);
    },

    applyStashedTagsToElement: function applyStashedTagsToElement(element) {
      var revealedTags = self.revealTags();
      element.addTags(revealedTags);
    },

    applyStashedTagsToExamples: function applyStashedTagsToExamples(examples) {
      var revealedTags = self.revealTags();
      examples.setTags(revealedTags);
    },

    insertBackground: function insertBackground(background) {
      self.setCurrentFeatureElement(background);
      var currentFeature = self.getCurrentFeature();
      currentFeature.setBackground(background);
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
      self.setCurrentFeatureElement(scenario);
      var currentFeature = self.getCurrentFeature();
      currentFeature.addFeatureElement(scenario);
    },

    insertExamples: function insertExamples(examples) {
      var currentFeatureElement = self.getCurrentFeatureElement();
      if (!currentFeatureElement.isScenarioOutline())
        throw new Error('Examples are allowed inside scenario outlines only');
      self.applyStashedTagsToExamples(examples);
      currentFeatureElement.addExamples(examples);
      self.setCurrentStep(examples);
    },

    insertStep: function insertStep(step) {
      self.setCurrentStep(step);
      var currentFeatureElement = self.getCurrentFeatureElement();
      currentFeatureElement.addStep(step);
    },

    insertTag: function insertTag(tag) {
      self.stashTag(tag);
    },

    finish: function finish() {
      var currentFeature = self.getCurrentFeature();
      if (currentFeature) {
        currentFeature.convertScenarioOutlinesToScenarios();
        currentFeature.filterScenarios(filter.isElementEnrolled);
      }
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
}

module.exports = Assembler;
