import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FirebaseService } from '../../services/firebase';

@Component({
  selector: 'app-asistencia',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './asistencia.html',
  styleUrl: './asistencia.css'
})
export class Asistencia implements OnInit {
  alumna: any = null;
  horaEntrada: string = '';
  horaSalida: string = '';
  mensaje: string = '';

  private firebaseService = inject(FirebaseService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  async ngOnInit() {
    const matricula = localStorage.getItem('sesionActual');
    
    // Si no hay sesión, regresamos al login
    if (!matricula) {
      this.router.navigate(['/']);
      return;
    }

    try {
      // Traemos los datos de la alumna desde Firebase
      const datos = await this.firebaseService.getDocumento('alumnas', matricula);
      
      if (datos) {
        this.alumna = datos;
      } else {
        // Si no existe, cerramos sesión
        localStorage.clear();
        this.router.navigate(['/']);
      }
    } catch (error) {
      console.error("Error cargando alumna:", error);
      localStorage.clear();
      this.router.navigate(['/']);
    } finally {
      // Forzamos a Angular a dibujar la pantalla con los datos
      this.cdr.detectChanges();
    }
  }

  async registrarVisita() {
    if (!this.horaEntrada || !this.horaSalida) {
      this.mensaje = "Ingresa la hora de entrada y salida.";
      return;
    }

    // Validación de horas
    const [horasEnt, minutosEnt] = this.horaEntrada.split(':').map(Number);
    const [horasSal, minutosSal] = this.horaSalida.split(':').map(Number);
    const totalMinutosEntrada = (horasEnt * 60) + minutosEnt;
    const totalMinutosSalida = (horasSal * 60) + minutosSal;

    if (totalMinutosSalida <= totalMinutosEntrada) {
      this.mensaje = "La hora de salida debe ser mayor que la hora de entrada.";
      return;
    }

    const datos = {
      matricula: this.alumna.id,
      nombre: this.alumna.nombre,
      grado: this.alumna.grado,
      grupo: this.alumna.grupo,
      tipoUsuario: 'alumna',
      horaEntrada: this.horaEntrada,
      horaSalida: this.horaSalida
    };

    try {
      await this.firebaseService.registrarVisita(datos);
      this.mensaje = "✓ Visita registrada. Cerrando sesión...";
      
      setTimeout(() => {
        localStorage.clear();
        this.router.navigate(['/']);
      }, 1500);
    } catch (error) {
      console.error(error);
      this.mensaje = "No se pudo registrar la visita.";
    } finally {
      this.cdr.detectChanges();
    }
  }
}