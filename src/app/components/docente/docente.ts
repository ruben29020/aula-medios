import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FirebaseService } from '../../services/firebase';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-docente',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './docente.html',
  styleUrl: './docente.css'
})
export class Docente implements OnInit {
  nombreDocente: string = '';
  visitas: any[] = [];
  mensajeVisita: string = '';
  
  // Variable para controlar la visibilidad de la tabla. 
  // Al estar en false, la tabla no se renderiza en el HTML.
  mostrarTablaVisitas: boolean = false;

  private firebaseService = inject(FirebaseService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  async ngOnInit() {
    const tipo = localStorage.getItem('tipoUsuario');
    if (tipo !== 'maestro') {
      this.router.navigate(['/']);
      return;
    }

    this.nombreDocente = localStorage.getItem('nombreUsuario') || '';

    try {
      const datosCrudos = await this.firebaseService.getVisitas();
      
      // Formateamos los datos antes de mostrarlos
      this.visitas = datosCrudos.map(v => ({
        ...v,
        entrada: this.formatearFecha(v.entrada),
        salida: this.formatearFecha(v.salida),
        fecha: v.fecha || this.formatearFecha(v.fechaRegistro).split(',')[0]
      }));
    } catch (error) {
      console.error("Error cargando visitas:", error);
    } finally {
      this.cdr.detectChanges();
    }
  }

  formatearFecha(valor: any): string {
    if (!valor) return '-';
    
    if (typeof valor.toDate === 'function') {
      return valor.toDate().toLocaleString('es-MX', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    }
    return valor.toString();
  }

  async registrarVisitaMaestro() {
    const matricula = localStorage.getItem('sesionActual');
    const nombre = localStorage.getItem('nombreUsuario');
    
    if (!matricula) {
      this.mensajeVisita = "Error: No hay sesión activa.";
      return;
    }

    this.mensajeVisita = "Registrando...";

    const datos = {
      matricula: matricula,
      nombre: nombre,
      grado: "",
      grupo: "",
      tipoUsuario: 'maestro',
      entrada: new Date(),
      salida: null,
      activa: true
    };

    try {
      await this.firebaseService.registrarVisita(datos);
      this.mensajeVisita = "✓ Visita registrada. Cerrando sesión...";
      
      const datosCrudos = await this.firebaseService.getVisitas();
      this.visitas = datosCrudos.map(v => ({
        ...v,
        entrada: this.formatearFecha(v.entrada),
        salida: this.formatearFecha(v.salida),
        fecha: v.fecha || this.formatearFecha(v.fechaRegistro).split(',')[0]
      }));

      setTimeout(() => {
        this.cerrarSesion();
      }, 1500);

    } catch (error) {
      console.error(error);
      this.mensajeVisita = "No se pudo registrar la visita.";
    } finally {
      this.cdr.detectChanges();
    }
  }

  exportarExcel() {
    if (this.visitas.length === 0) return;
    
    const hoja = XLSX.utils.json_to_sheet(this.visitas);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, "Visitas");
    XLSX.writeFile(libro, `visitas_aula_medios_${new Date().toISOString().slice(0,10)}.xlsx`);
  }

  cerrarSesion() {
    localStorage.clear();
    this.router.navigate(['/']);
  }
}
