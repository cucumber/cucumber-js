task :default => [:test]

desc "Run all tests"
task :test => "test:all"

namespace :test do

  desc "Run all tests"
  task :all => [ "test:rb", "test:js" ]

  desc "Run the features through Cucumber (Ruby) and Aruba"
  task :rb do
    sh %{ cucumber -p quiet }
  end

  desc "Run the features through Cucumber.js and the specs through Jasmine-node"
  task :js do
    sh %{ npm test }
  end

end
