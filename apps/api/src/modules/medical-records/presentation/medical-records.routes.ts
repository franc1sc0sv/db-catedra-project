import { createRouter } from '~/common/ioc/elysia-base'
import { betterAuthPlugin } from '~/auth-plugin'
import { GetMedicalHistoryUseCase } from '../application/usecases/get-medical-history.usecase'
import { t } from 'elysia'

export const medicalRecordsRoutes = createRouter({ prefix: '/medical-records' })
  .use(betterAuthPlugin)
  .get(
    '/:recordId/history',
    async ({ container, params }) => {
      const history = await container.get(GetMedicalHistoryUseCase).execute(params.recordId);
      
      return {
        success: true,
        data: history
      };
    },
    {
      roles: ['doctor', 'receptionist'],
      params: t.Object({
        recordId: t.String()
      }),
    }
  )