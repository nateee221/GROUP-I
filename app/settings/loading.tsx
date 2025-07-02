import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import DashboardLayout from "@/components/dashboard-layout"

export default function SettingsLoading() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72 mt-2" />
        </div>

        <Skeleton className="h-px w-full" />

        <Tabs defaultValue="general" className="space-y-4">
          <TabsList>
            <TabsTrigger value="general" disabled>
              General
            </TabsTrigger>
            <TabsTrigger value="system" disabled>
              System
            </TabsTrigger>
            <TabsTrigger value="appearance" disabled>
              Appearance
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-72 mt-1" />
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-4 w-64" />
                </div>

                <div className="space-y-4">
                  <Skeleton className="h-5 w-32" />

                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-1">
                        <Skeleton className="h-5 w-36" />
                        <Skeleton className="h-4 w-64" />
                      </div>
                      <Skeleton className="h-6 w-12" />
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-32" />
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
