<style type="text/css">body {background: white none;}#impress,#impress > div,.step {-webkit-transition: none!important;-moz-transition: none!important;-ms-transition: none!important;-o-transition: none!important;transition: none!important;}</style>

# BDD
## Brought to you today by Gherkins, Cucumbers and an enormous Guinea pig

------

# What is BDD?

Behaviour Driven Development

An extension of Test Driven Development

Where TDD tends to be extremely technical and the sole preserve of developers, BDD tries to bring together the business requirements (Maybe it's your product owner, or a stakeholder) and the tester/developer.

------

# What is BDD?

The principle is that the behaviour of the system is defined and agreed up front in a Domain Specific Language.

The developer then builds the functionality in the system.

The behaviour specification is then turned into an automated test suite.

(The order of the above may vary slightly)

In order to achieve this, BDD is supported by a set of languages and tools to define the behaviours and to run the tests

------

# BDD tooling

There are a variety of tools available, but today I'm going to cover:

- Gherkin (The language in which the scenarios are defined)
- Cucumber (A tool to map these scenarios to test steps)
- Capybara (A tool for driving a web browser in a test suite)

------

# Setup

## Requirements
Ruby, Bundler and PhantomJS installed on your system

## Setting up

In a new folder, create a `Gemfile` containing the following:

```
source 'https://rubygems.org'

gem 'cucumber'
gem 'capybara'
gem 'capybara-screenshot'
gem 'poltergeist'
```

And type `bundle install` to install these dependencies (See http://bundler.io/)

------

# Setup

Type `cucumber --init`

You should end up with a folder structure like:

```
/features/
  /step_definitions/
  /support/
    env.rb
```

Then `cucumber` and you should see

```
0 scenarios
0 steps
0m0.000s
```

------

# Configure Capybara

Create a new file as follows:

`/features/support/config.rb`
```ruby
require 'capybara/cucumber'
require 'capybara/poltergeist'

include Capybara::DSL

Capybara.default_driver = :poltergeist
Capybara.javascript_driver = :poltergeist

```

------

We're ready to go. Now's a good time to `git commit -m "Initial commit"`

------

# Gherkin scenario

We're going to write a scenario inside a "feature" file like this:

`/features/todos.feature`
```
Feature: Basic todo list manipulation

  Scenario: Entering a single todo item
    Given I am viewing the TodoMVC Vue example
    When I enter a todo
    Then I see my todo in the list
```

------

# Pending step definitions

Once this file has been created, type `cucumber` again. You should see the following:

<small>

```
➜  bdd-talk-example git:(master) cucumber
Feature: Basic todo list manipulation

  Scenario: Entering a single todo item            # features/todos.feature:3
    Given I am viewing the TodoMVC Vue example # features/todos.feature:4
    When I enter a todo                            # features/todos.feature:5
    Then I see my todo in the list                 # features/todos.feature:6

1 scenario (1 undefined)
3 steps (3 undefined)
0m0.004s

You can implement step definitions for undefined steps with these snippets:

Given(/^I am viewing the TodoMVC Vue example$/) do
  pending # Write code here that turns the phrase above into concrete actions
end

When(/^I enter a todo$/) do
  pending # Write code here that turns the phrase above into concrete actions
end

Then(/^I see my todo in the list$/) do
  pending # Write code here that turns the phrase above into concrete actions
end
```

</small>
------

# Step definitions

We paste these stubbed out steps into a new file:

`/features/step_definitions/todos.rb`
```ruby
Given(/^I am viewing the TodoMVC Vue example$/) do
  pending # Write code here that turns the phrase above into concrete actions
end

When(/^I enter a todo$/) do
  pending # Write code here that turns the phrase above into concrete actions
end

Then(/^I see my todo in the list$/) do
  pending # Write code here that turns the phrase above into concrete actions
end
```
------

# Step definitions

Running `cucumber` again now gives us this:

```
Feature: Basic todo list manipulation

  Scenario: Entering a single todo item            # features/todos.feature:3
    Given I am viewing the TodoMVC Vue example # features/step_definitions/todos.rb:1
      TODO (Cucumber::Pending)
      ./features/step_definitions/todos.rb:2:in `/^I am viewing the TodoMVC Vue example$/'
      features/todos.feature:4:in `Given I am viewing the TodoMVC Vue example'
    When I enter a todo                            # features/step_definitions/todos.rb:5
    Then I see my todo in the list                 # features/step_definitions/todos.rb:9

1 scenario (1 pending)
3 steps (2 skipped, 1 pending)
0m0.003s
```

------

# Filling out the step definitions

```
Given(/^I am viewing the TodoMVC Vue example$/) do
  visit('http://todomvc.com/examples/vue/')
end

When(/^I enter a todo$/) do
  input = find('.new-todo')
  input.set('Write Futuresync slides')
  input.native.send_keys(:return)
end

Then(/^I see my todo in the list$/) do
  find('.todo-list .todo label', :text => 'Write Futuresync slides')
end
```

------

Running `cucumber` again, you should see:

```
including Capybara::DSL in the global scope is not recommended!
Feature: Basic todo list manipulation

  Scenario: Entering a single todo item        # features/todos.feature:3
    Given I am viewing the TodoMVC Vue example # features/step_definitions/todos.rb:1
    When I enter a todo                        # features/step_definitions/todos.rb:7
    Then I see my todo in the list             # features/step_definitions/todos.rb:13

1 scenario (1 passed)
3 steps (3 passed)
0m1.850s
```

Green!

------

# Fail!

If you run this again however, you will see the following

```
Feature: Basic todo list manipulation
  Scenario: Entering a single todo item        # features/todos.feature:3
    Given I am viewing the TodoMVC Vue example # features/step_definitions/todos.rb:1
    When I enter a todo                        # features/step_definitions/todos.rb:5
    Then I see my todo in the list             # features/step_definitions/todos.rb:11
      Ambiguous match, found 2 elements matching css ".todo-list .todo label" with text "Write Futuresync slides" (Capybara::Ambiguous)
      ./features/step_definitions/todos.rb:12:in `/^I see my todo in the list$/'
      features/todos.feature:6:in `Then I see my todo in the list'

Failing Scenarios:
cucumber features/todos.feature:3 # Scenario: Entering a single todo item

1 scenario (1 failed)
3 steps (1 failed, 2 passed)
0m3.568s
```
------


# Getting the system into a known state each time

What's happened here is that this particular app has used `window.localStorage` as the "database" for todo items. Each time we run the tests, it remembers what we had in there last time!

To combat this, this particular app needs us to empty out the local storage. We will do this with a "hook"

`/features/support/hooks.rb`
```ruby
Before do |scenario|
  begin
    visit('http://todomvc.com/')
    page.execute_script('localStorage.clear()')
  rescue Capybara::Poltergeist::JavascriptError
  end
end


```

This will run before _every_ scenario. You could also feasibly do this in the `Given` step. This is just an example - the things you might need to do, and _where_ is appropriate to do them will vary depending on your app.

_Yes, I'm silently swallowing JavaScript errors, because TodoMVC is flaky_

------

# Examples of other Capybara commands

- `find` - finds an element based on a CSS selector or XPath
- `fill_in` - fills in an input field
- `click_link` - click a link
- `click_button` - click a button
- `assert_text` - Assert that some text appear on the screen

And many more...

http://www.rubydoc.info/github/jnicklas/capybara

------

# Running as part of your CI pipeline

Developers would the test suite against their local builds before they push work.

The next step would be to get in running in your CI pipeline, whether that be Jenkins, Travis, or whatever. Each time changes are pushed to your integration environment, the tests would then run and report any failures.

------

# Benefits

- Fantastic at ensuring your system is developed to meet the original requirements
- And _continues to meet those requirements_
- The tests are executing in a real browser and behaving like real users

------

# Other forms of testing

It is _not_ a replacement for other forms of testing. If you've already got unit tests, integration tests, whatever - keep writing and running them!

Having said that, if you're not doing any testing at all - it's not a bad place to start.

------

# Pitfalls

Writing scenarios can be quite tricky! It can be hard to write them in a clean and friendly way whilst also making them map nicely to step definitions. They are best written by a developer _and_ someone from elsewhere in the business. Not one or the other.

```
Example of bad scenario here
```

------

# Pitfalls

Testing via a headless browser can sometimes be unstable. For example, if your page moves while Capybara is interacting with it, it might fail to click a button correctly. One case would be animations and transitions.

We can get round this with a little snippet of JavaScript which we pass to the web browser via the tests:

```js
(function() {
  document.addEventListener('DOMContentLoaded', function() {
    var style = document.createElement('style')
    style.textContent = '* { -webkit-transition: none!important;transition:none!important}'
    document.body.appendChild(style)
  });
})()
```
------

# Pitfalls

Tests are quite sensitive to content on the page. If your testing environment contains content from your live system which might be subject to change via a CMS, then you might find it difficult to test effectively without writing brittle tests.

The best way round this is to write a script to load your testing environment up with consistent data. The theory is that the `Given` steps should set the system up into a known state such that your tests are stable.

Sometimes it can be helpful to write a script which runs before the test suite (For example, each time your test environment is rebuilt) and sets the data up up front to keep the tests themselves performant.

------

# Pitfalls

Be careful with XPath!

The default selector for Capybara is CSS, but it used to be XPath and I see many people still using it as the default. However, I often see this:

```/html/body/main/div[2]/div/form/input[2]```

This is incredibly brittle - if someone changes the HTML they could easily break hundreds of tests in one fell swoop.

TL;DR - don't use XPath!

------

# Don't use XPath!

_Unless you really mean it..._

```ruby
summary = find('summary', :text => 'What does Caution mean?')
summary.click

details = summary.find(:xpath, '..')
details.all('.panel p', :minimum => 1)
```

XPath can look _up_ the DOM tree with a `..`

And across it, with `preceding-sibling::*` or `following-sibling::*`

Whereas CSS can only really look _down_ the tree.

It's extremely powerful, but you probably don't need it most of the time.

Use CSS selectors, or if you must use XPath - at least write _sensible_ XPath.

```//*[@id="search_button"]```

------

# Questions?
