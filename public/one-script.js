$(document).ready(function () {
    $('form').submit(function (event) {
      event.preventDefault();
  
      // Menampilkan elemen loading saat pengguna mengklik "Check Links"
      $('#loading').show();
  
      const url = $('#url').val();
  
      $.post('/check-links', { url }, function (data) {
        // Menyembunyikan elemen loading setelah proses selesai
        $('#loading').hide();
  
        $('#result-url').text(data.url);
        $('#result-link-count').text(data.linkCount);
        $('#result-broken-count').text(data.brokenCount);
        $('#result-green-count').text(data.greenCount);
  
        // Hapus atribut 'disabled' dari tombol "Download Result" untuk mengaktifkannya
        $('#download-csv').removeAttr('disabled');
      });
    });
  
    // Menangani klik tombol unduh
    $('#download-csv').click(function () {
      const url = $('#url').val();
      $.post('/check-links', { url }, function (data) {
        const checkedLinks = data.linkStatuses; // Ambil daftar tautan dari respons server
  
        // Buat data CSV
        let csvContent = "URL,Status\n";
        checkedLinks.forEach(function (link) {
          csvContent += `"${link.link}","${link.status}"\n`;
        });
  
        // Buat objek Blob untuk file CSV
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  
        // Buat nama file dinamis dengan tanggal dan waktu
        const now = new Date();
        const formattedDate = now.toLocaleDateString().replace(/\//g, '-');
        const formattedTime = now.toLocaleTimeString().replace(/:/g, '-');
        const fileName = `checked_links_${formattedDate}_${formattedTime}.csv`;
  
        // Buat tautan unduhan
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
  
        // Klik tautan unduhan secara otomatis
        link.click();
      });
    });
  });
  