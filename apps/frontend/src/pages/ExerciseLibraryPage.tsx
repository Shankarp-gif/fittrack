import { useEffect, useState } from 'react'
import { exerciseService } from '../services/exerciseService'
import type { Exercise } from '../types/exercise'

export function ExerciseLibraryPage() {
  const [q, setQ] = useState('')
  const [items, setItems] = useState<Exercise[]>([])

  useEffect(() => {
    exerciseService.list({ q, size: 12 }).then((res) => setItems(res.content))
  }, [q])

  return (
    <div className="stack-gap">
      <section className="panel">
        <h1>Exercise Library</h1>
        <input
          className="search-input"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search exercises, muscle groups, equipment"
        />
      </section>
      <section className="card-grid">
        {items.map((item) => (
          <article className="card" key={item.id}>
            <h3>{item.name}</h3>
            <p>
              {item.muscleGroup} • {item.equipment} • {item.difficulty}
            </p>
            <small>
              {item.recommendedSets} sets x {item.recommendedReps} reps
            </small>
          </article>
        ))}
      </section>
    </div>
  )
}

