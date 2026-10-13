const defaultPets = [
  {
    id: 1, name:"Luna", type:"perro", age:"8 meses", sex:"Hembra",
    location:"Hermosillo, Sonora", contact:"Tu contacto aquí",
    photo:"https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=900&q=80",
    description:"Luna es cariñosa, juguetona y busca una familia responsable que pueda darle mucho amor."
  },
  {
    id: 2, name:"Milo", type:"gato", age:"1 año", sex:"Macho",
    location:"Hermosillo, Sonora", contact:"Tu contacto aquí",
    photo:"https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=900&q=80",
    description:"Milo es tranquilo y curioso. Está buscando un hogar seguro donde pueda dormir y jugar."
  },
  {
    id: 3, name:"Max", type:"perro", age:"2 años", sex:"Macho",
    location:"Hermosillo, Sonora", contact:"Tu contacto aquí",
    photo:"https://images.unsplash.com/photo-1558788353-f76d92427f16?auto=format&fit=crop&w=900&q=80",
    description:"Max es amigable y activo. Necesita una familia que tenga tiempo para paseos y compañía."
  },
  {
    id: 4, name:"Nala", type:"gato", age:"6 meses", sex:"Hembra",
    location:"Hermosillo, Sonora", contact:"Tu contacto aquí",
    photo:"https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=900&q=80",
    description:"Nala es una gatita dulce que busca un hogar paciente, tranquilo y lleno de cariño."
  }
];

let pets = JSON.parse(localStorage.getItem("adoptaPatitasPets")) || defaultPets;

const grid = document.getElementById("petGrid");
const search = document.getElementById("searchInput");
const filter = document.getElementById("typeFilter");
const empty = document.getElementById("emptyState");

function save(){ localStorage.setItem("adoptaPatitasPets", JSON.stringify(pets)); }

function render(){
  const q = search.value.toLowerCase().trim();
  const type = filter.value;
  const filtered = pets.filter(p => {
    const text = `${p.name} ${p.age} ${p.location} ${p.description}`.toLowerCase();
    return (type==="todos" || p.type===type) && text.includes(q);
  });

  grid.innerHTML = filtered.map(p => `
    <article class="pet-card">
      <img class="pet-photo" src="${p.photo}" alt="Foto de ${escapeHTML(p.name)}" loading="lazy">
      <div class="pet-info">
        <div class="pet-top">
          <div class="pet-name">${escapeHTML(p.name)}</div>
          <span class="tag">${p.type==="perro" ? "🐶 Perro" : "🐱 Gato"}</span>
        </div>
        <div class="pet-meta">${escapeHTML(p.age)} · ${escapeHTML(p.sex)} · ${escapeHTML(p.location || "Ubicación no indicada")}</div>
        <p class="pet-description">${escapeHTML(p.description || "Sin descripción.")}</p>
        <button class="card-btn" onclick="showPet(${p.id})">Ver ficha completa</button>
      </div>
    </article>
  `).join("");

  empty.classList.toggle("hidden", filtered.length !== 0);
  document.getElementById("totalPets").textContent = pets.length;
  document.getElementById("dogCount").textContent = pets.filter(p=>p.type==="perro").length;
  document.getElementById("catCount").textContent = pets.filter(p=>p.type==="gato").length;
}

function escapeHTML(s=""){
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
}

window.showPet = function(id){
  const p = pets.find(x=>x.id===id);
  if(!p) return;
  document.getElementById("dialogContent").innerHTML = `
    <img src="${p.photo}" alt="Foto de ${escapeHTML(p.name)}">
    <div class="dialog-info">
      <span class="tag">${p.type==="perro" ? "🐶 Perro" : "🐱 Gato"}</span>
      <h2>${escapeHTML(p.name)}</h2>
      <p><strong>Edad:</strong> ${escapeHTML(p.age)}</p>
      <p><strong>Sexo:</strong> ${escapeHTML(p.sex)}</p>
      <p><strong>Zona:</strong> ${escapeHTML(p.location || "No indicada")}</p>
      <p><strong>Historia:</strong> ${escapeHTML(p.description || "Sin descripción.")}</p>
      <p><strong>Contacto:</strong> ${escapeHTML(p.contact || "No indicado")}</p>
    </div>`;
  document.getElementById("petDialog").showModal();
};

document.getElementById("closeDialog").onclick = () => document.getElementById("petDialog").close();
document.getElementById("petDialog").addEventListener("click", e => {
  if(e.target.id==="petDialog") e.target.close();
});
search.addEventListener("input", render);
filter.addEventListener("change", render);

document.getElementById("petForm").addEventListener("submit", async e => {
  e.preventDefault();
  const form = e.target;
  const file = form.photo.files[0];
  if(!file) return;
  const photo = await resizeImage(file, 900);
  const data = Object.fromEntries(new FormData(form).entries());
  pets.unshift({
    id: Date.now(), name:data.name, type:data.type, age:data.age, sex:data.sex,
    location:data.location, contact:data.contact, description:data.description, photo
  });
  save(); form.reset(); render();
  location.hash = "#mascotas";
  alert("¡Mascota publicada!");
});

function resizeImage(file, maxSize){
  return new Promise((resolve,reject)=>{
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxSize/Math.max(img.width,img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width*scale);
        canvas.height = Math.round(img.height*scale);
        canvas.getContext("2d").drawImage(img,0,0,canvas.width,canvas.height);
        resolve(canvas.toDataURL("image/jpeg",.82));
      };
      img.onerror = reject; img.src = reader.result;
    };
    reader.onerror = reject; reader.readAsDataURL(file);
  });
}

document.getElementById("resetPets").onclick = () => {
  if(confirm("¿Restaurar las mascotas de ejemplo? Se borrarán las que agregaste en este navegador.")){
    pets = defaultPets; save(); render();
  }
};

document.getElementById("makeQR").onclick = () => {
  const url = document.getElementById("urlInput").value.trim();
  const box = document.getElementById("qrcode");
  box.innerHTML = "";
  if(!url){ box.innerHTML="<span>⚠️</span>"; return; }
  if(typeof QRCode === "undefined"){
    box.innerHTML="<span>QR no disponible sin internet</span>"; return;
  }
  new QRCode(box,{text:url,width:190,height:190});
};

render();
