import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Docente } from './components/docente/docente'; // Asegúrate que en docente.ts la clase se llame Docente
import { Asistencia } from './components/asistencia/asistencia'; // Asegúrate que en asistencia.ts la clase se llame Asistencia

export const routes: Routes = [
    { path: '', component: Login },
    { path: 'docente', component: Docente },
    { path: 'asistencia', component: Asistencia },
    { path: '**', redirectTo: '' }
];