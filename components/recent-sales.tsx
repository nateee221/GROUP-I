import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function RecentSales() {
  return (
    <div className="space-y-8">
      <div className="flex items-center">
        <Avatar className="h-9 w-9">
          <AvatarImage src="/placeholder.svg" alt="Avatar" />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <p className="text-sm font-medium leading-none">Laptop Maintenance</p>
          <p className="text-sm text-muted-foreground">Scheduled for May 15, 2023</p>
        </div>
        <div className="ml-auto font-medium">High Priority</div>
      </div>
      <div className="flex items-center">
        <Avatar className="h-9 w-9">
          <AvatarImage src="/placeholder.svg" alt="Avatar" />
          <AvatarFallback>SD</AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <p className="text-sm font-medium leading-none">Server Maintenance</p>
          <p className="text-sm text-muted-foreground">Scheduled for May 18, 2023</p>
        </div>
        <div className="ml-auto font-medium">Medium Priority</div>
      </div>
      <div className="flex items-center">
        <Avatar className="h-9 w-9">
          <AvatarImage src="/placeholder.svg" alt="Avatar" />
          <AvatarFallback>RM</AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <p className="text-sm font-medium leading-none">Printer Maintenance</p>
          <p className="text-sm text-muted-foreground">Scheduled for May 20, 2023</p>
        </div>
        <div className="ml-auto font-medium">Low Priority</div>
      </div>
      <div className="flex items-center">
        <Avatar className="h-9 w-9">
          <AvatarImage src="/placeholder.svg" alt="Avatar" />
          <AvatarFallback>CB</AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <p className="text-sm font-medium leading-none">Monitor Calibration</p>
          <p className="text-sm text-muted-foreground">Scheduled for May 22, 2023</p>
        </div>
        <div className="ml-auto font-medium">Medium Priority</div>
      </div>
      <div className="flex items-center">
        <Avatar className="h-9 w-9">
          <AvatarImage src="/placeholder.svg" alt="Avatar" />
          <AvatarFallback>KL</AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <p className="text-sm font-medium leading-none">Network Maintenance</p>
          <p className="text-sm text-muted-foreground">Scheduled for May 25, 2023</p>
        </div>
        <div className="ml-auto font-medium">High Priority</div>
      </div>
    </div>
  )
}
