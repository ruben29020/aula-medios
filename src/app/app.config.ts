import { ApplicationConfig } from "@angular/core";
import { provideRouter } from "@angular/router";
import { routes } from "./app.routes";
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDt9PoNVqP6on5ne8mGzdOGCJm_W1AF828",          // <-- Mayúscula en la K
  authDomain: "registro-sala-de-computo-n3t.firebaseapp.com",  // <-- Mayúscula en la D
  projectId:  "registro-sala-de-computo-n3t",
  storageBucket: "registro-sala-de-computo-n3t.firebasestorage.app",
  messagingSenderId: "231309324773",
  appId: "1:231309324773:web:b04161698dc64f5e74ff0c",
  measurementId: "G-B9B5NRV0XL"
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideFirestore(() => getFirestore()),
  ]
};