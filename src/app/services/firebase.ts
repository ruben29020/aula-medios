import { Injectable, inject } from '@angular/core';
import { Firestore, doc, getDoc, collection, getDocs, addDoc, serverTimestamp } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private firestore = inject(Firestore);

  async getDocumento(coleccion: string, id: string): Promise<any> {
    try {
      const docRef = doc(this.firestore, `${coleccion}/${id}`);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (error) {
      console.error("Error en getDocumento:", error);
      return null;
    }
  }

  async getColeccion(coleccion: string): Promise<any[]> {
    try {
      const colRef = collection(this.firestore, coleccion);
      const snapshot = await getDocs(colRef);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Error en getColeccion:", error);
      return [];
    }
  }

  async registrarVisita(datos: any) {
    const colRef = collection(this.firestore, 'visitasSala');
    return addDoc(colRef, {
      ...datos,
      fecha: new Date().toLocaleDateString("es-MX"),
      fechaRegistro: serverTimestamp()
    });
  }

  async apartarSala(datos: any) {
    const colRef = collection(this.firestore, 'apartadosSala');
    return addDoc(colRef, {
      matricula: datos.matricula,
      nombre: datos.nombre,
      fecha: datos.fecha,
      horaEntrada: datos.horaEntrada,
      horaSalida: datos.horaSalida,
      fechaRegistro: serverTimestamp()
    });
  }

  // <--- AQUÍ ESTABA EL ERROR (le agregamos any[] para que TypeScript no proteste)
  async getVisitas(): Promise<any[]> {
    const colRef = collection(this.firestore, 'visitasSala');
    const snapshot = await getDocs(colRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
}