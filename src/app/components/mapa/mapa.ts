import { Component, OnInit, ViewChild, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { GoogleMapsModule, GoogleMap } from '@angular/google-maps';

interface Marker {
  id: number;
  lat: number;
  lng: number;
  title: string;
  icon: google.maps.Icon;
}

type WeatherState = 'night' | 'cloudy' | 'rainy' | 'sunny';

@Component({
  selector: 'app-mapa',
  standalone: true,
  imports: [CommonModule, GoogleMapsModule],
  providers: [GoogleMap],
  templateUrl: './mapa.html',
  styleUrls: ['./mapa.scss']
})
export class MapaComponent implements OnInit, AfterViewInit {
  @ViewChild(GoogleMap, { static: false }) map!: GoogleMap;

  center: google.maps.LatLngLiteral = { lat: 20.5888, lng: -100.3961 };
  zoomLevel = 10;

  isReporting = false;

  private defaultIcon: google.maps.Icon = {
    url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
  };

  // ✅ Ya NO hay marcadores por defecto
  markers: Marker[] = [];

  currentDate = '';
  currentTemp = '17 °C';
  location = 'Estación - Universidad Tecnológica de Querétaro';

  private currentWeatherState: WeatherState = 'rainy';

  private weatherDescriptions: Record<WeatherState, string> = {
    night: 'Periodo de oscuridad, desde el atardecer hasta el amanecer.',
    cloudy: 'Primeras horas del día, cielo parcialmente cubierto o neblina matutina.',
    rainy: 'En muchas regiones, las lluvias se concentran cerca del mediodía.',
    sunny: 'Horas más despejadas y cálidas antes del atardecer.'
  };

  private backendUrl = 'http://localhost:5001';

  private http = inject(HttpClient);

  constructor(private router: Router) {}

  ngOnInit() {
    this.updateCurrentDate();
  }

  ngAfterViewInit() {
    this.initializeMap();
  }

  private initializeMap() {
    if (this.map && this.map.googleMap) {
      this.map.googleMap.setCenter(this.center);
      this.map.googleMap.setZoom(this.zoomLevel);
    }
  }

  onMapClick(event: google.maps.MapMouseEvent) {
    if (event.latLng) {
      this.addMarker(event.latLng.lat(), event.latLng.lng(), 'Siniestro reportado');
    }
  }

  addMarker(lat: number, lng: number, title: string, customIcon?: google.maps.Icon) {
    const newMarker: Marker = {
      id: Date.now(),
      lat,
      lng,
      title,
      icon: customIcon || this.defaultIcon
    };

    this.markers.push(newMarker);
    console.log('Nuevo marcador:', newMarker);

    setTimeout(() => {
      this.map.googleMap?.setCenter({ lat, lng });
      this.map.googleMap?.setZoom(15);
    }, 50);
  }

  reportFlood() {
    if (this.isReporting) return;
    this.isReporting = true;

    const floodIcon: google.maps.Icon = {
      url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png'
    };

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        this.addMarker(lat, lng, 'Inundación Reportada', floodIcon);
        this.sendReport(`GPS: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
      },
      () => {
        this.addMarker(this.center.lat, this.center.lng, 'Inundación Reportada', floodIcon);
        this.sendReport(this.location);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  private sendReport(userLocation: string) {
    const payload = {
      ubicacion: userLocation,
      fecha: this.currentDate,
      temperatura: this.currentTemp,
      descripcion_clima: this.weatherDescriptions[this.currentWeatherState],
      mensaje: 'Se ha reportado una posible inundación desde el mapa.'
    };

    console.log('Enviando reporte:', payload);

    this.http.post(`${this.backendUrl}/report_flood`, payload).subscribe({
      next: () => {
        alert('✅ Reporte enviado. La compañía ha sido notificada por correo.');
      },
      error: () => {
        alert('❌ No se pudo enviar el correo. Verifica el servidor.');
      },
      complete: () => (this.isReporting = false)
    });
  }

  zoomIn() {
    this.zoomLevel++;
    this.map.googleMap?.setZoom(this.zoomLevel);
  }

  zoomOut() {
    this.zoomLevel--;
    this.map.googleMap?.setZoom(this.zoomLevel);
  }

  goBack() {
    this.router.navigate(['/home']);
  }

  private updateCurrentDate() {
    const now = new Date(2025, 10, 8);
    this.currentDate = now.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }
}
