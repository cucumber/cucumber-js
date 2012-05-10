if (typeof define !== 'function') { var define = require('amdefine')(module); }
define([
  "./ast/assembler",
  "./ast/background",
  "./ast/data_table",
  "./ast/doc_string",
  "./ast/feature",
  "./ast/features",
  "./ast/filter",
  "./ast/scenario",
  "./ast/step",
  "./ast/tag"
], function(Assembler, Background, DataTable, DocString, Feature, Features, Filter, Scenario, Step, Tag) {
  var Ast = {
    Assembler:  Assembler,
    Background: Background,
    DataTable:  DataTable,
    DocString:  DocString,
    Feature:    Feature,
    Features:   Features,
    Filter:     Filter,
    Scenario:   Scenario,
    Step:       Step,
    Tag:        Tag
  };

  return Ast;
});