import * as THREE from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import earthTextureUrl from '../assets/textures/earth.jpg'
import bottleModelUrl from '../assets/models/bottle.glb'

const canvas = document.getElementById('canvas-bg')
const W = () => window.innerWidth
const H = () => window.innerHeight
const isMob = W() < 768

/* ── RENDERER ── */
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: !isMob })
renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMob ? 1.5 : 2))
renderer.setSize(W(), H())
renderer.setClearColor(0x000000, 0)

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(50, W() / H(), 0.1, 100)
camera.position.set(0, 0, 5.2)

/* ── LIGHTS ── */
scene.add(new THREE.AmbientLight(0xf5f1e8, 1.4))
const sun = new THREE.DirectionalLight(0xfcf8f0, 2.2)
sun.position.set(4, 5, 4)
scene.add(sun)
const rim = new THREE.DirectionalLight(0xb9d8df, 0.9)
rim.position.set(-3, -2, -2)
scene.add(rim)
const fill = new THREE.PointLight(0x8fa683, 2, 12)
fill.position.set(-2, 1.5, 3)
scene.add(fill)

/* ── BG PARTICLES ── */
const PC = isMob ? 160 : 400
const pGeo = new THREE.BufferGeometry()
const pPos = new Float32Array(PC * 3)
const pSpd = new Float32Array(PC)
const pOff = new Float32Array(PC)
for (let i = 0; i < PC; i++) {
  pPos[i * 3]     = (Math.random() - 0.5) * 16
  pPos[i * 3 + 1] = (Math.random() - 0.5) * 9
  pPos[i * 3 + 2] = (Math.random() - 0.5) * 5
  pSpd[i] = Math.random() * 0.0025 + 0.0008
  pOff[i] = Math.random() * Math.PI * 2
}
pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3))
const pMat = new THREE.PointsMaterial({
  color: 0x8fa683,
  size: 0.045,
  transparent: true,
  opacity: 0.45,
  sizeAttenuation: true,
  depthWrite: false,
})
const pts = new THREE.Points(pGeo, pMat)
scene.add(pts)

/* ── EARTH ── */
const earthG = new THREE.Group()
const eGeo = new THREE.SphereGeometry(1, 64, 64)

const texLoader = new THREE.TextureLoader()
const earthTex = texLoader.load(earthTextureUrl)
earthTex.colorSpace = THREE.SRGBColorSpace
earthTex.anisotropy = renderer.capabilities.getMaxAnisotropy()

const eMat = new THREE.MeshStandardMaterial({
  map: earthTex,
  roughness: 0.82,
  metalness: 0.02,
  transparent: true,
  opacity: 1,
})
const earthMesh = new THREE.Mesh(eGeo, eMat)
earthG.add(earthMesh)

// Plastic wrap
const wGeo = new THREE.SphereGeometry(1.09, 64, 64)
const wMat = new THREE.MeshPhysicalMaterial({
  color: 0xddf0f8,
  transparent: true,
  opacity: 0,
  roughness: 0.02,
  transmission: 0.9,
  thickness: 0.5,
  depthWrite: false,
  side: THREE.DoubleSide,
})
const wrapMesh = new THREE.Mesh(wGeo, wMat)
earthG.add(wrapMesh)

// Deformed wrap fold
const fGeo = new THREE.SphereGeometry(1.095, 40, 40)
const fPos = fGeo.attributes.position
for (let i = 0; i < fPos.count; i++) {
  const x = fPos.getX(i), y = fPos.getY(i), z = fPos.getZ(i)
  const d = 0.016 * (Math.sin(x * 9 + y * 7) * Math.cos(z * 8 + x * 6))
  const l = Math.sqrt(x * x + y * y + z * z)
  fPos.setXYZ(i, (x / l) * (1.095 + d), (y / l) * (1.095 + d), (z / l) * (1.095 + d))
}
fGeo.computeVertexNormals()
const fMat = new THREE.MeshPhysicalMaterial({
  color: 0xeaf8fc,
  transparent: true,
  opacity: 0,
  roughness: 0.04,
  depthWrite: false,
})
const foldMesh = new THREE.Mesh(fGeo, fMat)
earthG.add(foldMesh)
earthG.position.set(2.2, 0, 0)
earthG.scale.setScalar(1.3)
// Slight axial tilt so the auto-rotation reads more naturally.
earthG.rotation.z = 0.32
scene.add(earthG)

/* ── MOLECULE DATA ── */
const molData = {
  PET: {
    name: 'Polietilen tereftalat',
    formula: '(C₁₀H₈O₄)ₙ',
    use: 'Sticle de băutură, recipiente alimentare',
    property: 'Transparent, rezistent, ușor',
    risk: 'Ajunge frecvent în ape și se fragmentează în timp',
    better: 'Colectare separată și reciclare mecanică',
    atoms: [
      { p: [0, 0, 0], r: 0.22, c: 0x2e2e2e },
      { p: [0.5, 0.3, 0], r: 0.22, c: 0x2e2e2e },
      { p: [1.0, 0, 0], r: 0.22, c: 0x2e2e2e },
      { p: [1.0, -0.55, 0], r: 0.22, c: 0x2e2e2e },
      { p: [0.5, -0.82, 0], r: 0.22, c: 0x2e2e2e },
      { p: [0, -0.55, 0], r: 0.22, c: 0x2e2e2e },
      { p: [1.6, 0.05, 0], r: 0.19, c: 0xb03030 },
      { p: [2.15, 0.05, 0], r: 0.19, c: 0xb03030 },
      { p: [2.5, 0, 0], r: 0.22, c: 0x2e2e2e },
      { p: [3.0, 0, 0], r: 0.22, c: 0x2e2e2e },
      { p: [-0.6, -0.05, 0], r: 0.19, c: 0xb03030 },
      { p: [-1.1, -0.05, 0], r: 0.22, c: 0x2e2e2e },
    ],
    bonds: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,0],[2,6],[6,7],[7,8],[8,9],[0,10],[10,11]],
  },
  PE: {
    name: 'Polietilenă',
    formula: '(−CH₂−CH₂−)ₙ',
    use: 'Pungi, folii, ambalaje flexibile',
    property: 'Cel mai produs plastic global, ușor și ieftin',
    risk: 'Persistă 100–500 ani și se fragmentează în microplastic',
    better: 'Reducerea consumului, reciclare unde infrastructura permite',
    atoms: [
      { p: [-1.5, 0.35, 0], r: 0.22, c: 0x2e2e2e },
      { p: [-0.7, -0.35, 0], r: 0.22, c: 0x2e2e2e },
      { p: [0, 0.35, 0], r: 0.22, c: 0x2e2e2e },
      { p: [0.7, -0.35, 0], r: 0.22, c: 0x2e2e2e },
      { p: [1.5, 0.35, 0], r: 0.22, c: 0x2e2e2e },
      { p: [-1.5, 0.35, 0.45], r: 0.1, c: 0xd0d0d0 },
      { p: [0, 0.35, 0.45], r: 0.1, c: 0xd0d0d0 },
      { p: [1.5, 0.35, 0.45], r: 0.1, c: 0xd0d0d0 },
    ],
    bonds: [[0,1],[1,2],[2,3],[3,4],[0,5],[2,6],[4,7]],
  },
  PP: {
    name: 'Polipropilenă',
    formula: '(−CH₂−CH(CH₃)−)ₙ',
    use: 'Capace, recipiente, ambalaje rigide',
    property: 'Rezistență termică și chimică bună',
    risk: 'Reciclare variabilă după infrastructura locală',
    better: 'Design pentru colectare și sortare clară',
    atoms: [
      { p: [-1.2, 0, 0], r: 0.22, c: 0x2e2e2e },
      { p: [-0.35, 0.45, 0], r: 0.22, c: 0x2e2e2e },
      { p: [0.5, -0.1, 0], r: 0.22, c: 0x2e2e2e },
      { p: [1.35, 0.45, 0], r: 0.22, c: 0x2e2e2e },
      { p: [-0.35, 1.15, 0], r: 0.18, c: 0x2e2e2e },
      { p: [1.35, 1.15, 0], r: 0.18, c: 0x2e2e2e },
    ],
    bonds: [[0,1],[1,2],[2,3],[1,4],[3,5]],
  },
  PVC: {
    name: 'Policlorură de vinil',
    formula: '(−CH₂−CHCl−)ₙ',
    use: 'Țevi, construcții, materiale rigide',
    property: 'Durabil, rigid sau flexibil prin aditivi',
    risk: 'Clorul face reciclarea mai complexă',
    better: 'Separare corectă la colectarea selectivă',
    atoms: [
      { p: [-1.2, -0.3, 0], r: 0.22, c: 0x2e2e2e },
      { p: [-0.2, 0.3, 0], r: 0.22, c: 0x2e2e2e },
      { p: [0.7, -0.3, 0], r: 0.22, c: 0x2e2e2e },
      { p: [1.7, 0.3, 0], r: 0.22, c: 0x2e2e2e },
      { p: [-0.2, 1.1, 0], r: 0.32, c: 0x4a7c59 },
      { p: [1.7, 1.1, 0], r: 0.32, c: 0x4a7c59 },
    ],
    bonds: [[0,1],[1,2],[2,3],[1,4],[3,5]],
  },
  PS: {
    name: 'Polistiren',
    formula: '(−CH₂−CH(C₆H₅)−)ₙ',
    use: 'Caserole, pahare, spumă polistirenică',
    property: 'Ușor, izolator, fragil mecanic',
    risk: 'Se fragmentează rapid în microparticule',
    better: 'Înlocuire cu alternative acolo unde e posibil',
    atoms: [
      { p: [-0.8, 0, 0], r: 0.22, c: 0x2e2e2e },
      { p: [0, 0.45, 0], r: 0.22, c: 0x2e2e2e },
      { p: [0.8, 0, 0], r: 0.22, c: 0x2e2e2e },
      { p: [0, 1.15, 0.05], r: 0.18, c: 0x2e2e2e },
      { p: [0.55, 1.5, 0.05], r: 0.18, c: 0x2e2e2e },
      { p: [0.55, 2.15, 0.05], r: 0.18, c: 0x2e2e2e },
      { p: [0, 2.5, 0.05], r: 0.18, c: 0x2e2e2e },
      { p: [-0.55, 2.15, 0.05], r: 0.18, c: 0x2e2e2e },
      { p: [-0.55, 1.5, 0.05], r: 0.18, c: 0x2e2e2e },
    ],
    bonds: [[0,1],[1,2],[1,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,3]],
  },
  PLA: {
    name: 'Acid polilactic',
    formula: '(C₃H₄O₂)ₙ',
    use: 'Ambalaje compostabile, tacâmuri biodegradabile',
    property: 'Origine parțial bio-based, transparent',
    risk: 'Nu dispare magic în natură fără compostare',
    better: 'Compostare industrială în sisteme controlate',
    atoms: [
      { p: [-1.2, 0, 0], r: 0.22, c: 0x2e2e2e },
      { p: [-0.3, 0.45, 0], r: 0.22, c: 0x2e2e2e },
      { p: [0.55, -0.15, 0], r: 0.19, c: 0xb03030 },
      { p: [1.35, 0.45, 0], r: 0.22, c: 0x2e2e2e },
      { p: [2.1, -0.15, 0], r: 0.19, c: 0xb03030 },
      { p: [-0.3, 1.2, 0], r: 0.15, c: 0xe0e0e0 },
    ],
    bonds: [[0,1],[1,2],[2,3],[3,4],[1,5]],
  },
}

/* ── MOLECULE GROUP ── */
const MOL_SCALE = 0.5
const molG = new THREE.Group()
molG.visible = false
molG.position.set(1.85, 0, 0)
molG.scale.setScalar(MOL_SCALE)
scene.add(molG)

// Refreshed at the end of buildMol since meshes/materials are recreated per pill.
const molMats = []

function buildMol(key) {
  while (molG.children.length) {
    const c = molG.children[0]
    c.geometry?.dispose()
    c.material?.dispose()
    molG.remove(c)
  }
  const d = molData[key]
  if (!d) return

  // Compute local-space center from atom positions so molG.position/scale work predictably.
  let minX = Infinity, maxX = -Infinity
  let minY = Infinity, maxY = -Infinity
  let minZ = Infinity, maxZ = -Infinity
  d.atoms.forEach((a) => {
    const [x, y, z] = a.p
    if (x < minX) minX = x; if (x > maxX) maxX = x
    if (y < minY) minY = y; if (y > maxY) maxY = y
    if (z < minZ) minZ = z; if (z > maxZ) maxZ = z
  })
  const cx = (minX + maxX) / 2
  const cy = (minY + maxY) / 2
  const cz = (minZ + maxZ) / 2

  d.atoms.forEach((a) => {
    const m = new THREE.Mesh(
      new THREE.SphereGeometry(a.r, 16, 16),
      new THREE.MeshStandardMaterial({ color: a.c, roughness: 0.28, metalness: 0.05 }),
    )
    m.position.set(a.p[0] - cx, a.p[1] - cy, a.p[2] - cz)
    molG.add(m)
  })
  ;(d.bonds || []).forEach(([i, j]) => {
    const v1 = new THREE.Vector3(d.atoms[i].p[0] - cx, d.atoms[i].p[1] - cy, d.atoms[i].p[2] - cz)
    const v2 = new THREE.Vector3(d.atoms[j].p[0] - cx, d.atoms[j].p[1] - cy, d.atoms[j].p[2] - cz)
    const len = v1.distanceTo(v2)
    const mid = v1.clone().add(v2).multiplyScalar(0.5)
    const bm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, len, 8),
      new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.5 }),
    )
    bm.position.copy(mid)
    bm.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      v2.clone().sub(v1).normalize(),
    )
    molG.add(bm)
  })

  // Refresh the fade list — atom/bond meshes are rebuilt for every pill change.
  molMats.length = 0
  molG.traverse((o) => {
    if (o.isMesh && o.material) {
      o.material.transparent = true
      molMats.push({ mat: o.material, base: 1 })
    }
  })
}
buildMol('PET')

/* ── PET BOTTLE ── */
const BOTTLE_SCALE = 0.85
const bottleG = new THREE.Group()
bottleG.visible = false
bottleG.scale.setScalar(BOTTLE_SCALE)
bottleG.position.set(1.3, 0, 0)
scene.add(bottleG)

// Inner pivot lets the GLB bob without disturbing bottleG's tween-controlled y.
const bottlePivot = new THREE.Group()
bottleG.add(bottlePivot)

// Materials whose opacity we drive for the Pollution → Degradation hand-off.
// Populated once the GLB resolves; each entry remembers its baseline opacity.
const bottleMats = []

const gltfLoader = new GLTFLoader()
gltfLoader.load(
  bottleModelUrl,
  (gltf) => {
    const model = gltf.scene
    // Normalize: scale so the bottle is ~1.9 units tall, then re-center on origin.
    // We compute the bbox BEFORE scaling for sizing, then AGAIN AFTER scaling for
    // centering — applying scale + offset in the wrong order leaves the model
    // visually offset from bottleG by `center * (1 - scale)`.
    const preBox = new THREE.Box3().setFromObject(model)
    const preSize = preBox.getSize(new THREE.Vector3())
    const targetH = 1.9
    const s = preSize.y > 0 ? targetH / preSize.y : 1
    model.scale.setScalar(s)
    const postBox = new THREE.Box3().setFromObject(model)
    const postCenter = postBox.getCenter(new THREE.Vector3())
    model.position.sub(postCenter)

    model.traverse((o) => {
      if (!o.isMesh) return
      o.castShadow = false
      o.receiveShadow = false
      const mats = Array.isArray(o.material) ? o.material : [o.material]
      mats.forEach((m) => {
        if (!m) return
        m.transparent = true
        bottleMats.push({ mat: m, base: m.opacity ?? 1 })
      })
    })

    bottlePivot.add(model)
  },
  undefined,
  (err) => console.warn('[bottle.glb] failed to load:', err),
)

/* ── CYCLE: SWAPPABLE MATERIAL MODELS ── */
const cycleG = new THREE.Group()
cycleG.visible = false
cycleG.position.set(1.7, 0, 0) // ajustat în updateCycleAnchor() ca să se alinieze cu #cycle-3d-anchor
scene.add(cycleG)

// Pivot interior — primește rotirea din drag/auto-rotate, separat de poziția cycleG
// (poziția se actualizează în funcție de layout-ul DOM al anchor-ului)
const cyclePivot = new THREE.Group()
cycleG.add(cyclePivot)

// Procedural fallback geometries — folosite imediat, înlocuite de GLB-uri din Blender
// dacă există fișierele corespunzătoare în assets/models/<key>.glb.
function makeFallback(key) {
  const g = new THREE.Group()
  if (key === 'PAP') {
    const mat = new THREE.MeshStandardMaterial({ color: 0xc9a76d, roughness: 0.85, metalness: 0.02, side: THREE.DoubleSide, transparent: true, opacity: 1 })
    const sheet = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.8, 12, 14), mat)
    const pos = sheet.geometry.attributes.position
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), y = pos.getY(i)
      pos.setZ(i, Math.sin(x * 4 + y * 3) * 0.06 + Math.cos(y * 5) * 0.04)
    }
    sheet.geometry.computeVertexNormals()
    sheet.rotation.set(-0.18, 0.2, 0.05)
    g.add(sheet)
  } else if (key === 'PET') {
    const mat = new THREE.MeshPhysicalMaterial({ color: 0xddf0ee, roughness: 0.05, transmission: 0.85, thickness: 0.4, transparent: true, opacity: 0.85 })
    const pts = []
    pts.push(new THREE.Vector2(0, -0.9))
    pts.push(new THREE.Vector2(0.42, -0.9))
    pts.push(new THREE.Vector2(0.42, 0.4))
    pts.push(new THREE.Vector2(0.32, 0.55))
    pts.push(new THREE.Vector2(0.18, 0.65))
    pts.push(new THREE.Vector2(0.16, 0.85))
    pts.push(new THREE.Vector2(0.16, 0.95))
    g.add(new THREE.Mesh(new THREE.LatheGeometry(pts, 32), mat))
  } else if (key === 'GL') {
    const mat = new THREE.MeshPhysicalMaterial({ color: 0xb9d8df, roughness: 0.05, transmission: 0.9, thickness: 0.5, transparent: true, opacity: 0.7 })
    const pts = []
    pts.push(new THREE.Vector2(0, -0.7))
    pts.push(new THREE.Vector2(0.5, -0.7))
    pts.push(new THREE.Vector2(0.5, 0.4))
    pts.push(new THREE.Vector2(0.42, 0.55))
    pts.push(new THREE.Vector2(0.42, 0.7))
    g.add(new THREE.Mesh(new THREE.LatheGeometry(pts, 32), mat))
  } else if (key === 'ME') {
    const mat = new THREE.MeshStandardMaterial({ color: 0xb8b8b8, roughness: 0.35, metalness: 0.85, transparent: true, opacity: 1 })
    g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 1.4, 32, 1, false), mat))
    const lipMat = new THREE.MeshStandardMaterial({ color: 0x9d9d9d, roughness: 0.4, metalness: 0.9, transparent: true, opacity: 1 })
    const lip = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.04, 8, 32), lipMat)
    lip.rotation.x = Math.PI / 2
    lip.position.y = 0.7
    g.add(lip)
    const lip2 = lip.clone()
    lip2.position.y = -0.7
    g.add(lip2)
  } else if (key === 'BIO') {
    const mat = new THREE.MeshStandardMaterial({ color: 0x6b9e6b, roughness: 0.7, metalness: 0.05, side: THREE.DoubleSide, transparent: true, opacity: 1 })
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.7, 18, 12, 0, Math.PI), mat)
    leaf.scale.set(1, 1.5, 0.25)
    leaf.rotation.set(0, 0, 0.3)
    g.add(leaf)
    const stemMat = new THREE.MeshStandardMaterial({ color: 0x4f614a, roughness: 0.8 })
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.04, 0.6, 8), stemMat)
    stem.position.y = -0.85
    g.add(stem)
  }
  return g
}

const matKeys = ['PAP', 'PET', 'GL', 'ME', 'BIO']
const matModels = {} // key → { group, mats }
let matActive = null

function registerMatGroup(key, modelObj) {
  // Normalize: scale by largest axis so flat models (eg. BIO leaf with shallow Y)
  // don't blow up X/Z when their thin dimension is the only thing matched. Then
  // re-center on origin.
  const pre = new THREE.Box3().setFromObject(modelObj)
  const sz = pre.getSize(new THREE.Vector3())
  const targetH = 1.7
  const maxDim = Math.max(sz.x, sz.y, sz.z)
  const s = maxDim > 0 ? targetH / maxDim : 1
  modelObj.scale.setScalar(s)
  const post = new THREE.Box3().setFromObject(modelObj)
  modelObj.position.sub(post.getCenter(new THREE.Vector3()))

  const mats = []
  modelObj.traverse((o) => {
    if (!o.isMesh) return
    o.castShadow = false
    o.receiveShadow = false
    const arr = Array.isArray(o.material) ? o.material : [o.material]
    arr.forEach((m) => {
      if (!m) return
      m.transparent = true
      mats.push({ mat: m, base: m.opacity ?? 1 })
    })
  })

  const wrap = new THREE.Group()
  wrap.add(modelObj)
  wrap.visible = false
  cyclePivot.add(wrap)
  matModels[key] = { group: wrap, mats }

  // Default selection — primul model gata = PAP (Hârtie)
  if (key === 'PAP' && !matActive) setActiveMaterial('PAP', false)
}

// Construire fallback-uri imediate, apoi încercare de încărcare GLB peste
matKeys.forEach((key) => registerMatGroup(key, makeFallback(key)))

// Try-load GLB-uri din Blender (dacă există în assets/models/)
matKeys.forEach((key) => {
  const url = new URL(`../assets/models/${key.toLowerCase()}.glb`, import.meta.url).href
  gltfLoader.load(
    url,
    (gltf) => {
      // Înlocuire fallback cu modelul Blender real
      const wasActive = matActive === key
      const old = matModels[key]
      if (old) {
        old.group.removeFromParent()
        old.group.traverse((o) => {
          if (o.isMesh) {
            o.geometry?.dispose()
            const arr = Array.isArray(o.material) ? o.material : [o.material]
            arr.forEach((m) => m?.dispose?.())
          }
        })
      }
      registerMatGroup(key, gltf.scene)
      if (wasActive) {
        matActive = null
        setActiveMaterial(key, false)
      }
    },
    undefined,
    () => { /* GLB lipsește — păstrăm fallback-ul procedural */ },
  )
})

function setActiveMaterial(key, animate = true) {
  if (!matModels[key]) return
  const prev = matActive
  if (prev && prev !== key && matModels[prev]) {
    const prevGroup = matModels[prev].group
    if (animate) {
      gsap.to(prevGroup.scale, {
        x: 0.01, y: 0.01, z: 0.01,
        duration: 0.3, ease: 'power2.in', overwrite: true,
        onComplete: () => { prevGroup.visible = false; prevGroup.scale.setScalar(1) },
      })
    } else {
      prevGroup.visible = false
    }
  }
  matActive = key
  const next = matModels[key].group
  next.visible = true
  if (animate) {
    next.scale.setScalar(0.01)
    gsap.fromTo(next.scale,
      { x: 0.01, y: 0.01, z: 0.01 },
      { x: 1, y: 1, z: 1, duration: 0.55, ease: 'back.out(1.7)', overwrite: true },
    )
  } else {
    next.scale.setScalar(1)
  }
}

// Microplastic care curge din §4 în §5 — un flux de particule fine care plutesc
// în jos prin scenă (din zona de Poluare) și se sting după ce ies sub viewport.
// Mai mici și mai numeroase decât înainte, ca să citească drept „microplastic în mișcare",
// nu ca un singur punct. La nivel de scenă (nu în cycleG) ca să poată fi afișate
// independent de poziția obiectului activ.
const cycleParticles = new THREE.Group()
const cpMeshes = []
const CP_COUNT = isMob ? 90 : 180
const cpSpawnRange = { x: 4.5, yTop: 3.2, yBot: -3.2, z: 1.6 }
function resetCpParticle(mp, fromTop = true) {
  mp.position.set(
    (Math.random() - 0.5) * cpSpawnRange.x,
    fromTop ? cpSpawnRange.yTop + Math.random() * 1.5
            : (Math.random() - 0.5) * (cpSpawnRange.yTop - cpSpawnRange.yBot),
    (Math.random() - 0.5) * cpSpawnRange.z,
  )
  mp.userData.v.set(
    (Math.random() - 0.5) * 0.004,
    -(Math.random() * 0.012 + 0.004), // drift în jos: microplastic care cade
    (Math.random() - 0.5) * 0.002,
  )
  mp.userData.swayPhase = Math.random() * Math.PI * 2
}
for (let i = 0; i < CP_COUNT; i++) {
  const mp = new THREE.Mesh(
    new THREE.SphereGeometry(Math.random() * 0.012 + 0.004, 4, 4),
    new THREE.MeshBasicMaterial({ color: 0xb9d8df, transparent: true, opacity: 0 }),
  )
  mp.userData.v = new THREE.Vector3()
  resetCpParticle(mp, false)
  cycleParticles.add(mp)
  cpMeshes.push(mp)
}
cycleParticles.visible = false
// Două surse de amplitudine: bridge la finalul §5 + bell-curve în timpul §6.
// În animate luăm max-ul ca să nu apară glitch când ambele triggere se suprapun.
let bridgeOpFromPoll = 0
let bellOpFromCycle = 0
scene.add(cycleParticles)

const matTints = {
  PAP: new THREE.Color(0xc9a76d),
  PET: new THREE.Color(0x9bb1bd),
  GL:  new THREE.Color(0xb9d8df),
  ME:  new THREE.Color(0x9d9d9d),
  BIO: new THREE.Color(0x8fa683),
}

/* ── SECTION CROSS-FADE SYSTEM ── */
// Per-group material lists with baseline opacities. fadeMats lerps each material
// from its CURRENT opacity to `base × target`, so it composes cleanly with any
// scroll-driven values that were left in place when the trigger last ran.
const earthMats = [
  { mat: eMat, base: 1 },
  { mat: wMat, base: 0 },
  { mat: fMat, base: 0 },
]
// cycleMats e dinamic — întoarce materialele modelului activ + particulele de bridge
function getCycleMats() {
  const out = []
  if (matActive && matModels[matActive]) out.push(...matModels[matActive].mats)
  cpMeshes.forEach((m) => out.push({ mat: m.material, base: 0.45 }))
  return out
}

function fadeMats(mats, target, duration, onComplete) {
  if (!mats || mats.length === 0) {
    if (onComplete) onComplete()
    return null
  }
  const startOps = mats.map(({ mat }) => mat.opacity)
  const endOps = mats.map(({ base }) => base * target)
  const obj = { p: 0 }
  return gsap.to(obj, {
    p: 1,
    duration,
    ease: 'power2.inOut',
    overwrite: true,
    onUpdate() {
      mats.forEach(({ mat }, i) => {
        mat.transparent = true
        mat.opacity = THREE.MathUtils.lerp(startOps[i], endOps[i], obj.p)
      })
    },
    onComplete,
  })
}

function groupForIdx(idx) {
  if (idx === 0 || idx === 1) return earthG
  return [null, earthG, molG, bottleG, cycleG][idx]
}
function matsForIdx(idx) {
  if (idx === 0 || idx === 1) return earthMats
  if (idx === 4) return getCycleMats()
  return [null, null, molMats, bottleMats, null][idx]
}

/* ── STATE ── */
let curSec = 0
const secNames  = ['Natura', 'Planeta', 'Chimie', 'Poluare', 'Ciclu']
const allGroups = [null, earthG, molG, bottleG, cycleG]

function activateSec(idx) {
  if (curSec === idx) return
  const prev = curSec
  curSec = idx
  document.getElementById('sec-id').innerHTML = `0${idx + 1} / 05<br>${secNames[idx]}`
  document.querySelectorAll('.nav-dot').forEach((d, i) => d.classList.toggle('active', i === idx))
  pts.visible = idx <= 3

  const prevGroup = groupForIdx(prev)
  const nextGroup = groupForIdx(idx)

  if (prevGroup === nextGroup) {
    // Hero ↔ Planet: same earthG, no fade needed. Re-arm in case the Planet
    // trigger's last write left eMat dimmed.
    if (idx <= 1) eMat.opacity = 1
  } else {
    // Sequential cross-fade — fade out the leaving group fully, then fade in
    // the entering group, so the two never share the screen mid-tween.
    const FADE_OUT = 0.28
    const FADE_IN = 0.34

    if (prevGroup) {
      const prevMats = matsForIdx(prev)
      fadeMats(prevMats, 0, FADE_OUT, () => {
        if (groupForIdx(curSec) !== prevGroup) prevGroup.visible = false
      })
    }
    if (nextGroup) {
      gsap.delayedCall(FADE_OUT, () => {
        // Bail if the user kept scrolling and we're no longer the active group.
        if (groupForIdx(curSec) !== nextGroup) return
        nextGroup.visible = true
        const nextMats = matsForIdx(idx)
        nextMats.forEach(({ mat }) => {
          mat.transparent = true
          mat.opacity = 0
        })
        fadeMats(nextMats, 1, FADE_IN)
      })
    }
  }

  // Pollution panels are HTML/CSS, reset independently of the 3D fade.
  if (idx === 3) {
    const pa = document.querySelector('.poll-text--a')
    const pb = document.querySelector('.poll-text--b')
    if (pa) pa.style.opacity = 1
    if (pb) pb.style.opacity = 0
  }
}

/* ── SCROLL TRIGGERS ── */
gsap.registerPlugin(ScrollTrigger)

// Hero text in
gsap.fromTo('.hero-h1',   { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1.4, delay: 0.25 })
gsap.fromTo('.hero-p',    { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1.2, delay: 0.55 })
gsap.fromTo('.hero-meta', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1.0, delay: 0.85 })

// Hero → Planet right-to-left morph (spans both sections)
// X-motion is compressed into the first half of the range so the Earth has
// fully settled on the left by the time the user is reading Planet copy.
const xEase = gsap.parseEase('power2.inOut')
ScrollTrigger.create({
  trigger: '#s-hero',
  endTrigger: '#s-planet',
  start: 'top top',
  end: 'bottom bottom',
  onUpdate(self) {
    const p = self.progress
    const xP = THREE.MathUtils.clamp(p / 0.5, 0, 1)
    earthG.position.x = gsap.utils.interpolate(2.2, -2.0, xEase(xP))
    // Slight vertical drift so it feels less rigid.
    earthG.position.y = -0.15 + Math.sin(p * Math.PI) * 0.18
    // Grow gradually across the whole range — bigger overall than before.
    earthG.scale.setScalar(1.3 + p * 0.9)
  },
})

// Planet-only scroll: wrap fade-in + camera zoom. The hand-off to Chemistry is
// driven by the cross-fade in activateSec, not a scroll-tied opacity ramp.
ScrollTrigger.create({
  trigger: '#s-planet',
  start: 'top top',
  end: 'bottom bottom',
  onUpdate(self) {
    if (curSec !== 0 && curSec !== 1) return
    const p = self.progress
    const wrapIn = THREE.MathUtils.smoothstep(p, 0.18, 0.7)
    wrapMesh.material.opacity = wrapIn * 0.48
    foldMesh.material.opacity = wrapIn * 0.32
    camera.position.z = 5.2 - p * 1.5
  },
})

// Pollution scroll — right→left morph (mirror of the Hero→Planet motion)
const pollPanelA = document.querySelector('.poll-text--a')
const pollPanelB = document.querySelector('.poll-text--b')
ScrollTrigger.create({
  trigger: '#s-poll',
  start: 'top top',
  end: 'bottom bottom',
  onUpdate(self) {
    const p = self.progress
    // The bottle's traversal is centered on the panel cross-fade (mid p≈0.5) so it
    // doesn't run through the text before the text fades. It also arcs DOWN
    // visibly — a swing rather than a straight slide — peaking at the same midpoint.
    const bP = THREE.MathUtils.clamp((p - 0.25) / 0.5, 0, 1)
    bottleG.position.x = gsap.utils.interpolate(1.3, -1.3, xEase(bP))
    bottleG.position.y = -Math.sin(bP * Math.PI) * 0.9
    bottleG.scale.setScalar(BOTTLE_SCALE * (1 + p * 0.45))
    // Panel cross-fade — A solo until ~p=0.32, hand over to B by ~p=0.6.
    if (pollPanelA) pollPanelA.style.opacity = 1 - THREE.MathUtils.smoothstep(p, 0.32, 0.52)
    if (pollPanelB) pollPanelB.style.opacity = THREE.MathUtils.smoothstep(p, 0.40, 0.60)
    // Bridge §4→§5: la finalul Poluării particulele cycle încep să apară —
    // efectul de „microplastic care curge" în secțiunea Ciclu.
    bridgeOpFromPoll = THREE.MathUtils.smoothstep(p, 0.7, 1.0) * 0.6
    if (bridgeOpFromPoll > 0) cycleParticles.visible = true
  },
  onLeave: () => { bridgeOpFromPoll = 0 },
  onLeaveBack: () => { bridgeOpFromPoll = 0 },
})

// Cycle scroll — menținem particulele active + recede subtil obiectul pe scroll
ScrollTrigger.create({
  trigger: '#s-cycle',
  start: 'top bottom',
  end: 'bottom top',
  onUpdate(self) {
    const p = self.progress
    cycleParticles.visible = true
    // Profil bell: ramp up până la mijloc, ramp down după
    const a = THREE.MathUtils.smoothstep(p, 0.0, 0.25)
    const b = 1 - THREE.MathUtils.smoothstep(p, 0.75, 1.0)
    bellOpFromCycle = Math.min(a, b)
    if (curSec === 4) cyclePivot.position.z = -p * 0.35
  },
  onLeave: () => { bellOpFromCycle = 0 },
  onLeaveBack: () => { bellOpFromCycle = 0 },
})

/* ── SECTION DETECTION ── */
const sections = document.querySelectorAll('section[data-screen-label]')
const sObs = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting && e.intersectionRatio > 0.35) {
        activateSec([...sections].indexOf(e.target))
      }
    })
  },
  { threshold: 0.35 },
)
sections.forEach((s) => sObs.observe(s))

/* ── DRAG INTERACTIONS (Earth on 0/1, Molecule on 2) ── */
let dragging = false
let prevMX = 0
let prevMY = 0

function isInteractiveTarget(target) {
  return !!(
    target.closest('#ui') ||
    target.closest('#mol-detail') ||
    target.closest('a, button')
  )
}

function rotateActiveObject(dx, dy) {
  if (curSec === 0 || curSec === 1) {
    earthG.rotation.y += dx
    earthG.rotation.x += dy
  } else if (curSec === 2) {
    molG.rotation.y += dx
    molG.rotation.x += dy
  } else if (curSec === 3) {
    bottleG.rotation.y += dx
    bottleG.rotation.x += dy
  } else if (curSec === 4) {
    cyclePivot.rotation.y += dx
    cyclePivot.rotation.x += dy
  }
}

function canDragInSec(idx) {
  return idx === 0 || idx === 1 || idx === 2 || idx === 3 || idx === 4
}

window.addEventListener('mousedown', (e) => {
  if (!canDragInSec(curSec)) return
  if (isInteractiveTarget(e.target)) return
  dragging = true
  prevMX = e.clientX
  prevMY = e.clientY
  document.body.classList.add('is-dragging')
})
window.addEventListener('mouseup', () => {
  dragging = false
  document.body.classList.remove('is-dragging')
})
window.addEventListener('mousemove', (e) => {
  if (!dragging) return
  rotateActiveObject((e.clientX - prevMX) * 0.012, (e.clientY - prevMY) * 0.012)
  prevMX = e.clientX
  prevMY = e.clientY
})

let tStart = null
window.addEventListener('touchstart', (e) => {
  if (!canDragInSec(curSec)) return
  if (isInteractiveTarget(e.target)) return
  tStart = { x: e.touches[0].clientX, y: e.touches[0].clientY }
})
window.addEventListener(
  'touchmove',
  (e) => {
    if (!tStart) return
    rotateActiveObject(
      (e.touches[0].clientX - tStart.x) * 0.012,
      (e.touches[0].clientY - tStart.y) * 0.012,
    )
    tStart = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  },
  { passive: true },
)
window.addEventListener('touchend', () => { tStart = null })

document.getElementById('mol-pills').querySelectorAll('.pill').forEach((pill) => {
  pill.addEventListener('click', () => {
    document.querySelectorAll('.pill').forEach((p) => p.classList.remove('active'))
    pill.classList.add('active')
    buildMol(pill.dataset.mol)
    showDetail(pill.dataset.mol)
    gsap.fromTo(
      molG.scale,
      { x: MOL_SCALE * 0.5, y: MOL_SCALE * 0.5, z: MOL_SCALE * 0.5 },
      { x: MOL_SCALE, y: MOL_SCALE, z: MOL_SCALE, duration: 0.55, ease: 'back.out(1.7)' },
    )
  })
})

document.getElementById('cycle-cards').querySelectorAll('.mat-card').forEach((card) => {
  card.addEventListener('click', () => {
    document.querySelectorAll('.mat-card').forEach((c) => c.classList.remove('active'))
    card.classList.add('active')
    setActiveMaterial(card.dataset.mat)
  })
})

function showDetail(key) {
  const d = molData[key]
  document.getElementById('md-code').textContent = key
  document.getElementById('md-name').textContent = d.name
  document.getElementById('md-formula').textContent = d.formula
  document.getElementById('md-use').textContent = d.use
  document.getElementById('md-property').textContent = d.property
  document.getElementById('md-risk').textContent = d.risk
  document.getElementById('md-better').textContent = d.better
}
showDetail('PET')

/* ── NAV DOT JUMP ── */
document.querySelectorAll('.nav-dot').forEach((dot) => {
  dot.addEventListener('click', () => {
    const idx = parseInt(dot.dataset.idx, 10)
    const target = sections[idx]
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
})

/* ── RENDER LOOP ── */
let t = 0
function animate() {
  requestAnimationFrame(animate)
  t += 0.01

  // Float particles
  const pa = pts.geometry.attributes.position
  for (let i = 0; i < PC; i++) {
    pa.setY(i, pa.getY(i) + pSpd[i])
    pa.setX(i, pa.getX(i) + Math.sin(t * 0.45 + pOff[i]) * 0.0018)
    if (pa.getY(i) > 4.8) pa.setY(i, -4.8)
  }
  pa.needsUpdate = true

  // Earth auto-rotate (Hero + Planet) — paused while user is dragging it.
  if ((curSec === 0 || curSec === 1) && !dragging) earthG.rotation.y += 0.0035

  // Molecule auto-rotate
  if (curSec === 2 && !dragging) molG.rotation.y += 0.005

  // Bottle: continuous spin (paused while dragging) + gentle bob
  if (curSec === 3) {
    if (!dragging) bottleG.rotation.y += 0.005
    bottlePivot.position.y = Math.sin(t * 0.65) * 0.09
  }

  // Cycle: auto-rotate + bob obiect activ
  if (curSec === 4) {
    if (!dragging) cyclePivot.rotation.y += 0.0045
    cyclePivot.position.y = Math.sin(t * 0.6) * 0.06
  }

  // Cycle particles — flux de microplastic care curge din §4 (Poluare) în §5 (Ciclu).
  // Particulele cad de sus în jos cu un sway orizontal subtil; cele care ies sub
  // viewport sunt reciclate sus, ca fluxul să fie continuu cât timp e vizibil.
  if (cycleParticles.visible) {
    cycleParticles.position.copy(cycleG.position)
    const tint = matTints[matActive] || matTints.PAP
    const bioFactor = matActive === 'BIO' ? 0.4 : 1.0
    const targetOp = Math.max(bridgeOpFromPoll, bellOpFromCycle) * 0.6 * bioFactor
    let maxOp = 0
    cpMeshes.forEach((mp) => {
      mp.userData.swayPhase += 0.018
      mp.position.x += mp.userData.v.x + Math.sin(mp.userData.swayPhase) * 0.0035
      mp.position.y += mp.userData.v.y
      mp.position.z += mp.userData.v.z
      if (mp.position.y < cpSpawnRange.yBot) resetCpParticle(mp, true)
      mp.material.color.lerp(tint, 0.04)
      mp.material.opacity = THREE.MathUtils.lerp(mp.material.opacity, targetOp, 0.05)
      if (mp.material.opacity > maxOp) maxOp = mp.material.opacity
    })
    if (targetOp === 0 && maxOp < 0.001) cycleParticles.visible = false
  }

  renderer.render(scene, camera)
}
animate()

/* ── ANCHOR pentru obiectul 3D din secțiunea Ciclu ── */
// Aliniază cycleG.position.x cu centrul orizontal al elementului #cycle-3d-anchor
// (coloana dreaptă din layout-ul §6). Rulat la load + resize.
function updateCycleAnchor() {
  const anchor = document.getElementById('cycle-3d-anchor')
  if (!anchor) return
  const r = anchor.getBoundingClientRect()
  if (r.width === 0) return
  const ndcX = ((r.left + r.width / 2) / window.innerWidth) * 2 - 1
  const halfH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z
  const halfW = halfH * camera.aspect
  cycleG.position.x = ndcX * halfW
}

/* ── RESIZE ── */
window.addEventListener('resize', () => {
  camera.aspect = W() / H()
  camera.updateProjectionMatrix()
  renderer.setSize(W(), H())
  updateCycleAnchor()
})
updateCycleAnchor()

/* ── SOUND TOGGLE ── */
let sndOn = false
const soundDot = document.getElementById('sound-dot')
document.getElementById('sound-btn').addEventListener('click', () => {
  sndOn = !sndOn
  document.getElementById('sound-lbl').textContent = sndOn ? 'Sound · On' : 'Sound · Off'
  soundDot.classList.toggle('on', sndOn)
})

/* ── LOADING ── */
const ldFill = document.getElementById('ld-fill')
const ldTitle = document.querySelector('.ld-title')
const ldSub = document.querySelector('.ld-sub')
setTimeout(() => { ldTitle.classList.add('in') }, 100)
setTimeout(() => { ldSub.classList.add('in') }, 350)
let prog = 0
const ldInt = setInterval(() => {
  prog = Math.min(prog + Math.random() * 3.5 + 1.2, 100)
  ldFill.style.width = prog + '%'
  if (prog >= 100) {
    clearInterval(ldInt)
    setTimeout(() => {
      document.getElementById('loading').classList.add('out')
      activateSec(0)
    }, 600)
  }
}, 45)

activateSec(0)
