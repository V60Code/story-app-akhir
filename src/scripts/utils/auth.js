import Swal from 'sweetalert2';

export function logoutUser() {
  Swal.fire({
    title: 'Keluar?',
    text: 'Anda yakin ingin logout?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Ya, logout',
    cancelButtonText: 'Batal',
  }).then((result) => {
    if (result.isConfirmed) {
      localStorage.removeItem('token');
      Swal.fire('Berhasil logout!', '', 'success').then(() => {
        window.location.hash = '#/login';
      });
    }
  });
}
