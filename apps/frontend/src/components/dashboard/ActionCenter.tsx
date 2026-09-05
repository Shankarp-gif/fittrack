import { Card } from '../common/Card'
import { Badge } from '../common/Badge'

interface ActionItem {
  id: string
  type: 'membership' | 'payment' | 'lead' | 'attendance' | 'class'
  title: string
  description: string
  timestamp: string
  urgent?: boolean
}

interface ActionCenterProps {
  items: ActionItem[]
  loading?: boolean
  onActionClick?: (item: ActionItem) => void
}

export function ActionCenter({
  items = [],
  loading = false,
  onActionClick,
}: ActionCenterProps) {
  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      membership: '🎫',
      payment: '💳',
      lead: '🎯',
      attendance: '📋',
      class: '👫',
    }
    return icons[type] || '📌'
  }

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      membership: 'info',
      payment: 'warning',
      lead: 'success',
      attendance: 'default',
      class: 'info',
    }
    return colors[type] as any
  }

  if (loading) {
    return (
      <Card title="Today's Action Center">
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-4 border-[var(--surface-2)] border-t-[var(--brand)] rounded-full animate-spin" />
        </div>
      </Card>
    )
  }

  if (items.length === 0) {
    return (
      <Card title="Today's Action Center">
        <div className="text-center py-8 text-[var(--muted)]">
          No pending actions
        </div>
      </Card>
    )
  }

  return (
    <Card title="Today's Action Center">
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => onActionClick?.(item)}
            className="flex items-start gap-3 p-3 rounded-lg bg-[var(--surface-2)] hover:bg-opacity-70 cursor-pointer transition-colors"
          >
            <span className="text-2xl flex-shrink-0">
              {getTypeIcon(item.type)}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-medium text-[var(--text)]">{item.title}</p>
                {item.urgent && (
                  <Badge label="Urgent" variant="danger" size="sm" />
                )}
              </div>
              <p className="text-xs text-[var(--muted)]">{item.description}</p>
              <p className="text-xs text-[var(--muted)] mt-1 opacity-70">
                {item.timestamp}
              </p>
            </div>
            <Badge
              label={item.type.charAt(0).toUpperCase() + item.type.slice(1)}
              variant={getTypeColor(item.type)}
              size="sm"
            />
          </div>
        ))}
      </div>
    </Card>
  )
}

