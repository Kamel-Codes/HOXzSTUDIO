import { useRef, useEffect } from "react"
import anime from "animejs"
import './MainButton.css'

export default function MainButton({ btnName, ariaLabel, children, doFun }: { btnName: string, ariaLabel: string, children: React.ReactNode, doFun: () => void }) {
  const btn = useRef<HTMLButtonElement>(null)

  useEffect(() => {

    const button = btn.current
    if (!button) return

    const bouncing = anime({
      targets: '.letter',
      translateY: [-33, 0],
      duration: 800,
      easing: 'easeOutSine',
      delay: anime.stagger(90),
      loop: true
    })

    const mouseEnter = button.addEventListener('mouseenter', () => {
      bouncing.pause()
      const btnAnime = anime({
        targets: '.letter',
        translateY: -33,
        duration: 200,
        easing: 'easeInOutSine',
        delay: anime.stagger(60)
      })
    })
    const mouseLeave = button.addEventListener('mouseleave', () => {

      const btnAnime = anime({
        targets: '.letter',
        translateY: [-33, 0],
        duration: 200,
        easing: 'easeOutSine',
        delay: anime.stagger(60)
      })
      bouncing.restart()
    })




    return () => {


    }
  }, [])

  return (<button
    ref={btn}
    type="button"
    onClick={doFun}
    aria-label={ariaLabel}
    className="letters group flex items-center gap-2 px-6 py-3 rounded-full font-bold text-[18px] shadow-lg transition-all active:scale-[0.98] hover:brightness-110"
    style={{
      background: 'rgb(59, 246, 193)',
      color: 'white',
      border: '1px solid rgba(59, 246, 209, 0.5)',
      boxShadow: '0 8px 24px rgba(59, 246, 162, 0.35)',
      height: 'fit-content',
      overflow: 'hidden',
      cursor: 'pointer'
    }}
  >
    {children}
    <p >
      {btnName.split('').map((char, i) => <span className="letter inline-block" key={i}>{char}</span>)}
    </p>
  </button >)
}