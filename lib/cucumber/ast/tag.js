define([], function() {
var Tag = function(name, line) {

  var self = {
    getName: function getName() {
      return name;
    }
  };
  return self;
};
return Tag;
});