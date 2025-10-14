import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent {
  usuario: string = '';
  contrasena: string = '';

  constructor(private router: Router) {}

  iniciarSesion() {
    console.log('Usuario:', this.usuario);
    console.log('Contraseña:', this.contrasena);
    
    if (this.usuario && this.contrasena) {
      // Navegar al home
      this.router.navigate(['/home']);
    } else {
      alert('Por favor completa todos los campos');
    }
  }
}