import React from "react";

type Props = React.SVGProps<SVGSVGElement> & { className?: string };

function IconBase(props: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props} />
  );
}

export function IconMenu(props: Props) {
  return (
    <IconBase {...props}>
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </IconBase>
  );
}

export function IconDashboard(props: Props) {
  return (
    <IconBase {...props}>
      <path d="M12 3a9 9 0 1 0 9 9" />
      <path d="M12 12l4-2" />
      <path d="M12 7v5" />
    </IconBase>
  );
}

export function IconUser(props: Props) {
  return (
    <IconBase {...props}>
      <path d="M20 21a8 8 0 0 0-16 0" />
      <path d="M12 13a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" />
    </IconBase>
  );
}

export function IconDoc(props: Props) {
  return (
    <IconBase {...props}>
      <path d="M7 3h7l3 3v15H7Z" />
      <path d="M14 3v4h4" />
      <path d="M9 12h6" />
      <path d="M9 16h6" />
    </IconBase>
  );
}

export function IconSettings(props: Props) {
  return (
    <IconBase {...props}>
      <path d="M12 15.5a3.5 3.5 0 1 0-3.5-3.5 3.5 3.5 0 0 0 3.5 3.5Z" />
      <path d="M19.4 15a2 2 0 0 0 .4 2.2l.1.1-1.7 1.7-.1-.1a2 2 0 0 0-2.2-.4 2 2 0 0 0-1.2 1.8V21h-2.4v-.2a2 2 0 0 0-1.2-1.8 2 2 0 0 0-2.2.4l-.1.1-1.7-1.7.1-.1a2 2 0 0 0 .4-2.2 2 2 0 0 0-1.8-1.2H3v-2.4h.2a2 2 0 0 0 1.8-1.2 2 2 0 0 0-.4-2.2l-.1-.1L6.2 3.8l.1.1a2 2 0 0 0 2.2.4A2 2 0 0 0 9.7 2.5V2h2.4v.5a2 2 0 0 0 1.2 1.8 2 2 0 0 0 2.2-.4l.1-.1 1.7 1.7-.1.1a2 2 0 0 0-.4 2.2 2 2 0 0 0 1.8 1.2H21v2.4h-.5a2 2 0 0 0-1.1 1.2Z" />
    </IconBase>
  );
}

export function IconProfile(props: Props) {
  return (
    <IconBase {...props}>
      <path d="M12 12a4.5 4.5 0 1 0-4.5-4.5A4.5 4.5 0 0 0 12 12Z" />
      <path d="M3.5 21a8.5 8.5 0 0 1 17 0" />
    </IconBase>
  );
}

export function IconGlobe(props: Props) {
  return (
    <IconBase {...props}>
      <path d="M12 21a9 9 0 1 0-9-9 9 9 0 0 0 9 9Z" />
      <path d="M3 12h18" />
      <path d="M12 3a15 15 0 0 1 0 18" />
      <path d="M12 3a15 15 0 0 0 0 18" />
    </IconBase>
  );
}

export function IconSms(props: Props) {
  return (
    <IconBase {...props}>
      <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z" />
      <path d="M7.5 9h9" />
      <path d="M7.5 12h7" />
    </IconBase>
  );
}

export function IconLogout(props: Props) {
  return (
    <IconBase {...props}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </IconBase>
  );
}

export function IconBell(props: Props) {
  return (
    <IconBase {...props}>
      <path d="M18 8a6 6 0 1 0-12 0c0 7-3 7-3 7h18s-3 0-3-7" />
      <path d="M13.7 21a2 2 0 0 1-3.4 0" />
    </IconBase>
  );
}

export function IconEye(props: Props) {
  return (
    <IconBase {...props}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
      <path d="M12 15a3 3 0 1 0-3-3 3 3 0 0 0 3 3Z" />
    </IconBase>
  );
}

export function IconEdit(props: Props) {
  return (
    <IconBase {...props}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
    </IconBase>
  );
}

export function IconTrash(props: Props) {
  return (
    <IconBase {...props}>
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 16H6L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </IconBase>
  );
}

export function IconPlus(props: Props) {
  return (
    <IconBase {...props}>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </IconBase>
  );
}

export function IconList(props: Props) {
  return (
    <IconBase {...props}>
      <path d="M8 6h13" />
      <path d="M8 12h13" />
      <path d="M8 18h13" />
      <path d="M3 6h.01" />
      <path d="M3 12h.01" />
      <path d="M3 18h.01" />
    </IconBase>
  );
}

