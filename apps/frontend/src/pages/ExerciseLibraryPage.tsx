import { useEffect, useState } from 'react'
import { exerciseService } from '../services/exerciseService'
import { showCenteredSuccessModal } from '../components/common/CenteredSuccessModal'
import type { Exercise } from '../types/exercise'

export function ExerciseLibraryPage() {
  const [q, setQ] = useState('')
  const [items, setItems] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchExercises()
  }, [q])

  const fetchExercises = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await exerciseService.list({ q, size: 12 })
      setItems(res?.content || [])
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load exercises'
      setError(errorMsg)
      console.error('Error loading exercises:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToWorkout = async (exercise: Exercise) => {
    try {
      await exerciseService.addToWorkout(exercise.id)
      showCenteredSuccessModal({
        isOpen: true,
        title: 'Added to Workout!',
        message: `${exercise.name} has been added to your workout`,
        type: 'success',
        duration: 4000,
      })
    } catch (err) {
      showCenteredSuccessModal({
        isOpen: true,
        title: 'Error',
        message: 'Failed to add exercise to workout',
        type: 'error',
        duration: 4000,
      })
    }
  }

  const handleViewDetails = (exercise: Exercise) => {
    showCenteredSuccessModal({
      isOpen: true,
      title: exercise.name,
      message: `${exercise.muscleGroup} • ${exercise.equipment} • ${exercise.difficulty}\n${exercise.recommendedSets} sets x ${exercise.recommendedReps} reps`,
      type: 'info',
      duration: 5000,
    })
  }

  return (
    <div className="stack-gap">
      <section className="panel">
        <h1>Exercise Library</h1>
        <input
          className="search-input"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search exercises, muscle groups, equipment"
          disabled={loading}
        />
      </section>

      {error && (
        <section className="panel error">
          {error}
        </section>
      )}

      {loading && (
        <section className="panel">
          Loading exercises...
        </section>
      )}

      {!loading && items.length === 0 && !error && (
        <section className="panel">
          No exercises found. Try a different search.
        </section>
      )}

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
            <div className="card-actions" style={{ marginTop: '1rem', gap: '0.5rem' }}>
              <button 
                className="ghost-btn"
                onClick={() => handleViewDetails(item)}
                style={{ flex: 1, padding: '0.5rem' }}
              >
                View
              </button>
              <button 
                className="primary-btn"
                onClick={() => handleAddToWorkout(item)}
                style={{ flex: 1, padding: '0.5rem' }}
              >
                Add
              </button>
            </div>
          </article>
        ))}
      </section>
    </div>
  )
}

