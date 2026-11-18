# Sporun Zekâ Takımı — kurulum ve yayınlama

Bu proje, öğretmen paneli ve öğrenci paneli olan gerçek zamanlı bir sınıf oyunu başlangıç sürümüdür.

## İçerik
- Öğretmen oda oluşturur; benzersiz oda kodu ve QR katılım kodu çıkar.
- Öğrenciler telefonlarından QR'ı tarar veya bağlantıyı açar, adını ve takımını seçer.
- 6 takım, 18 soruluk labirent macerasına katılır.
- Öğretmen oyunu başlatabilir, duraklatabilir, devam ettirebilir, önceki/sonraki soruya geçebilir ve sıfırlayabilir.
- Doğru cevap +10 puan ve takım ilerlemesi verir.
- Öğretmen fiziksel görevi gözlemleyip ayrıca +10 puan onaylayabilir.
- Öğretmen ekranı projeksiyonda, öğrenci ekranları telefonlarda kullanılabilir.

## Önemli kullanım notları
- Bu sürümde süre, soru başına gösterilen hedef süredir; otomatik geri sayım henüz eklenmedi.
- Öğrenci cevabı bireysel olarak alınır; takımın puanı doğru cevap başına artar.
- Fiziksel görevler öğretmen gözetiminde, güvenli ve uygun alan varsa yapılmalıdır.
- Oda verileri sunucu belleğinde tutulur; sunucu yeniden başlarsa oda sıfırlanır.
- QR kod kütüphanesi ve yazı tipi CDN üzerinden yüklenir; ilk açılışta internet gerekir.

## Bilgisayarda çalıştırma
Node.js 18 veya üstü kurulu olmalı.
1. Bu klasörde terminal aç.
2. `npm install`
3. `npm start`
4. Tarayıcıda `http://localhost:3000` aç.

Aynı Wi-Fi'daki telefonlardan test etmek için bilgisayarın yerel IP adresini kullanın (ör. `http://192.168.1.20:3000`). Telefonlar ve bilgisayar aynı ağa bağlı olmalı.

## İnternete yayınlama (Render)
1. ZIP'i aç ve içindeki dosyaları GitHub'a yeni bir repository olarak yükle.
2. Render hesabında **New + → Web Service** seç ve GitHub repository'ni bağla.
3. Build Command: `npm install`
4. Start Command: `npm start`
5. Deploy tamamlanınca Render sana `https://...onrender.com` biçiminde bir adres verir.
6. Bu adresi öğretmen olarak aç; oda oluştur. Ekrandaki QR kodu sınıfa yansıt veya katılım bağlantısını paylaş.

Render'da ücretsiz hizmetlerde ilk açılış gecikebilir. Ücretsiz katman ve uyku/çalışma koşulları değişebilir.

## Sınıfta önerilen akış
1. Öğretmen bilgisayardan siteyi açar ve Öğretmen Paneli'ne basar.
2. QR kodu projeksiyona yansıtır.
3. Öğrenciler telefonlarından QR'ı tarayıp ad ve takım seçerek katılır.
4. Öğretmen Başlat'a basar; gerektiğinde Duraklat ile oyunu durdurur.
5. Öğrenciler cevap verir. Fiziksel görevleri öğretmen sırayla yaptırır ve ilgili takıma onay verir.
6. Son sorudan sonra takım puanları karşılaştırılır.

## Geliştirme notu
Bu, ilk çalışan sürümdür; gerçek sınıf uygulamasından önce farklı telefon ve tarayıcılarda test edilmesi önerilir.
