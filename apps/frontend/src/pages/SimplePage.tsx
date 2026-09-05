import type { ReactNode } from 'react'

export function SimplePage({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return (
    <section className="panel">
      <h1>{title}</h1>
      <p>{description}</p>
      {action}
    </section>
  )
}

