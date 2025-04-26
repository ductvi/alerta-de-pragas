// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBZ_Wyii2n79cPkpalEp6_Lx_OX6B4l09w",
    authDomain: "plague-alert.firebaseapp.com",
    projectId: "plague-alert",
    storageBucket: "plague-alert.appspot.com",
    messagingSenderId: "847679471985",
    appId: "1:847679471985:web:c4903bea1637ed248cf6d0"
  };
  
  // Inicialização do Firebase
  const app = firebase.initializeApp(firebaseConfig);
  const db = firebase.firestore();
  
  // Inicialização do Mapa
  const map = L.map('map').setView([-23.5505, -46.6333], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
  }).addTo(map);
  
  // Ícones personalizados
  const plagueIcons = {
    mosquito: L.divIcon({ html: `<div style="background-color: black; width: 24px; height: 24px; border-radius: 50%; display: flex; justify-content: center; align-items: center; color: white;">🦟</div>`, className: 'custom-icon', iconSize: [24, 24], iconAnchor: [12, 12] }),
    rato: L.divIcon({ html: `<div style="background-color: yellow; width: 24px; height: 24px; border-radius: 50%; display: flex; justify-content: center; align-items: center; color: black;">🐀</div>`, className: 'custom-icon', iconSize: [24, 24], iconAnchor: [12, 12] }),
    escorpiao: L.divIcon({ html: `<div style="background-color: red; width: 24px; height: 24px; border-radius: 50%; display: flex; justify-content: center; align-items: center; color: white;">🦂</div>`, className: 'custom-icon', iconSize: [24, 24], iconAnchor: [12, 12] }),
    barata: L.divIcon({ html: `<div style="background-color: orange; width: 24px; height: 24px; border-radius: 50%; display: flex; justify-content: center; align-items: center; color: white;">🪳</div>`, className: 'custom-icon', iconSize: [24, 24], iconAnchor: [12, 12] }),
    formiga: L.divIcon({ html: `<div style="background-color: purple; width: 24px; height: 24px; border-radius: 50%; display: flex; justify-content: center; align-items: center; color: white;">🐜</div>`, className: 'custom-icon', iconSize: [24, 24], iconAnchor: [12, 12] }),
    cupim: L.divIcon({ html: `<div style="background-color: green; width: 24px; height: 24px; border-radius: 50%; display: flex; justify-content: center; align-items: center; color: white;">🪲</div>`, className: 'custom-icon', iconSize: [24, 24], iconAnchor: [12, 12] }),
    pombo: L.divIcon({ html: `<div style="background-color: blue; width: 24px; height: 24px; border-radius: 50%; display: flex; justify-content: center; align-items: center; color: white;">🦜</div>`, className: 'custom-icon', iconSize: [24, 24], iconAnchor: [12, 12] })
  };
  
  let tempMarkers = [];
  let loadedMarkers = [];
  let currentPlagueType = 'mosquito';
  let lastAddressData = null;
  
  document.getElementById('plagueType').addEventListener('change', (e) => {
    currentPlagueType = e.target.value;
  });
  
  // Buscar endereço
  document.getElementById("buscarEndereco").addEventListener("click", async () => {
    const endereco = document.getElementById("endereco").value.trim();
    
    if (!endereco) {
      alert("Digite um endereço válido!");
      return;
    }
  
    try {
      document.getElementById("regiaoSelecionada").textContent = "Buscando...";
      document.getElementById("resultadoEndereco").style.display = "block";
  
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(endereco)}&countrycodes=br&limit=1`);
      const data = await response.json();
      
      if (data.length === 0) throw new Error("Endereço não encontrado. Tente novamente!");
  
      const { lat, lon, display_name } = data[0];
      const enderecoFormatado = display_name.split(",").slice(0, 3).join(", ");
      
      document.getElementById("regiaoSelecionada").textContent = enderecoFormatado;
      
      lastAddressData = { endereco: enderecoFormatado, lat: parseFloat(lat), lng: parseFloat(lon) };
      map.setView([lat, lon], 15);
  
    } catch (error) {
      console.error("Erro ao buscar endereço:", error);
      alert(error.message);
      document.getElementById("resultadoEndereco").style.display = "none";
    }
  });
  
  // Adicionar pin clicando no mapa
  map.on('click', (e) => {
    if (!lastAddressData) {
      alert("Busque um endereço válido antes de marcar no mapa!");
      return;
    }
  
    const { lat, lng } = e.latlng;
    const plagueName = document.getElementById('plagueType').selectedOptions[0].text;
    
    const marker = L.marker([lat, lng], {
      icon: plagueIcons[currentPlagueType],
      draggable: true
    }).addTo(map)
      .bindPopup(`
        <div class="popup-header">Nova Denúncia</div>
        <div class="popup-row"><span class="popup-label">Local:</span> <span>${lastAddressData.endereco}</span></div>
        <div class="popup-row"><span class="popup-label">Tipo:</span> <span>${plagueName}</span></div>
        <div class="popup-row"><span class="popup-label">Coordenadas:</span> <span>${lat.toFixed(5)}, ${lng.toFixed(5)}</span></div>
      `);
    
    tempMarkers.push({ lat, lng, marker, type: currentPlagueType, typeName: plagueName, endereco: lastAddressData.endereco });
  });
  
  // Salvar denúncias
  document.getElementById('saveBtn').addEventListener('click', async () => {
    if (!lastAddressData || tempMarkers.length === 0) {
      alert("Busque um endereço válido e adicione denúncias no mapa!");
      return;
    }
  
    try {
      const batch = db.batch();
      const markersRef = db.collection("markers");
      
      tempMarkers.forEach((pin) => {
        const docRef = markersRef.doc();
        batch.set(docRef, {
          lat: pin.lat,
          lng: pin.lng,
          type: pin.type,
          typeName: pin.typeName,
          endereco: pin.endereco,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          status: "pendente"
        });
      });
  
      await batch.commit();
      alert(`${tempMarkers.length} denúncia(s) salva(s) com sucesso!`);
      
      tempMarkers.forEach(pin => map.removeLayer(pin.marker));
      tempMarkers = [];
      
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert(`Erro ao salvar: ${error.message}`);
    }
  });
  
  // Carregar denúncias
  document.getElementById('loadBtn').addEventListener('click', async () => {
    try {
      loadedMarkers.forEach(marker => map.removeLayer(marker));
      loadedMarkers = [];
      
      const querySnapshot = await db.collection("markers").orderBy("createdAt", "desc").get();
  
      if (querySnapshot.empty) {
        alert("Nenhuma denúncia encontrada!");
        return;
      }
  
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const marker = L.marker([data.lat, data.lng], {
          icon: plagueIcons[data.type] || plagueIcons.mosquito
        }).addTo(map)
          .bindPopup(`
            <div class="popup-header">Denúncia</div>
            <div class="popup-row"><span class="popup-label">Local:</span> <span>${data.endereco}</span></div>
            <div class="popup-row"><span class="popup-label">Tipo:</span> <span>${data.typeName}</span></div>
            <div class="popup-row"><span class="popup-label">Coordenadas:</span> <span>${data.lat.toFixed(5)}, ${data.lng.toFixed(5)}</span></div>
          `);
  
        loadedMarkers.push(marker);
      });
  
    } catch (error) {
      console.error("Erro ao carregar denúncias:", error);
      alert(`Erro ao carregar: ${error.message}`);
    }
  });
  
  // Limpar mapa
  document.getElementById('clearBtn').addEventListener('click', () => {
    loadedMarkers.forEach(marker => map.removeLayer(marker));
    tempMarkers.forEach(pin => map.removeLayer(pin.marker));
    loadedMarkers = [];
    tempMarkers = [];
  });
  