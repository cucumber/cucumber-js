var ScenarioOutline = function (keyword, name, description, uri, line) {
  var Cucumber = require('../../cucumber');
  var self = Cucumber.Ast.Scenario(keyword, name, description, uri, line);
  var examples;

  self.payload_type = 'scenarioOutline';
  
  self.setExamples = function (newExamples) {
    examples = newExamples;
  };
  
  self.getExamples = function () {
    return examples;
  };
  
  self.applyExampleRow = function(example, steps){
    return steps.syncMap(function (outline) {
      var name = outline.getName(),
        table = Cucumber.Ast.DataTable(),
        rows = [],
        hasDocString = outline.hasDocString(),
        hasDataTable = outline.hasDataTable(),
        oldDocString = hasDocString ? outline.getDocString() : null,
        docString = hasDocString ? oldDocString.getContents() : null,
        hashKey;

     if (hasDataTable){
       outline.getDataTable().getRows().syncForEach(function(row){
         var newRow = { 
             line: row.getLine(), 
             cells: JSON.stringify(row.raw()) 
           };
         rows.push(newRow);
       });
     }

     for (hashKey in example) {
       if (Object.prototype.hasOwnProperty.call(example, hashKey)) {        
         var findText = '<' + hashKey + '>';
         var exampleData = example[hashKey];    
           
         name = name.replace(findText, exampleData);         
           
         if (hasDataTable) {
           rows = rows.map(function(row){
             return {line:row.line, cells:row.cells.replace(findText, exampleData)};
           });
         }
           
         if (hasDocString) {
           docString = docString.replace(findText, exampleData);
         }
       }
     }


      var step = Cucumber.Ast.Step(outline.getKeyword(),name, outline.getLine());

     if (hasDataTable) {
       rows.forEach(function(row){
         table.attachRow( Cucumber.Ast.DataTable.Row( JSON.parse(row.cells), row.line) );
       });
       step.attachDataTable(table);
     }

      if (hasDocString) {
        step.attachDocString( Cucumber.Ast.DocString(oldDocString.getContentType(), docString, oldDocString.getLine()));
      }
      return step;
    });
  };
  
  self.acceptVisitor = function (visitor, callback) {
    var rows = examples.getDataTable().getRows(),
      first_row = rows.shift().raw();
    rows.syncForEach(function(row, index){      
      row.example = {};
      row.id = index;
      for (var i = 0, ii = first_row.length; i < ii; i++){
        row.example[first_row[i]] = row.raw()[i];
      }
    });

    rows.forEach(function (row, iterate){
      self.instructVisitorToVisitRowSteps(visitor, row, iterate);
    },callback)
  };

  self.instructVisitorToVisitRowSteps = function (visitor, row, callback) {
    visitor.visitRow(row, self, callback);
  };

  self.visitRowSteps = function (visitor, row, callback) {
    self.instructVisitorToVisitBackgroundSteps(visitor, function () {
      var newSteps = self.applyExampleRow(row.example, self.getSteps());
      self.instructVisitorToVisitSteps(visitor, newSteps, callback);
    });
  };

  return self;
};
module.exports = ScenarioOutline;

