guard 'jasmine-node', :jasmine_node_bin => File.expand_path(File.dirname(__FILE__) + "/node_modules/jasmine-node/bin/jasmine-node") do
  watch(%r{^spec/(.+)_spec\.js$})  { |m| "spec/#{m[1]}_spec.js" }
  watch(%r{^lib/(.+)\.js$})        { |m| "spec/#{m[1]}_spec.js" }
  watch(%r{^spec/support/.+\.js$}) { "spec" }
end
