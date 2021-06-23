import InitializeScenario from './scenaries/InitializeScenario'
import BackScrollScenario from './scenaries/BackScrollScenario'

export default class ScenarioManager {
  scenaries = []

  inProgressScenarios = {}

  constructor(contextObject) {
    this.scenaries.push(new InitializeScenario(contextObject))
    this.scenaries.push(new BackScrollScenario(contextObject))
  }

  createEvent(event, payload) {
    if (!Object.keys(this.inProgressScenarios).length) {
      this.executeScenarioSelection(event)
    }
    Object.entries(this.inProgressScenarios).forEach(([k, s]) =>
      s.processEvent(event, payload)
    )
  }

  executeScenarioSelection(event) {
    const currentScenario = this.scenaries
      .sort((a, b) => a.priority - b.priority)
      .find((s) => !!s.stateMachine(event))
    if (!currentScenario) {
      return
    }
    currentScenario.manager = this
    this.inProgressScenarios[currentScenario.constructor.name] = currentScenario
  }

  finishProcess(classInstance) {
    delete this.inProgressScenarios[classInstance.constructor.name]
  }
}
