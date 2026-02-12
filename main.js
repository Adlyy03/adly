import anime from 'animejs/lib/anime.es.js';

    const nama = document.querySelector('.nama');
    const screenWidth = window.innerWidth; // lebar layar

    function animateNama() {
      anime({
        targets: nama,
        translateX: screenWidth + 200, // bergerak ke kanan sampai keluar layar
        duration: 4000, // 4 detik
        easing: 'linear',
        loop: true,
        direction: 'normal',
        update: function(anim) {
          // reset posisi setelah animasi selesai
          if (anim.completed) {
            nama.style.transform = 'translateX(-200px)';
          }
        }
      });
    }
