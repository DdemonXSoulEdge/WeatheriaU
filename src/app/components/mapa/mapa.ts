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
    this.loadMarkers();
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

  loadMarkers() {
    this.http.get(`${this.backendUrl}/flood_history`).subscribe({
      next: (response: any) => {
        const reports = response.intData.data || [];
        const now = new Date();
        const cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const validReports = reports.filter((report: any) => {
          const created = new Date(report.created_at);
          return created > cutoff;
        });

        // Mantener marcadores manuales (rojos)
        const manualMarkers = this.markers.filter(m => m.icon.url.includes('red-dot'));

        // Filtrar reportes con coordenadas válidas antes de mapear
        const validReportsWithCoords = validReports.filter((report: any) => report.lat != null && report.lng != null);

        // Agregar marcadores de inundación (azules)
        const floodMarkers: Marker[] = validReportsWithCoords
          .map((report: any) => ({
            id: report.id,
            lat: report.lat as number,
            lng: report.lng as number,
            title: 'Inundación Reportada',
            icon: { url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png' }
          }));

        this.markers = [...manualMarkers, ...floodMarkers];

        // Configurar timeouts para auto-eliminación de marcadores de inundación después de 24 horas
        validReports.forEach((report: any) => {
          const created = new Date(report.created_at);
          const expireDate = new Date(created.getTime() + 24 * 60 * 60 * 1000);
          const delay = expireDate.getTime() - Date.now();
          if (delay > 0) {
            setTimeout(() => {
              this.markers = this.markers.filter(m => m.id !== report.id);
            }, delay);
          }
        });
      },
      error: (err) => console.error('Error loading markers:', err)
    });
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
        const tempId = -Date.now();
        this.markers.push({
          id: tempId,
          lat,
          lng,
          title: 'Inundación Reportada',
          icon: floodIcon
        });
        setTimeout(() => {
          this.map.googleMap?.setCenter({ lat, lng });
          this.map.googleMap?.setZoom(15);
        }, 50);
        this.sendReport(`GPS: ${lat.toFixed(4)}, ${lng.toFixed(4)}`, tempId);
      },
      () => {
        // Intentar geocodificar la ubicación por defecto
        this.http.post(`${this.backendUrl}/geocode`, { address: this.location }).subscribe({
          next: (resp: any) => {
            if (resp.status === 'success') {
              const { lat, lng } = resp.coordinates;
              const tempId = -Date.now();
              this.markers.push({
                id: tempId,
                lat,
                lng,
                title: 'Inundación Reportada',
                icon: floodIcon
              });
              setTimeout(() => {
                this.map.googleMap?.setCenter({ lat, lng });
                this.map.googleMap?.setZoom(15);
              }, 50);
              this.sendReport(`GPS: ${lat.toFixed(4)}, ${lng.toFixed(4)}`, tempId);
            } else {
              this.addFallbackMarker(floodIcon);
            }
          },
          error: () => {
            this.addFallbackMarker(floodIcon);
          }
        });
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  private addFallbackMarker(floodIcon: google.maps.Icon) {
    const tempId = -Date.now();
    this.markers.push({
      id: tempId,
      lat: this.center.lat,
      lng: this.center.lng,
      title: 'Inundación Reportada',
      icon: floodIcon
    });
    setTimeout(() => {
      this.map.googleMap?.setCenter(this.center);
      this.map.googleMap?.setZoom(15);
    }, 50);
    this.sendReport(this.location, tempId);
  }

  private sendReport(userLocation: string, tempId?: number) {
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
        if (tempId && tempId < 0) {
          if (userLocation.startsWith('GPS:')) {
            // Ubicación precisa: remover temp y recargar desde BD
            this.markers = this.markers.filter(m => m.id !== tempId);
            this.loadMarkers();
          } else {
            // Ubicación aproximada: mantener temp pero expirar en 24h
            setTimeout(() => {
              this.markers = this.markers.filter(m => m.id !== tempId);
            }, 24 * 60 * 60 * 1000);
          }
        }
      },
      error: () => {
        alert('❌ No se pudo enviar el correo. Verifica el servidor.');
        if (tempId && tempId < 0) {
          // No enviado: expirar en 1 hora
          setTimeout(() => {
            this.markers = this.markers.filter(m => m.id !== tempId);
          }, 60 * 60 * 1000);
        }
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
    const now = new Date();  // ✅ Cambiado: usa la fecha/hora actual en lugar de hardcode
    this.currentDate = now.toLocaleDateString('es-ES', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }
}