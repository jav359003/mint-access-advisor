import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

function IconBase({ children, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      {children}
    </svg>
  )
}

export function LeafMark(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M19.2 4.7C12.8 4 7.1 6.5 5.2 11.2c-1.7 4.1.4 7.3 4.4 7.3 5.8 0 9.7-5.5 9.6-13.8Z" />
      <path d="M4.4 20c2.9-5.7 6.4-9 11.7-11.3" />
    </IconBase>
  )
}

export function GridIcon(props: IconProps) {
  return <IconBase {...props}><rect x="4" y="4" width="6" height="6" /><rect x="14" y="4" width="6" height="6" /><rect x="4" y="14" width="6" height="6" /><rect x="14" y="14" width="6" height="6" /></IconBase>
}

export function ShieldIcon(props: IconProps) {
  return <IconBase {...props}><path d="M12 3 19 6v5c0 4.6-2.7 8-7 10-4.3-2-7-5.4-7-10V6l7-3Z" /><path d="m9 12 2 2 4-5" /></IconBase>
}

export function SlidersIcon(props: IconProps) {
  return <IconBase {...props}><path d="M4 7h10M18 7h2M4 17h2M10 17h10" /><circle cx="16" cy="7" r="2" /><circle cx="8" cy="17" r="2" /></IconBase>
}

export function EvidenceIcon(props: IconProps) {
  return <IconBase {...props}><path d="M6 3h9l3 3v15H6z" /><path d="M14 3v4h4M9 11h6M9 15h6" /></IconBase>
}

export function ChevronIcon(props: IconProps) {
  return <IconBase {...props}><path d="m9 6 6 6-6 6" /></IconBase>
}

export function CheckIcon(props: IconProps) {
  return <IconBase {...props}><path d="m5 12 4 4L19 6" /></IconBase>
}

export function DownloadIcon(props: IconProps) {
  return <IconBase {...props}><path d="M12 3v12m0 0 4-4m-4 4-4-4M5 20h14" /></IconBase>
}

export function MenuIcon(props: IconProps) {
  return <IconBase {...props}><path d="M4 7h16M4 12h16M4 17h16" /></IconBase>
}

export function CloseIcon(props: IconProps) {
  return <IconBase {...props}><path d="m6 6 12 12M18 6 6 18" /></IconBase>
}
