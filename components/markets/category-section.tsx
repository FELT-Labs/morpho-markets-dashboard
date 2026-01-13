import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface CategorySectionProps {
  title: string
  description?: string
  icon?: LucideIcon
  children: React.ReactNode
  className?: string
  headerClassName?: string
  accent?: 'blue' | 'green' | 'orange' | 'purple' | 'red' | 'yellow'
}

export function CategorySection({ 
  title, 
  description, 
  icon: Icon,
  children, 
  className,
  headerClassName,
  accent
}: CategorySectionProps) {
  const accentColors = {
    blue: 'border-l-blue-500',
    green: 'border-l-green-500',
    orange: 'border-l-orange-500',
    purple: 'border-l-purple-500',
    red: 'border-l-red-500',
    yellow: 'border-l-yellow-500'
  }
  
  return (
    <Card className={cn(accent && `border-l-4 ${accentColors[accent]}`, className)}>
      <CardHeader className={headerClassName}>
        <CardTitle className="flex items-center gap-2">
          {Icon && <Icon className="h-5 w-5" />}
          {title}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  )
}
