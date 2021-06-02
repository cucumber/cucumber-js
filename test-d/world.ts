import { Before, setWorldConstructor, When, World } from '../'

// should allow us to read parameters and add attachments
Before(async function () {
  await this.attach(this.parameters.foo)
})
When('stuff happens', async function () {
  await this.attach(this.parameters.foo)
})

// should allow us to set and get arbitrary properties
Before(async function () {
  this.bar = 'baz'
  await this.log(this.baz)
})
When('stuff happens', async function () {
  this.bar = 'baz'
  await this.log(this.baz)
})

// should allow us to use a custom world class
class CustomWorld extends World {
  doThing(): string {
    return 'foo'
  }
}
setWorldConstructor(CustomWorld)
Before(async function (this: CustomWorld) {
  this.doThing()
})
When('stuff happens', async function (this: CustomWorld) {
  this.doThing()
})
