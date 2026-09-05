import { Action, AppAbility } from '../ability.factory';
import { IPolicyHandler } from '../policy.handler';

export class CreateProjectPolicyHandler implements IPolicyHandler {
  handle(ability: AppAbility) {
    return ability.can(Action.Create, 'Project');
  }
}

export class UpdateProjectPolicyHandler implements IPolicyHandler {
  handle(ability: AppAbility) {
    return ability.can(Action.Update, 'Project');
  }
}
