import { Suspense } from 'react'
import { FormClient } from './form-client'

// Server component that handles search params
export default function FormPage({ searchParams }: { searchParams?: { tab?: string; edit?: string } }) {
  return (
    <Suspense fallback={
      <div className="container mx-auto p-4 max-w-lg">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <FormClient 
        tab={searchParams?.tab || 'tabungan'}
        editId={searchParams?.edit || null}
      />
    </Suspense>
  )
}

// Disable static generation for this page to prevent prerender errors
export const dynamic = 'force-dynamic'