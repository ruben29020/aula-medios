import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FirebaseService } from '../../services/firebase';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login implements OnInit {
  // Variables Login Alumnas
  matricula: string = '';
  mensaje: string = '';
  datosEncontrados: any = null;
  tipoUsuario: string = '';
  cargando: boolean = false;
  mensajeVisita: string = '';

  // Variables Buscador
  textoBusqueda: string = '';
  listaResultados: any[] = [];
  alumnasCache: any[] = [];

  // Variables Apartar Sala
  matriculaApartar: string = '';
  mensajeApartarLogin: string = '';
  datosMaestroApartar: any = null;
  fechaApartar: string = '';
  horaEntradaApartar: string = '';
  horaSalidaApartar: string = '';
  mensajeApartar: string = '';
  cargandoApartar: boolean = false;

  private firebaseService = inject(FirebaseService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  async ngOnInit() {
    this.alumnasCache = await this.firebaseService.getColeccion('alumnas');
  }

  // ==========================================
  // LOGIN ALUMNAS
  // ==========================================
  buscarAlumnaNombre(event: any) {
    const texto = event.target.value.trim().toUpperCase();
    if (texto.length < 2) {
      this.listaResultados = [];
      return;
    }
    this.listaResultados = this.alumnasCache
      .filter(a => a && a.nombre && a.nombre.includes(texto))
      .slice(0, 8);
  }

  seleccionarAlumna(alumna: any) {
    this.datosEncontrados = alumna;
    this.matricula = alumna.id;
    this.tipoUsuario = 'alumna';
    this.listaResultados = [];
    this.textoBusqueda = '';
    this.mensaje = '';
  }

  async consultar() {
    if (!this.matricula) {
      this.mensaje = "Ingresa tu matrícula.";
      return;
    }

    this.cargando = true;
    this.mensaje = "Consultando...";
    const mat = this.matricula.trim().toUpperCase();

    try {
      const maestro = await this.firebaseService.getDocumento('maestros', mat);
      
      if (maestro) {
        this.datosEncontrados = maestro;
        this.tipoUsuario = 'maestro';
        this.mensaje = '';
        
        const autorizados = ["933648834", "997323537", "964448285"];
        if (autorizados.includes(mat)) {
          localStorage.setItem("sesionActual", mat);
          localStorage.setItem("tipoUsuario", "maestro");
          localStorage.setItem("nombreUsuario", maestro.nombre);
          this.router.navigate(['/docente']);
        }
      } else {
        const alumna = await this.firebaseService.getDocumento('alumnas', mat);
        if (alumna) {
          this.datosEncontrados = alumna;
          this.tipoUsuario = 'alumna';
          this.mensaje = '';
        } else {
          this.mensaje = "No encontramos a nadie con esa matrícula.";
        }
      }
    } catch (error) {
      this.mensaje = "Error al consultar.";
    } finally {
      this.cargando = false;
      this.cdr.detectChanges(); // Forzar actualización visual
    }
  }

  continuarAsistencia() {
    localStorage.setItem("sesionActual", this.matricula);
    localStorage.setItem("tipoUsuario", this.tipoUsuario);
    this.router.navigate(['/asistencia']);
  }

  // ==========================================
  // APARTAR SALA (Adaptado de app.js)
  // ==========================================
  
  async consultarMaestroApartar() {
    if (!this.matriculaApartar) {
      this.mensajeApartarLogin = "Ingresa tu matrícula.";
      return;
    }

    this.mensajeApartarLogin = "Consultando...";
    this.datosMaestroApartar = null;
    const mat = this.matriculaApartar.trim().toUpperCase();

    try {
      const maestro = await this.firebaseService.getDocumento('maestros', mat);
      
      if (maestro) {
        this.datosMaestroApartar = maestro;
        this.mensajeApartarLogin = "";
      } else {
        this.mensajeApartarLogin = "No encontramos un maestro con esa matrícula.";
      }
    } catch (error) {
      console.error(error);
      this.mensajeApartarLogin = "Error al consultar.";
    } finally {
      this.cdr.detectChanges(); // Forzar actualización visual
    }
  }

  async apartarSala() {
    if (!this.fechaApartar || !this.horaEntradaApartar || !this.horaSalidaApartar) {
      this.mensajeApartar = "Por favor selecciona fecha y horas.";
      return;
    }

    // Validación de horas exacta de tu app.js
    const [horasEnt, minutosEnt] = this.horaEntradaApartar.split(':').map(Number);
    const [horasSal, minutosSal] = this.horaSalidaApartar.split(':').map(Number);
    const totalMinutosEntrada = (horasEnt * 60) + minutosEnt;
    const totalMinutosSalida = (horasSal * 60) + minutosSal;

    if (totalMinutosSalida <= totalMinutosEntrada) {
      this.mensajeApartar = "La hora de salida debe ser mayor que la hora de entrada.";
      return;
    }

    this.cargandoApartar = true;
    this.mensajeApartar = "";

    const datos = {
      matricula: this.datosMaestroApartar.id,
      nombre: this.datosMaestroApartar.nombre,
      fecha: this.fechaApartar,
      horaEntrada: this.horaEntradaApartar,
      horaSalida: this.horaSalidaApartar
    };

    try {
      await this.firebaseService.apartarSala(datos);
      
      this.mensajeApartar = "✓ Sala apartada correctamente. Cerrando...";
      
      // Limpiar formulario igual que en app.js
      this.matriculaApartar = '';
      this.datosMaestroApartar = null;
      this.fechaApartar = '';
      this.horaEntradaApartar = '';
      this.horaSalidaApartar = '';
      
      setTimeout(() => {
        this.mensajeApartar = "";
      }, 2500);
    } catch (error) {
      console.error(error);
      this.mensajeApartar = "No se pudo apartar la sala.";
    } finally {
      this.cargandoApartar = false;
      this.cdr.detectChanges(); // Forzar actualización visual
    }
  }

  // ==========================================
  // REGISTRAR VISITA MAESTRO (NO AUTORIZADO)
  // ==========================================
  async registrarVisitaMaestro() {
    if (!this.datosEncontrados) return;
    this.mensajeVisita = "Registrando...";
    
    const datos = {
      matricula: this.datosEncontrados.id,
      nombre: this.datosEncontrados.nombre,
      grado: this.datosEncontrados.grado || "",
      grupo: this.datosEncontrados.grupo || "",
      tipoUsuario: 'maestro',
      entrada: new Date(),
      salida: null,
      activa: true
    };

    try {
      await this.firebaseService.registrarVisita(datos);
      this.mensajeVisita = "✓ Visita registrada. Cerrando sesión...";
      setTimeout(() => {
        localStorage.clear();
        this.router.navigate(['/']);
      }, 1500);
    } catch (error) {
      this.mensajeVisita = "Error al registrar visita.";
    } finally {
      this.cdr.detectChanges();
    }
  }
}