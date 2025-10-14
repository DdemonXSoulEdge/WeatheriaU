import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface HourlyWeather {
  time: string;
  icon: string;
  temp: string;
}

type WeatherState = 'cloudy' | 'sunny' | 'night' | 'rainy';

interface WeatherStateOption {
  value: WeatherState;
  label: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})
export class HomeComponent {
  // Control para cambiar el estado climático en desarrollo
  currentWeatherState: WeatherState = 'cloudy';
  showMenu = false;
  
  weatherStates: WeatherStateOption[] = [
    { value: 'cloudy', label: 'Nublado' },
    { value: 'sunny', label: 'Soleado' },
    { value: 'night', label: 'Noche' },
    { value: 'rainy', label: 'Lluvioso' }
  ];

  currentDate = 'Martes 30 de Septiembre de 2025';
  currentTemp = '17 °C';
  location = 'Estación - Universidad Tecnológica de Querétaro';

  // Descripciones según el clima
  weatherDescriptions: Record<WeatherState, string> = {
    cloudy: 'Nublado, lleva paraguas por precaución',
    sunny: 'Soleado, sin riesgos de lluvia',
    night: 'Noche despejada, sin riesgo de lluvia',
    rainy: 'Lloviendo, toma precauciones al salir'
  };

  // Iconos según el clima
  mainWeatherIcons: Record<WeatherState, string> = {
    cloudy: '☁️',
    sunny: '☀️',
    night: '🌙',
    rainy: '🌧️'
  };

  hourlyForecast: HourlyWeather[] = [
    { time: '12:00 pm', icon: '🌤️', temp: '23°C' },
    { time: '02:00 pm', icon: '🌧️', temp: '23°C' },
    { time: '04:00 pm', icon: '⛈️', temp: '20°C' },
    { time: '07:00 pm', icon: '☁️', temp: '18°C' },
    { time: '10:00 pm', icon: '🌙', temp: '15°C' }
  ];

  constructor(private router: Router) {}

  toggleMenu() {
    this.showMenu = !this.showMenu;
  }
  goToDashboard() {
  this.router.navigate(['/dashboard']);
  this.showMenu = false;
}

goToHistorial() {
  this.router.navigate(['/historial']);
  this.showMenu = false;
}
goToMapa() {
  this.router.navigate(['/mapa']);
  this.showMenu = false;
}
  changeWeatherState(state: WeatherState) {
    this.currentWeatherState = state;
    this.showMenu = false;
  }

  reportFlood() {
    alert('Funcionalidad: Reportar inundación y marcar ubicación');
    // Aquí irá la navegación a la pantalla de reporte
  }

  get currentDescription(): string {
    return this.weatherDescriptions[this.currentWeatherState];
  }

  get mainIcon(): string {
    return this.mainWeatherIcons[this.currentWeatherState];
  }
}