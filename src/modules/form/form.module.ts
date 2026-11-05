import type { Router } from 'express';
import { createFormController } from './form.controller';
import { createFormRouter } from './form.routes';
import { type FormService, type FormServiceDeps, createFormService } from './form.service';

interface FormModule {
  service: FormService;
  router: Router;
}

function createFormModule(deps: FormServiceDeps): FormModule {
  const service = createFormService(deps);
  return { service, router: createFormRouter(createFormController(service)) };
}

export { type FormModule, createFormModule };
