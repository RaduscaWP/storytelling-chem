# Dincolo de ambalaj — Beyond the Wrapper

O experiență 3D cinematică, narativă, despre poluarea cu plastic. Cinci capitole care urmăresc traseul unui ambalaj: de la natură, la chimie, la deșeu, la un ciclu material redesenat.

> *„Un ambalaj scurt poate avea o existență lungă."*

Construit cu **Three.js**, **GSAP** și **Vite**.

---

## Despre proiect

Plasticul nu este doar un obiect folosit câteva minute — este un material proiectat să reziste mult după ce dispare din mâna noastră. Site-ul te poartă prin cinci momente, fiecare cu propria sa scenă 3D și interacțiune:

| # | Capitol | Subiect |
|---|---|---|
| 01 | **Natura** | Pământul rotindu-se liniștit într-un câmp de particule. Punctul de pornire. |
| 02 | **Planeta în ambalaj** | Pământul se acoperă, strat cu strat, de un înveliș transparent de plastic. |
| 03 | **Chimia plasticului** | Șase polimeri (PET, PE, PP, PVC, PS, PLA) cu formule, utilizări, riscuri și alternative. |
| 04 | **De la produs la poluare** | Un ambalaj PET fragmentat în timp — câteva minute de utilizare, sute de ani de existență. |
| 05 | **Ciclu redesenat** | Comparație între materiale (hârtie, plastic, sticlă, metal, biodegradabil) și timpul lor în natură. |

Durată estimată: ~4 minute.

---

## Stack tehnologic

- **[Three.js](https://threejs.org/)** — randare WebGL, modele GLB, materiale fizice (transmission, roughness, metalness)
- **[GSAP](https://greensock.com/gsap/) + ScrollTrigger** — coregrafia animațiilor pe scroll
- **[Vite](https://vitejs.dev/)** — dev server și build
- **Sass** — styling modular (`main.scss` + parțiale)
- **GLTFLoader** — încărcare modele Blender (`.glb`)

Tipografie: Cormorant Garamond (titluri), Inter (corp), Space Mono (etichete).

---

## Structura proiectului

```
.
├── index.html              # punctul de intrare HTML, layout-ul tuturor secțiunilor
├── package.json
├── vite.config.js
├── src/
│   ├── main.js             # toată logica 3D + animațiile pe scroll
│   └── styles/
│       ├── main.scss       # stilul global
│       ├── _ui.scss        # navigație, buton sunet, branding
│       └── _variables.scss # paletă de culori, tipografie
└── assets/
    ├── textures/
    │   └── earth.jpg       # textura Pământului (capitolul 01)
    └── models/             # modele Blender exportate ca .glb
        ├── bottle.glb      # sticla PET (capitolul 04)
        ├── bio.glb         # frunză biodegradabilă (capitolul 05)
        ├── gl.glb          # sticla de sticlă
        ├── pet.glb         # sticla de plastic
        └── (pap.glb / me.glb folosesc geometrie procedurală fallback)
```

---

## Rulare locală

Ai nevoie de **Node.js 18+** și **npm**.

```bash
# clonare
git clone https://github.com/RaduscaWP/storytelling-chem.git
cd storytelling-chem

# instalare dependențe
npm install

# dev server (cu hot reload)
npm run dev
# → http://localhost:5173

# build pentru producție
npm run build
# → dist/

# preview build
npm run preview
```

---

## Cum funcționează (pe scurt)

1. **Un singur canvas WebGL** stă fix în background (`#canvas-bg`).
2. **Conținutul HTML scrollează deasupra**, organizat în 5 secțiuni `<section>`.
3. **GSAP ScrollTrigger** mapează poziția de scroll la parametri ai scenei 3D — rotație Pământ, opacitatea învelișului de plastic, fragmentarea sticlei, schimbarea materialelor.
4. **Modele 3D** sunt încărcate lazy din `.glb`. Dacă un model lipsește, se folosește o **geometrie procedurală fallback** generată direct în Three.js (vezi `makeFallback()` în `main.js`).
5. **Particule** și **lumini** (ambient + soare + rim + fill) creează atmosfera cinematică.

---

## Adăugarea de modele 3D noi

Modelele pentru capitolul 05 sunt încărcate după convenția `assets/models/<key>.glb` unde `<key>` e codul materialului (lowercase): `pap`, `pet`, `gl`, `me`, `bio`.

Dacă fișierul nu există, codul cade pe geometrie procedurală — deci poți adăuga sau înlocui modele oricând fără să modifici cod.

```
assets/models/pap.glb   ← Hârtie     (acum: fallback procedural)
assets/models/pet.glb   ← Plastic    ✓ are model
assets/models/gl.glb    ← Sticlă     ✓ are model
assets/models/me.glb    ← Metal      (acum: fallback procedural)
assets/models/bio.glb   ← Biodegradabil ✓ are model
```

---

## Autor

**Radu-Ștefan Grozav** — proiect școlar la chimie, 2026.
