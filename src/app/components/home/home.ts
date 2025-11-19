import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';  // Agrega HttpClient para llamadas al backend
import { Router } from '@angular/router';

interface HourlyWeather {
  time: string;
  icon: string;
  temp: string;
}

type WeatherState = 'night' | 'cloudy' | 'rainy' | 'sunny';

interface WeatherStateOption {
  value: WeatherState;
  label: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, HttpClientModule],  // Agrega HttpClientModule para standalone
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})
export class HomeComponent implements OnInit {
  showMenu = false;
  
  // Fecha dinámica (se actualiza en ngOnInit)
  currentDate = '';
  currentTemp = '17 °C';
  location = 'Estación - Universidad Tecnológica de Querétaro';

  currentWeatherState: WeatherState = 'night'; 

  // Descripciones según el clima
  weatherDescriptions: Record<WeatherState, string> = {
    night: 'Periodo de oscuridad, desde el atardecer hasta el amanecer.',
    cloudy: 'Primeras horas del día, cielo parcialmente cubierto o neblina matutina.',
    rainy: 'En muchas regiones, las lluvias se concentran cerca del mediodía.',
    sunny: 'Horas más despejadas y cálidas antes del atardecer.'
  };

  // Iconos según el clima
  mainWeatherIcons: Record<WeatherState, string> = {
    night: '🌙',
    cloudy: '🌥️',
    rainy: '🌧️',
    sunny: '☀️'
  };

  hourlyForecast: HourlyWeather[] = [
    { time: '12:00 pm', icon: '🌤️', temp: '23°C' },
    { time: '02:00 pm', icon: '🌧️', temp: '23°C' },
    { time: '04:00 pm', icon: '⛈️', temp: '20°C' },
    { time: '07:00 pm', icon: '☁️', temp: '18°C' },
    { time: '10:00 pm', icon: '🌙', temp: '15°C' }
  ];

  // URL del backend (ajusta si es necesario, ej: para producción cambia a tu dominio)
  private backendUrl = 'http://localhost:5001';  // Puerto de tu Flask app

  isReporting = false;

  constructor(private router: Router, private http: HttpClient) {}  // Inyecta HttpClient

  ngOnInit() {
    this.currentWeatherState = this.getCurrentWeatherState();
    this.updateCurrentDate();  // Actualiza la fecha dinámicamente
    // Ya no necesitas EmailJS, se maneja en el backend
  }

  // Método para actualizar la fecha actual (en español)
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

  private getCurrentWeatherState(): WeatherState {
    const now = new Date();
    const hour = now.getHours();
    
    if (hour >= 18 || hour < 6) {
      return 'night';
    } else if (hour >= 6 && hour < 10) {
      return 'cloudy';
    } else if (hour >= 10 && hour < 14) {
      return 'rainy';
    } else {
      return 'sunny';
    }
  }

  toggleMenu() {
    this.showMenu = !this.showMenu;
  }
  
  goToMapa() {
    this.router.navigate(['/mapa']);
    this.showMenu = false;
  }
  
  goToLogin() {
    this.router.navigate(['/login']);
    this.showMenu = false;
  }

  reportFlood() {
    if (this.isReporting) return;
    this.isReporting = true;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        this.sendReport(`GPS: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
      },
      () => {
        // Fallback a ubicación hardcodeada
        this.sendReport(this.location);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  private sendReport(userLocation: string) {
    // Prepara los parámetros para el backend
    const payload = {
      ubicacion: userLocation,
      fecha: this.currentDate,
      temperatura: this.currentTemp,
      descripcion_clima: this.weatherDescriptions[this.currentWeatherState],
      mensaje: 'Se ha reportado una posible inundación en la zona. Verificar inmediatamente.'  // Personalízalo
    };

    // Debug: Log del payload
    console.log('Payload enviado:', payload);

    // Envía POST al endpoint del backend
    this.http.post(`${this.backendUrl}/report_flood`, payload).subscribe({
      next: (response: any) => {
        console.log('Respuesta del backend:', response);
        alert('¡Reporte enviado exitosamente! Tu compañía ha sido notificada por email.');
        // Navega al mapa para ver el marcador
        this.router.navigate(['/mapa']);
      },
      error: (error: any) => {
        console.error('Error al enviar el reporte:', error);
        const errorMsg = error.error?.intData?.message || 'Error desconocido';
        alert(`Error al enviar el reporte: ${errorMsg}. Verifica que el backend esté corriendo.`);
      },
      complete: () => (this.isReporting = false)
    });
  }

  get currentDescription(): string {
    return this.weatherDescriptions[this.currentWeatherState];
  }

  get mainIcon(): string {
    return this.mainWeatherIcons[this.currentWeatherState];
  }
}