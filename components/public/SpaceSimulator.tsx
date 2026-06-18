'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Planet } from '@/lib/types'
import type * as THREE_TYPES from 'three'

function seededRng(id: string, salt: number): number {
  let h = salt * 2654435761
  for (let i = 0; i < id.length; i++) h = Math.imul(h ^ id.charCodeAt(i), 2246822507)
  h = Math.imul(h ^ (h >>> 16), 3266489909)
  return ((h ^ (h >>> 16)) >>> 0) / 0xffffffff
}

function fibPos(index: number, total: number, radius: number) {
  const golden = Math.PI * (3 - Math.sqrt(5))
  const theta = golden * index
  const phi = Math.acos(1 - 2 * (index + 0.5) / Math.max(total, 1))
  return {
    x: radius * Math.sin(phi) * Math.cos(theta),
    y: radius * Math.cos(phi) * 0.6,
    z: radius * Math.sin(phi) * Math.sin(theta),
  }
}

const PALETTES = [
  { color: 0x2a60e0, emissive: 0x000820, atmo: 0x4488ff },
  { color: 0xc03010, emissive: 0x1a0400, atmo: 0xff6633 },
  { color: 0xc09020, emissive: 0x181000, atmo: 0xffcc44 },
  { color: 0x20b0a0, emissive: 0x001412, atmo: 0x44ddcc },
  { color: 0x8040d0, emissive: 0x0e0020, atmo: 0xaa66ff },
  { color: 0x208040, emissive: 0x001008, atmo: 0x44cc66 },
  { color: 0xd0c860, emissive: 0x181400, atmo: 0xffee88 },
  { color: 0xb04060, emissive: 0x140008, atmo: 0xff66aa },
  { color: 0x4090c0, emissive: 0x000e18, atmo: 0x66bbff },
  { color: 0xa06020, emissive: 0x120800, atmo: 0xdd8833 },
  { color: 0x60a030, emissive: 0x080e00, atmo: 0x88dd44 },
  { color: 0x906090, emissive: 0x100010, atmo: 0xcc88cc },
]

interface Tooltip { name: string; subtitle: string; x: number; y: number }
interface Props { planets: Planet[] }

export default function SpaceSimulator({ planets }: Props) {
  const mountRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const [tooltip, setTooltip] = useState<Tooltip | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount || planets.length === 0) return

    let animId: number
    let cleanupFn: (() => void) | undefined

    const init = async () => {
      const THREE = await import('three')
      // @ts-ignore
      const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js')

      const W = mount.clientWidth
      const H = mount.clientHeight

      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 3000)
      camera.position.set(0, 15, 120)

      const renderer = new THREE.WebGLRenderer({ antialias: true })
      renderer.setSize(W, H)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.setClearColor(0x010108)
      // sRGB output — 텍스처 색상을 정확하게
      renderer.outputColorSpace = THREE.SRGBColorSpace
      mount.appendChild(renderer.domElement)

      const controls = new OrbitControls(camera, renderer.domElement)
      controls.enableDamping = true
      controls.dampingFactor = 0.04
      controls.minDistance = 5
      controls.maxDistance = 500
      controls.autoRotate = true
      controls.autoRotateSpeed = 0.10
      controls.enablePan = false

      // 조명
      scene.add(new THREE.AmbientLight(0x111122, 5))
      const dirLight = new THREE.DirectionalLight(0xfff5e8, 4)
      dirLight.position.set(120, 60, 80)
      scene.add(dirLight)
      const fillLight = new THREE.DirectionalLight(0x112244, 0.6)
      fillLight.position.set(-80, -40, -60)
      scene.add(fillLight)

      // 별
      const starCount = 14000
      const starPos = new Float32Array(starCount * 3)
      for (let i = 0; i < starCount; i++) {
        const r = 400 + Math.random() * 1400
        const theta = Math.random() * Math.PI * 2
        const phi = Math.acos(2 * Math.random() - 1)
        starPos[i * 3]     = r * Math.sin(phi) * Math.cos(theta)
        starPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
        starPos[i * 3 + 2] = r * Math.cos(phi)
      }
      const starGeo = new THREE.BufferGeometry()
      starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3))
      scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({
        color: 0xffffff, size: 0.5, sizeAttenuation: true, transparent: true, opacity: 0.85,
      })))

      // 텍스처 로더
      const texLoader = new THREE.TextureLoader()

      function loadTex(url: string): Promise<import('three').Texture | null> {
        return new Promise((resolve) => {
          // 프록시로 CORS 우회: Next.js API 통해 로드
          texLoader.load(
            url,
            (tex) => {
              tex.colorSpace = THREE.SRGBColorSpace  // 색상 정확도 핵심
              tex.wrapS = THREE.RepeatWrapping
              tex.wrapT = THREE.ClampToEdgeWrapping
              tex.needsUpdate = true
              resolve(tex)
            },
            undefined,
            () => {
              console.warn('[SpaceSimulator] 텍스처 로드 실패:', url)
              resolve(null)
            }
          )
        })
      }

      type Entry = {
        mesh: THREE_TYPES.Mesh
        rings: THREE_TYPES.Mesh[]        // scene 직속 링 (행성 회전과 독립)
        baseY: number
        bobPhase: number
        rotSpeed: number
        id: string
        name: string
        subtitle: string
      }
      const entries: Entry[] = []
      const clickTargets: THREE_TYPES.Mesh[] = []

      for (let i = 0; i < planets.length; i++) {
        const planet = planets[i]
        const pal = PALETTES[i % PALETTES.length]

        const s0 = seededRng(planet.id, 0)
        const s1 = seededRng(planet.id, 1)
        const s2 = seededRng(planet.id, 2)
        const s3 = seededRng(planet.id, 3)
        const s4 = seededRng(planet.id, 4)

        const size = 5 + s0 * 8
        const basePos = fibPos(i, planets.length, 42 + s1 * 30)
        const pos = {
          x: basePos.x + (s2 - 0.5) * 14,
          y: basePos.y + (s3 - 0.5) * 8,
          z: basePos.z + (s0 - 0.5) * 14,
        }

        // 텍스처 로드 — 프록시 경유로 CORS 완전 우회
        let texture: THREE_TYPES.Texture | null = null
        if (planet.texture_url) {
          const proxyUrl = `/api/texture-proxy?url=${encodeURIComponent(planet.texture_url)}`
          texture = await loadTex(proxyUrl)
        }

        const mat = new THREE.MeshStandardMaterial(
          texture
            ? { map: texture, roughness: 0.85, metalness: 0.05 }
            : { color: pal.color, emissive: pal.emissive, emissiveIntensity: 0.12, roughness: 0.72, metalness: 0.06 }
        )

        const mesh = new THREE.Mesh(new THREE.SphereGeometry(size, 64, 64), mat)
        mesh.position.set(pos.x, pos.y, pos.z)
        mesh.userData = { id: planet.id, name: planet.name, subtitle: planet.subtitle ?? '' }
        scene.add(mesh)
        clickTargets.push(mesh)

        // 대기 글로우
        mesh.add(new THREE.Mesh(
          new THREE.SphereGeometry(size * 1.11, 32, 32),
          new THREE.MeshBasicMaterial({
            color: texture ? 0x88aacc : pal.atmo,
            transparent: true,
            opacity: texture ? 0.04 : 0.07,
            side: THREE.BackSide,
          })
        ))

        // ── 링: scene 직속으로 추가, 행성 회전과 완전 독립 ──
        const planetRings: THREE_TYPES.Mesh[] = []
        if (s4 > 0.55) {
          // RingGeometry = 납작한 띠 (토러스 아님)
          const inner = size * (1.6 + s0 * 0.4)
          const outer = inner * (1.3 + s1 * 0.35)

          const ringGeo = new THREE.RingGeometry(inner, outer, 128)
          const ringMat = new THREE.MeshBasicMaterial({
            color: texture ? 0xbbbbaa : pal.atmo,
            transparent: true,
            opacity: 0.45 + s2 * 0.2,
            side: THREE.DoubleSide,
          })
          const ring = new THREE.Mesh(ringGeo, ringMat)

          // 살짝 기울어진 띠
          ring.rotation.x = Math.PI / 2 + (s3 - 0.5) * 0.5
          ring.rotation.z = (s2 - 0.5) * 0.3
          ring.position.set(pos.x, pos.y, pos.z)
          scene.add(ring)
          planetRings.push(ring)
        }

        entries.push({
          mesh,
          rings: planetRings,
          baseY: pos.y,
          bobPhase: s0 * Math.PI * 2,
          rotSpeed: 0.04 + s1 * 0.10,
          id: planet.id,
          name: planet.name,
          subtitle: planet.subtitle ?? '',
        })
      }

      // 인터랙션
      const raycaster = new THREE.Raycaster()
      const mouse = new THREE.Vector2()
      let hoveredId: string | null = null
      let idleTimer: ReturnType<typeof setTimeout> | null = null

      function onMouseMove(e: MouseEvent) {
        const rect = mount!.getBoundingClientRect()
        mouse.x =  ((e.clientX - rect.left) / rect.width)  * 2 - 1
        mouse.y = -((e.clientY - rect.top)  / rect.height) * 2 + 1
        raycaster.setFromCamera(mouse, camera)
        const hits = raycaster.intersectObjects(clickTargets)
        if (hits.length > 0) {
          const ud = hits[0].object.userData as { id: string; name: string; subtitle: string }
          if (ud.id !== hoveredId) {
            hoveredId = ud.id
            renderer.domElement.style.cursor = 'pointer'
            controls.autoRotate = false
            if (idleTimer) clearTimeout(idleTimer)
          }
          setTooltip({ name: ud.name, subtitle: ud.subtitle, x: e.clientX, y: e.clientY })
        } else if (hoveredId !== null) {
          hoveredId = null
          renderer.domElement.style.cursor = 'grab'
          setTooltip(null)
          idleTimer = setTimeout(() => { controls.autoRotate = true }, 3000)
        }
      }

      function onClick(e: MouseEvent) {
        const rect = mount!.getBoundingClientRect()
        mouse.x =  ((e.clientX - rect.left) / rect.width)  * 2 - 1
        mouse.y = -((e.clientY - rect.top)  / rect.height) * 2 + 1
        raycaster.setFromCamera(mouse, camera)
        const hits = raycaster.intersectObjects(clickTargets)
        if (hits.length > 0) router.push(`/planets/${hits[0].object.userData.id}`)
      }

      function onResize() {
        const w = mount!.clientWidth, h = mount!.clientHeight
        camera.aspect = w / h
        camera.updateProjectionMatrix()
        renderer.setSize(w, h)
      }

      mount.addEventListener('mousemove', onMouseMove)
      mount.addEventListener('click', onClick)
      window.addEventListener('resize', onResize)

      setReady(true)

      const clock = new THREE.Clock()
      function animate() {
        animId = requestAnimationFrame(animate)
        const t = clock.getElapsedTime()

        for (const p of entries) {
          // 행성: Y축 자전만
          p.mesh.rotation.y += p.rotSpeed * 0.007
          // 부유 (행성 본체)
          const newY = p.baseY + Math.sin(t * 0.25 + p.bobPhase) * 2.2
          p.mesh.position.y = newY
          // 링: 위치만 동기화, 회전은 고정 (띠처럼)
          for (const ring of p.rings) {
            ring.position.y = newY
          }
        }

        controls.update()
        renderer.render(scene, camera)
      }
      animate()

      cleanupFn = () => {
        cancelAnimationFrame(animId)
        if (idleTimer) clearTimeout(idleTimer)
        mount.removeEventListener('mousemove', onMouseMove)
        mount.removeEventListener('click', onClick)
        window.removeEventListener('resize', onResize)
        renderer.dispose()
        if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement)
      }
    }

    init().catch(console.error)
    return () => cleanupFn?.()
  }, [planets, router])

  return (
    <div ref={mountRef} className="relative w-full h-full" style={{ cursor: 'grab' }}>
      <div className="absolute top-8 left-1/2 -translate-x-1/2 text-center pointer-events-none z-10 select-none">
        <p className="text-xs tracking-[0.45em] text-space-blue/50 uppercase mb-3">Planetary Archive</p>
        <h1
          className="text-5xl md:text-7xl text-white leading-tight drop-shadow-lg"
          style={{ fontFamily: '"Times New Roman", Georgia, Times, serif', fontStyle: 'italic', fontWeight: 'bold' }}
        >
          Pale Blue Dot
        </h1>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 pointer-events-none z-10 select-none">
        <p className="text-xs text-white/20 tracking-[0.2em]">drag · zoom · click to enter</p>
      </div>

      {tooltip && (
        <div className="fixed z-20 pointer-events-none" style={{ left: tooltip.x + 20, top: tooltip.y - 28 }}>
          <div className="glass-panel px-4 py-3 shadow-2xl">
            <p className="text-space-text font-semibold text-sm">{tooltip.name}</p>
            {tooltip.subtitle && <p className="text-space-muted text-xs mt-0.5">{tooltip.subtitle}</p>}
            <p className="text-space-blue text-xs mt-2">클릭하여 입장 →</p>
          </div>
        </div>
      )}

      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#010108] z-30">
          <div className="text-center space-y-3">
            <div className="flex gap-1.5 justify-center">
              {[0, 1, 2].map(i => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-space-blue animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
              ))}
            </div>
            <p className="text-xs text-space-muted tracking-[0.3em] uppercase">Rendering Universe</p>
          </div>
        </div>
      )}
    </div>
  )
}
