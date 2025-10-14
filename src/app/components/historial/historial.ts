import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface DayRecord {
  id: number;
  date: string;
  fullDate: Date;
}

@Component({
  selector: 'app-historial',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './historial.html',
  styleUrls: ['./historial.scss']
})
export class HistorialComponent {
  currentMonth = 'Septiembre';
  
  dayRecords: DayRecord[] = [
    {
      id: 1,
      date: 'Lunes 21 de septiembre de 2025',
      fullDate: new Date(2025, 8, 21)
    },
    {
      id: 2,
      date: 'Martes 22 de septiembre de 2025',
      fullDate: new Date(2025, 8, 22)
    },
    {
      id: 3,
      date: 'Miercoles 23 de septiembre de 2025',
      fullDate: new Date(2025, 8, 23)
    }
  ];

  constructor(private router: Router) {}

  goBack() {
    this.router.navigate(['/home']);
  }

  viewDayDetail(day: DayRecord) {
    console.log('Ver detalles del día:', day.date);
    alert(`Ver detalles de: ${day.date}`);
  }
}