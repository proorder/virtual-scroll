import Scenario from '../Scenario'

export default class BackScrollScenario extends Scenario {
  priority = Scenario.PRIORITIES.HIGH

  stateMachine(event) {
    return event === Scenario.EVENTS.SCROLL
  }

  process() {
    this.getLastScrollPosition()
  }
}
