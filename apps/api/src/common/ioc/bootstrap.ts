import "reflect-metadata";
import { ApplicationKernel } from "./kernel";
import { UsersModule } from "~/modules/users/users.module";
import { HealthModule } from "~/modules/health/health.module";
// <MODULES_IMPORTS_START>
import { PatientsModule } from "~/modules/patients/patients.module";
import { AppointmentsModule } from "~/modules/appointments/appointments.module";
import { ReceptionistAgendaModule } from "~/modules/receptionist-agenda/receptionist-agenda.module";
import { ReceptionistScheduleModule } from "~/modules/receptionist-schedule/receptionist-schedule.module";
import { DoctorScheduleModule } from '~/modules/doctor-schedule/doctor-schedule.module'
import { DoctorAgendaModule } from '~/modules/doctor-agenda/doctor-agenda.module'
import { MedicalRecordsModule } from "~/modules/medical-records/medical-records.module";
// <MODULES_IMPORTS_END>

const kernel = ApplicationKernel.getInstance([
  new UsersModule(),
  new HealthModule(),
  // <MODULES_REGISTRATION_START>
  new PatientsModule(),
  new ReceptionistScheduleModule(),
  new AppointmentsModule(),
  new ReceptionistAgendaModule(),
  new DoctorScheduleModule(),
  new DoctorAgendaModule(),
  new MedicalRecordsModule(),
  // <MODULES_REGISTRATION_END>
]);

export const container = kernel.getContainer();
