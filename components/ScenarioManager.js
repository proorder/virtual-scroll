import InitializeScenario from './scenaries/InitializeScenario'

export default class ScenarioManager {
  scenaries = []

  currentScenario = null

  constructor(contextObject) {
    this.scenaries.push(new InitializeScenario(contextObject))
  }

  createEvent(event, payload) {
    if (!this.currentScenario) {
      this.executeScenarioSelection()
    }
    this.currentScenario.processEvent(event, payload)
  }

  executeScenarioSelection() {
    this.currentScenario = this.scenaries
      .sort((a, b) => a.priority - b.priority)
      .find((s) => s.stateMachine())
  }
}
