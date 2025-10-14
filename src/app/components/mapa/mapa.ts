import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface Marker {
  id: number;
  lat: number;
  lng: number;
  title: string;
}

@Component({
  selector: 'app-mapa',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mapa.html',
  styleUrls: ['./mapa.scss']
})
export class MapaComponent {
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

  constructor(private router: Router) {}

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
    alert('Funcionalidad: Reportar inundación y marcar ubicación');
    // Aquí irá la navegación a la pantalla de reporte
  }

  onMarkerClick(marker: Marker) {
    console.log('Marcador clickeado:', marker);
    alert(`Siniestro en: ${marker.title}`);
  }
}