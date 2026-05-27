export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-full w-full py-20">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent" />
    </div>
  )
}