var ScenarioOutline = function (keyword, name, description, line) {
  var Cucumber = require('../../cucumber'),
    self = Cucumber.Ast.Scenario(keyword, name, description, line),
    examples;
  self.payload_type = 'scenarioOutline';
  self.setExamples = function (newExamples) {
    examples = newExamples;
  };
  self.getExamples = function () {
    return examples;
  };
  self.applyExampleRow = function (example, steps) {
    return steps.syncMap(function (outline) {
      var name = outline.getName(),
        table = Cucumber.Ast.DataTable(),
        hasDocString = outline.hasDocString(),
        hasDataTable = outline.hasDataTable(),
        oldDocString = hasDocString ? outline.getDocString() : null,
        docString = hasDocString ? oldDocString.getContents() : null,
        hashKey;
      for (hashKey in example) {
        if (Object.prototype.hasOwnProperty.call(example, hashKey)) {
          name = name.replace('<' + hashKey + '>', example[hashKey]);
          if (hasDataTable){
            outline.getDataTable().raw().forEach(function(row){
              table.attachRow(
                Cucumber.Ast.DataTable.Row(row.map(function(cell){
                  return  cell.replace('<' + hashKey + '>', example[hashKey]);
              })));
            });
          }
          if (hasDocString){
            docString = docString.replace('<' + hashKey + '>', example[hashKey]);
          }
        }
      }
      var step = Cucumber.Ast.Step(outline.getKeyword(), name, outline.getLine());
      if (hasDataTable){
        step.attachDataTable(table);
      }
      if (hasDocString){
        step.attachDocString(oldDocString.getContentType(), docString, oldDocString.getLine());
      }
      return step;
    });
  };
  self.instructVisitorToVisitScenarioSteps = function instructVisitorToVisitScenarioSteps(visitor, callback) {
    var hashes = Cucumber.Type.Collection(),
        steps = self.getSteps()
      examples.getDataTable().hashes().forEach(function(hash) {
          hashes.add(hash);
      });

    hashes.forEach(function (row, iterate) {
      var newSteps = self.applyExampleRow(row, steps);
      self.instructVisitorToVisitSteps(visitor, newSteps, iterate);
    },callback);
  };
  return self;
};
module.exports = ScenarioOutline;

