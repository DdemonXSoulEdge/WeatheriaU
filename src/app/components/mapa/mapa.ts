import { Component, OnInit } from '@angular/core';  // Agrega OnInit para ngOnInit
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';  // Para llamadas al backend
import { Router } from '@angular/router';

interface Marker {
  id: number;
  lat: number;
  lng: number;
  title: string;
}

type WeatherState = 'night' | 'cloudy' | 'rainy' | 'sunny';  // Agrega tipo para clima simulado

@Component({
  selector: 'app-mapa',
  standalone: true,
  imports: [CommonModule, HttpClientModule],  // Agrega HttpClientModule
  templateUrl: './mapa.html',
  styleUrls: ['./mapa.scss']
})
export class MapaComponent implements OnInit {  // Implementa OnInit
  zoomLevel = 1;
  maxZoom = 3;
  minZoom = 0.5;

  // Marcadores de siniestros (ejemplo de coordenadas)
  markers: Marker[] = [
    { id: 1, lat: 35, lng: 15, title: 'Siniestro 1' },
    { id: 2, lat: 45, lng: 55, title: 'Siniestro 2' },
    { id: 3, lat: 25, lng: 25, title: 'Siniestro 3' },
    { id: 4, lat: 65, lng: 60, title: 'Siniestro 4' },
    { id: 5, lat: 75, lng: 35, title: 'Siniestro 5' },
    { id: 6, lat: 85, lng: 35, title: 'Siniestro 6' }
  ];

  // Fecha dinámica (se actualiza en ngOnInit)
  currentDate = '';
  currentTemp = '17 °C';  // Fijo para demo
  location = 'Estación - Universidad Tecnológica de Querétaro';  // Fallback

  // Clima simulado (fijo para demo; puedes randomizar o linkear con Home)
  private currentWeatherState: WeatherState = 'rainy';  // Ej: lluvioso para mapa de siniestros

  // Descripciones según el clima (copiado de Home para consistencia)
  private weatherDescriptions: Record<WeatherState, string> = {
    night: 'Periodo de oscuridad, desde el atardecer hasta el amanecer.',
    cloudy: 'Primeras horas del día, cielo parcialmente cubierto o neblina matutina.',
    rainy: 'En muchas regiones, las lluvias se concentran cerca del mediodía.',
    sunny: 'Horas más despejadas y cálidas antes del atardecer.'
  };

  // URL del backend (igual que en Home)
  private backendUrl = 'http://localhost:5001';  // Cambia si usas otro puerto

  constructor(private router: Router, private http: HttpClient) {}  // Inyecta HttpClient

  ngOnInit() {
    this.updateCurrentDate();  // Actualiza fecha al cargar el componente
  }

  // Método para actualizar la fecha actual (en español, igual que Home)
  private updateCurrentDate(): void {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    this.currentDate = now.toLocaleDateString('es-ES', options);  // Ej: "lunes, 3 de noviembre de 2025"
  }

  goBack() {
    this.router.navigate(['/home']);
  }

  zoomIn() {
    if (this.zoomLevel < this.maxZoom) {
      this.zoomLevel += 0.2;
    }
  }

  zoomOut() {
    if (this.zoomLevel > this.minZoom) {
      this.zoomLevel -= 0.2;
    }
  }

  reportFlood() {
    console.log('Iniciando reporte desde mapa... URL backend:', this.backendUrl);  // Log para debug

    // Obtén la ubicación actual (geolocalización síncrona con callback)
    let userLocation = this.location;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          userLocation = `${this.location} - GPS: ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`;
          console.log('GPS obtenido en mapa:', userLocation);  // Log para debug
          this.sendReport(userLocation);  // Envía después de obtener GPS
        },
        (geoError) => {
          console.warn('Geolocalización falló en mapa, usando ubicación por defecto:', geoError);
          this.sendReport(userLocation);  // Envía con fallback
        },
        {
          enableHighAccuracy: true,
          timeout: 5001,
          maximumAge: 0
        }
      );
    } else {
      console.warn('Geolocalización no soportada en mapa');
      this.sendReport(userLocation);
    }
  }

  // Método privado para enviar el reporte (igual que en Home)
  private sendReport(userLocation: string) {
    // Prepara los parámetros para el backend (mismo formato que Home)
    const payload = {
      ubicacion: userLocation,
      fecha: this.currentDate,
      temperatura: this.currentTemp,
      descripcion_clima: this.weatherDescriptions[this.currentWeatherState],
      mensaje: 'Se ha reportado una posible inundación en el mapa de siniestros. Verificar inmediatamente.'
    };

    console.log('Payload enviado desde mapa:', payload);  // Log para debug

    // Envía POST al endpoint del backend
    this.http.post(`${this.backendUrl}/report_flood`, payload).subscribe({
      next: (response: any) => {
        console.log('Respuesta exitosa del backend en mapa:', response);
        alert('¡Reporte enviado exitosamente desde el mapa! Tu compañía ha sido notificada por email.');
        // Opcional: Agrega un marcador nuevo o navega
      },
      error: (error: any) => {
        console.error('Error detallado en mapa:', error);  // Log completo
        const errorMsg = error.error?.intData?.message || error.message || 'Error de conexión (verifica backend)';
        alert(`Error al enviar el reporte desde el mapa: ${errorMsg}`);
      }
    });
  }

  onMarkerClick(marker: Marker) {
    console.log('Marcador clickeado:', marker);
    alert(`Siniestro en: ${marker.title}`);
    // Opcional: Aquí podrías reportar basado en este marcador (e.g., userLocation = `${marker.lat}, ${marker.lng}`)
  }

  // Getter para descripción (igual que Home)
  get currentDescription(): string {
    return this.weatherDescriptions[this.currentWeatherState];
  }
}