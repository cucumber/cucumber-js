<h1 align="center">
  <img src="./docs/images/logo.png" alt="">
  <br>
  Cucumber - Blinq.io
</h1>
<p align="center">
  <b>Cucumber.js with Blinq.io adaptation</b>
</p>

We took the regular old [Cucumber](https://github.com/cucumber) (A tool for running automated tests) and made improvements 
that could be helpful when working with data that should be saved or when we want to generate fake data for testing 
purposes in our Gherkin feature file.

## Install

@dev-blinq/cucumber-js is [available on npm](https://www.npmjs.com/package/@dev-blinq/cucumber-js):

```shell
$ npm install @dev-blinq/cucumber-js
```

## Get Started

Before, we used to write Gherkin feature files like this -

```gherkin
Feature: Github
    Scenario Outline: Create a new repository
        Given Create a new repository name "<repo>"
        Examples:
            | repo                
            | random_repo_name
```

Now, instead of picking a random name by ourselfs, we could fake data using the following syntax and get a random value -

```gherkin
Feature: Github
    Scenario Outline: Create a new repository
        Given Create a new repository name "<repo>"
        Examples:
            | repo                
            | {{string.alpha(10)}}
```

We could also save our fake data (or any data really) as a variable for future use using the equals (=) sign -

```gherkin
Feature: Github
    Scenario Outline: Create a new repository
        Given Create a new repository name "<repo>" and put the repo's name in the description "<description>"
        Examples:
            |  repo                 | description   |
            | {{repo=string.alpha(10)}} | {{repo}}  |
```

In that example, we saved repo as a variable with value of fake data and used it again as the description
value, both repo and description will have the same fake value.

## Documentation

See documentation for the [Blinq.io](https://docs.blinq.io) app.
