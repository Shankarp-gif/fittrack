import { useAuth } from '../context/AuthContext'

export function AdminPage() {
  const { user } = useAuth()

  if (user?.role !== 'ADMIN') {
    return (
      <div className="panel stack-gap">
        <h1>Admin</h1>
        <p className="error">You do not have permission to access this page.</p>
      </div>
    )
  }

  return (
    <div className="stack-gap">
      <section className="panel">
        <h1>Admin</h1>
        <p className="muted">Platform oversight for users, roles, and diagnostics.</p>
      </section>
      <section className="card-grid">
        <article className="card"><p className="muted">Users</p><h3>Managed externally</h3></article>
        <article className="card"><p className="muted">Roles</p><h3>Managed externally</h3></article>
        <article className="card"><p className="muted">Audit</p><h3>Available soon</h3></article>
      </section>
    </div>
  )
}

