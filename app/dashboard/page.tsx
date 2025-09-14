export default function DashboardPage() {
  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 flex items-center justify-center bg-muted/20">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Welcome to Image Studio Lab</h1>
          <p className="text-xl text-muted-foreground">
            Select a mode from the sidebar to get started
          </p>
        </div>
      </div>
    </div>
  )
}