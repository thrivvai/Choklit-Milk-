import { OpenClawExecuteRequest, OpenClawExecuteResponse } from '../../shared-types/src/index.js';

export interface OpenClawClient {
  executeAction(request: OpenClawExecuteRequest): Promise<OpenClawExecuteResponse>;
}

export class MockOpenClawClient implements OpenClawClient {
  public calls: OpenClawExecuteRequest[] = [];

  async executeAction(request: OpenClawExecuteRequest): Promise<OpenClawExecuteResponse> {
    this.calls.push(request);
    return {
      requestId: request.action.id,
      status: 'completed',
      output: `Executed ${request.action.actionType} for ${request.userId}`
    };
  }
}
