//Credit to https://github.com/drcmda for this effect
import ReactDOM from 'react-dom'
import {Math as ThreeMath, OctahedronBufferGeometry, MeshBasicMaterial, Color} from 'three/src/Three'
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
// A THREE.js React renderer, see: https://github.com/drcmda/react-three-fiber
import { apply as applyThree, Canvas, useRender, useThree } from 'react-three-fiber'
// A React animation lib, see: https://github.com/react-spring/react-spring
import { apply as applySpring, useSpring, a, interpolate } from 'react-spring/three'
import '../../landingStyles.css';
import Fab from "@material-ui/core/Fab";

// Import and register postprocessing classes as three-native-elements for both react-three-fiber & react-spring
// They'll be available as native elements <effectComposer /> from then on ...
import { EffectComposer } from '../../utils/postprocessing/EffectComposer'
import { RenderPass } from '../../utils/postprocessing/RenderPass'
import { GlitchPass } from '../../utils/postprocessing/GlitchPass'
applySpring({ EffectComposer, RenderPass, GlitchPass })
applyThree({ EffectComposer, RenderPass, GlitchPass })

/** This renders text via canvas and projects it as a sprite */
function Text({ children, position, opacity, color = 'white', fontSize = 200 }) {
  const {
    size: { width, height },
    viewport: { width: viewportWidth, height: viewportHeight }
  } = useThree()
  const scale = viewportWidth > viewportHeight ? viewportWidth : viewportHeight
  const canvas = useMemo(
    () => {
      const canvas = document.createElement('canvas')
      canvas.width = canvas.height = 2048
      const context = canvas.getContext('2d')
      context.font = `bold ${fontSize}px monospace, -apple-system, BlinkMacSystemFont, avenir next, avenir, helvetica neue, helvetica, ubuntu, roboto, noto, segoe ui, arial, sans-serif`
      context.textAlign = 'center'
      context.textBaseline = 'middle'
      context.fillStyle = color
      context.fillText(children, 1024, 1024 - 410 / 2)
      return canvas
    },
    [children, width, height]
  )
  return (
    <a.sprite scale={[scale, scale, 1]} position={position}>
      <a.spriteMaterial attach="material" transparent opacity={opacity}>
        <canvasTexture attach="map" image={canvas} premultiplyAlpha onUpdate={s => (s.needsUpdate = true)} />
      </a.spriteMaterial>
    </a.sprite>
  )
}

function Icon({ children, position, opacity, color = '#000000', fontSize = 800 }) {
    const {
      size: { width, height },
      viewport: { width: viewportWidth, height: viewportHeight }
    } = useThree()
    const scale = viewportWidth > viewportHeight ? viewportWidth : viewportHeight
    const canvas = useMemo(
      () => {
        const canvas = document.createElement('canvas')
        canvas.width = canvas.height = 2048
        const context = canvas.getContext('2d')
        context.font = `${fontSize}px  monospace, -apple-system, BlinkMacSystemFont, avenir next, avenir, helvetica neue, helvetica, ubuntu, roboto, noto, segoe ui, arial, sans-serif`
        context.textAlign = 'center'
        context.textBaseline = 'middle'
        context.fillStyle = color
        context.fillText(children, 1024, 1024 - 410 / 2)
        return canvas
      },
      [children, width, height]
    )
    return (
      <a.sprite scale={[scale, scale, 1]} position={position}>
        <a.spriteMaterial attach="material" transparent opacity={opacity}>
          <canvasTexture attach="map" image={canvas} premultiplyAlpha onUpdate={s => (s.needsUpdate = true)} />
        </a.spriteMaterial>
      </a.sprite>
    )
  }

/** This component creates a fullscreen colored plane */
function Background({ color }) {
  const { viewport } = useThree()
  return (
    <mesh scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry attach="geometry" args={[1, 1]} />
      <a.meshBasicMaterial attach="material" color={color} depthTest={false} />
    </mesh>
  )
}

/** This component rotates a bunch of Octahedrons */
function Octahedrons({ position }) {
  let group = useRef()
  let theta = 0
  useRender(() => {
    const r = 5 * Math.sin(ThreeMath.degToRad((theta += 0.01)))
    const s = Math.cos(ThreeMath.degToRad(theta * 2))
    group.current.rotation.set(r, r, r)
    group.current.scale.set(s, s, s)
  })
  const [geo, mat, coords] = useMemo(() => {
    const geo = new OctahedronBufferGeometry(2)
    const mat = new MeshBasicMaterial({ color: new Color('black'), transparent: true, wireframe: true })
    const coords = new Array(1000).fill().map(i => [Math.random() * 800 - 400, Math.random() * 800 - 400, Math.random() * 800 - 400])
    return [geo, mat, coords]
  }, [])
  return (
    <a.group ref={group} position={position}>
      {coords.map(([p1, p2, p3], i) => (
        <mesh key={i} geometry={geo} material={mat} position={[p1, p2, p3]} />
      ))}
    </a.group>
  )
}

/** This component creates a glitch effect */
const Effects = React.memo(({ factor }) => {
  const { gl, scene, camera, size } = useThree()
  const composer = useRef()
  useEffect(() => void composer.current.setSize(size.width, size.height), [size])
  // This takes over as the main render-loop (when 2nd arg is set to true)
  useRender(() => composer.current.render(), true)
  return (
    <effectComposer ref={composer} args={[gl]}>
      <renderPass attachArray="passes" args={[scene, camera]} />
      <a.glitchPass attachArray="passes" renderToScreen factor={factor} />
    </effectComposer>
  )
})

/** This component maintains the scene */
function Scene({ top, effectsTop }) {
  const { size } = useThree()
  const scrollMax = size.height * 4.5
  return (
    <>
      <Effects factor={effectsTop.interpolate([0, 150], [1, 0])} />
      <Background color={top.interpolate([0, scrollMax * 0.25, scrollMax * 0.8, scrollMax], ['#27282F'])} />
      <Octahedrons position={top.interpolate(top => [0, -1 + top / 20, 0])} />
      <Icon opacity={0.3} position={top.interpolate(top => [0, -1 + top / 200, 0])}>
        ⎊
      </Icon>
      <Text opacity={0.8} position={top.interpolate(top => [0, -1 + top / 200, 0])}>
        {"society0x"}
      </Text>
    </>
  )
}

/** Main component */
const LandingPage = () => {
  // This tiny spring right here controlls all(!) the animations, one for scroll, the other for mouse movement ...
  const [{ top, mouse }] = useSpring(() => ({ top: 0, mouse: [0, 0] }))
  const [{ top: effectsTop }] = useSpring(() => ({ top: 95 }))
  return (
    <>
      <Canvas className="canvas">
        <Scene top={top} effectsTop={effectsTop} mouse={mouse} />
      </Canvas>
      <div style={{position: 'absolute', top: '65%', left: '50%', transform: 'translateY(-50%)translateX(-50%)'}}>
          <a href="https://discord.gg/UAJMkPV" style={{textDecoration: 'none'}} target="_blank" rel="noreferrer noopener">
            <Fab style={{opacity: '0.85'}} color="default" size="medium" variant="extended">
                Join Discussion
            </Fab>
            </a>
        </div>
    </>
  )
}

export default LandingPage;