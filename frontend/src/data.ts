import type { Column } from './types'

export const initialColumns: Column[] = [
  {
    id: 'backlog',
    title: 'Backlog',
    cards: [
      { id: 'c1', title: 'User authentication', details: 'Implement login, signup, and JWT token management.' },
      { id: 'c2', title: 'Database schema design', details: 'Design tables for users, projects, and tasks.' },
      { id: 'c3', title: 'API rate limiting', details: 'Add rate limiting middleware to prevent abuse.' },
    ],
  },
  {
    id: 'todo',
    title: 'To Do',
    cards: [
      { id: 'c4', title: 'Dashboard layout', details: 'Create the main dashboard with sidebar navigation.' },
      { id: 'c5', title: 'Notification system', details: 'Email and in-app notifications for task updates.' },
      { id: 'c6', title: 'Export to CSV', details: 'Allow users to export their task lists as CSV.' },
    ],
  },
  {
    id: 'in-progress',
    title: 'In Progress',
    cards: [
      { id: 'c7', title: 'Kanban board UI', details: 'Build the interactive kanban board with drag and drop.' },
      { id: 'c8', title: 'REST API endpoints', details: 'Create CRUD endpoints for all resources.' },
    ],
  },
  {
    id: 'review',
    title: 'In Review',
    cards: [
      { id: 'c9', title: 'Mobile responsiveness', details: 'Ensure all pages work well on small screens.' },
      { id: 'c10', title: 'Unit test coverage', details: 'Achieve 80% code coverage across all modules.' },
    ],
  },
  {
    id: 'done',
    title: 'Done',
    cards: [
      { id: 'c11', title: 'Project setup', details: 'Initialize repo, CI/CD pipeline, and dev environment.' },
      { id: 'c12', title: 'Wireframes', details: 'Complete all wireframes and get stakeholder approval.' },
      { id: 'c13', title: 'Tech stack decision', details: 'Finalize frontend and backend technology choices.' },
    ],
  },
]
