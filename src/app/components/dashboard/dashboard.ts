import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

interface WeatherCard {
  icon: string;
  title: string;
  mainValue: string;
  details: string[];
  color: string;
}

interface GeneralData {
  label: string;
  value: string | number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class DashboardComponent implements OnInit {
  showMenu = false;
  lastUpdate = 'Última actualización 30/09/2025 06:30 PM';
  usuario: string = '';
  datos: any = null;
  loading = true;  // Para mostrar spinner mientras carga
  error: string | null = null;  // Para manejar errores

  weatherCards: WeatherCard[] = [
    {
      icon: '🌡️',
      title: 'Temperatura 19°C',
      mainValue: '19°C',
      details: [
        'Sensación térmica: 17°C',
        'Punto de rocío: 14°C',
        'Enfriamiento por viento: 18°C'
      ],
      color: '#4A9EFF'
    },
    {
      icon: '💧',
      title: 'Precipitación 2.5 mm/h',
      mainValue: '2.5 mm/h',
      details: [
        'Acumulado hoy: 12.8 mm',
        'Probabilidad: 85%',
        'Tipo: Lluvia moderada'
      ],
      color: '#4CAF50'
    },
    {
      icon: '⬇️',
      title: 'Presión',
      mainValue: '1008.32 hPa',
      details: [],
      color: '#9C27B0'
    },
    {
      icon: '💨',
      title: 'Viento',
      mainValue: '9 km/h',
      details: [
        'Ráfagas: 9 km/h'
      ],
      color: '#FF9800'
    }
  ];

  generalData: GeneralData[] = [
    { label: 'Dewpoint', value: 11 },
    { label: 'HeatIndex', value: 22 },
    { label: 'Humedad', value: '46%' },
    { label: 'Presion', value: '1011.85' },
    { label: 'Precipitacion', value: 0 },
    { label: 'Precipitacion Total', value: 11 },
    { label: 'Temperatura', value: 11 },
    { label: 'Sensacion Termica', value: 11 },
    { label: 'Rafagas', value: 11 },
    { label: 'Velocidad del Viento', value: 11 }
  ];

  constructor(
    private router: Router,
    private http: HttpClient,
    private auth: AuthService
  ) {}

  ngOnInit() {
    // Suscribe al usuario actual
    this.auth.currentUser$.subscribe(user => this.usuario = user || 'No');

    // Verifica autenticación antes de cargar datos
    if (!this.auth.isAuthenticated()) {
      console.warn('No autenticado, redirigiendo a login');
      this.router.navigate(['/login']);
      return;
    }

    // Carga los datos del dashboard
    this.cargarDatos();
  }

  cargarDatos() {
    const apiUrl = 'http://localhost:5001/api/dashboard';  // O usa this.auth.apiUrl si lo expones
    const headers: HttpHeaders = this.auth.getHeaders();  // ¡Aquí se adjunta el token!

    this.http.get(apiUrl, { headers }).subscribe({
      next: (res: any) => {
        console.log('Datos del dashboard cargados:', res);  // Debug
        this.datos = res.intData.data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar datos del dashboard:', err);
        this.loading = false;
        this.error = 'Error al cargar el dashboard. Intenta de nuevo.';

        // Si es 401 (no autorizado), hace logout automático
        if (err.status === 401) {
          console.warn('Token inválido o expirado, logout automático');
          this.auth.logout();
        }
      }
    });
  }

  toggleMenu() {
    this.showMenu = !this.showMenu;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    if (this.showMenu && !target.closest('.menu-overlay') && !target.closest('.menu-button')) {
      this.showMenu = false;
    }
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
    this.showMenu = false;
  }

  goToHistorial() {
    this.router.navigate(['/historial']);
    this.showMenu = false;
  }

  goToHome() {
    this.router.navigate(['/home']);
    this.showMenu = false;
  }

  reportFlood() {
    alert('Funcionalidad: Reportar inundación y marcar ubicación');
  }

  goBack() {
    this.router.navigate(['/home']);
  }

  logout() {
    this.auth.logout();
  }
}