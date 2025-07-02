"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  BarChart3,
  CalendarIcon,
  Download,
  FileDown,
  FileSpreadsheet,
  FilePieChart,
  FileText,
  PieChart,
  Printer,
  Share2,
  Plus,
  Package,
  CheckCircle,
  Wrench,
  AlertTriangle,
  Archive,
  Loader2,
} from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useAssets } from "@/components/asset-provider"
import { toast } from "@/components/ui/use-toast"
import { format } from "date-fns"
import { AssetDistributionChart } from "@/components/charts/asset-distribution-chart"
import { AssetStatusChart } from "@/components/charts/asset-status-chart"

// Report types
const reportTypes = [
  {
    id: "asset-inventory",
    name: "Asset Inventory",
    description: "Complete inventory of all assets",
    icon: FileText,
  },
  {
    id: "asset-by-department",
    name: "Assets by Department",
    description: "Distribution of assets across departments",
    icon: BarChart3,
  },
  {
    id: "asset-status",
    name: "Asset Status",
    description: "Current status of all assets",
    icon: PieChart,
  },
  {
    id: "maintenance-history",
    name: "Maintenance History",
    description: "History of all maintenance activities",
    icon: FileSpreadsheet,
  },
  {
    id: "disposal-report",
    name: "Disposal Report",
    description: "Report on disposed assets",
    icon: FilePieChart,
  },
  {
    id: "depreciation-forecast",
    name: "Depreciation Forecast",
    description: "Asset depreciation projections",
    icon: FileDown,
  },
]

// Mock recent reports
const initialRecentReports = [
  {
    id: "R001",
    name: "Monthly Asset Inventory - May 2023",
    type: "Asset Inventory",
    generatedBy: "Admin User",
    generatedDate: "2023-05-31",
    format: "pdf",
  },
  {
    id: "R002",
    name: "Quarterly Maintenance Report - Q1 2023",
    type: "Maintenance History",
    generatedBy: "Jane Doe",
    generatedDate: "2023-04-05",
    format: "excel",
  },
  {
    id: "R003",
    name: "Department Asset Distribution",
    type: "Assets by Department",
    generatedBy: "Admin User",
    generatedDate: "2023-05-15",
    format: "pdf",
  },
  {
    id: "R004",
    name: "Annual Depreciation Forecast",
    type: "Depreciation Forecast",
    generatedBy: "Mike Johnson",
    generatedDate: "2023-01-10",
    format: "excel",
  },
  {
    id: "R005",
    name: "Disposal Summary - Q2 2023",
    type: "Disposal Report",
    generatedBy: "Admin User",
    generatedDate: "2023-06-01",
    format: "pdf",
  },
]

// Define types for reports
interface ReportMetadata {
  id: string
  name: string
  type: string
  generatedBy: string
  generatedDate: string
  format: string
}

export default function ReportsPage() {
  const { user } = useAuth()
  const { assets, loading: assetsLoading } = useAssets()
  const [activeTab, setActiveTab] = useState("generate")
  const [selectedReportType, setSelectedReportType] = useState<string | null>(null)
  const [dashboardStats, setDashboardStats] = useState({
    totalAssets: 0,
    activeAssets: 0,
    storageAssets: 0,
    maintenanceDue: 0,
    disposalPending: 0,
  })
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined
    to: Date | undefined
  }>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(),
  })
  const [department, setDepartment] = useState<string>("all")
  const [reportFormat, setReportFormat] = useState<"pdf" | "excel" | "csv">("pdf")
  const [includeCharts, setIncludeCharts] = useState<boolean>(true)
  const [recentReports, setRecentReports] = useState<ReportMetadata[]>(initialRecentReports)
  const [loading, setLoading] = useState<boolean>(false)
  const [generatingReport, setGeneratingReport] = useState<boolean>(false)

  // Calculate dashboard statistics from real asset data
  useEffect(() => {
    if (assets && assets.length > 0) {
      const stats = {
        totalAssets: assets.length,
        activeAssets: assets.filter((asset) => asset.status === "In Use").length,
        storageAssets: assets.filter((asset) => asset.status === "In Storage").length,
        maintenanceDue: assets.filter((asset) => asset.status === "In Maintenance").length,
        disposalPending: assets.filter((asset) => asset.status === "Pending Disposal").length,
      }
      setDashboardStats(stats)
    }
  }, [assets])

  // Simulate fetching recent reports
  const fetchRecentReports = () => {
    setLoading(true)
    // Simulate API call with setTimeout
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }

  // Simulate generating a report
  const handleGenerateReport = () => {
    if (!selectedReportType) {
      toast({
        title: "Error",
        description: "Please select a report type",
        variant: "destructive",
      })
      return
    }

    setGeneratingReport(true)

    // Simulate API call with setTimeout
    setTimeout(() => {
      try {
        // Get report type name
        const reportType = reportTypes.find((r) => r.id === selectedReportType)
        const reportTypeName = reportType ? reportType.name : selectedReportType

        // Create a report ID and name
        const reportId = `R${Math.floor(Math.random() * 10000)
          .toString()
          .padStart(4, "0")}`
        const reportName = `${reportTypeName} - ${format(new Date(), "yyyy-MM-dd")}`

        // Create new report metadata
        const newReport: ReportMetadata = {
          id: reportId,
          name: reportName,
          type: reportTypeName,
          generatedBy: user?.name || "Current User",
          generatedDate: format(new Date(), "yyyy-MM-dd"),
          format: reportFormat,
        }

        // Add the new report to the list
        setRecentReports((prev) => [newReport, ...prev])

        toast({
          title: "Report Generated",
          description: `Your ${reportName} report has been generated successfully.`,
        })

        // Switch to the recent reports tab
        setActiveTab("recent")
      } catch (error) {
        console.error("Error generating report:", error)
        toast({
          title: "Error",
          description: `Failed to generate report: ${error.message}`,
          variant: "destructive",
        })
      } finally {
        setGeneratingReport(false)
      }
    }, 2000)
  }

  const handleDownloadReport = (reportId: string, format = "pdf") => {
    // Show loading toast
    toast({
      title: "Downloading Report",
      description: "Please wait while we prepare your report...",
    })

    // Simulate download delay
    setTimeout(() => {
      toast({
        title: "Report Downloaded",
        description: `Report ${reportId} has been downloaded successfully.`,
      })
    }, 1500)
  }

  const handleExportPDF = async () => {
    try {
      // Show loading toast
      toast({
        title: "Generating PDF",
        description: "Please wait while we generate your PDF...",
      })

      toast({
        title: "PDF Generated",
        description: "Dashboard has been exported as PDF successfully.",
      })
    } catch (error) {
      console.error("Error generating PDF:", error)
      toast({
        title: "Export Failed",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handlePrintDashboard = () => {
    window.print()
  }

  // Show loading state
  if (assetsLoading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
          </div>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Loading dashboard data...</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="generate">Generate Report</TabsTrigger>
            <TabsTrigger value="recent">Recent Reports</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled Reports</TabsTrigger>
            <TabsTrigger value="dashboard">Report Dashboard</TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="space-y-4">
            <Card className="border-gray-300 dark:border-border/50">
              <CardHeader>
                <CardTitle>Generate New Report</CardTitle>
                <CardDescription>Select a report type and customize parameters</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {reportTypes.map((reportType) => (
                      <div
                        key={reportType.id}
                        className={`rounded-lg border border-gray-300 dark:border-border/50 p-4 cursor-pointer transition-colors hover:bg-muted/50 ${
                          selectedReportType === reportType.id ? "bg-muted border-primary" : ""
                        }`}
                        onClick={() => setSelectedReportType(reportType.id)}
                      >
                        <div className="flex items-start space-x-4">
                          <div className="bg-primary/10 rounded-full p-2">
                            <reportType.icon className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-medium">{reportType.name}</h3>
                            <p className="text-sm text-muted-foreground">{reportType.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {selectedReportType && (
                    <div className="border border-gray-300 dark:border-border/50 rounded-lg p-4 space-y-4">
                      <h3 className="text-lg font-medium">Report Parameters</h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="dateRange">Date Range</Label>
                          <div className="grid grid-cols-2 gap-2">
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant={"outline"} className="w-full justify-start text-left font-normal">
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {dateRange.from ? format(dateRange.from, "PPP") : <span>Pick start date</span>}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0">
                                <Calendar
                                  mode="single"
                                  selected={dateRange.from}
                                  onSelect={(date) => setDateRange((prev) => ({ ...prev, from: date }))}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>

                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant={"outline"} className="w-full justify-start text-left font-normal">
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {dateRange.to ? format(dateRange.to, "PPP") : <span>Pick end date</span>}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0">
                                <Calendar
                                  mode="single"
                                  selected={dateRange.to}
                                  onSelect={(date) => setDateRange((prev) => ({ ...prev, to: date }))}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="department">Department (Optional)</Label>
                          <Select value={department} onValueChange={setDepartment}>
                            <SelectTrigger>
                              <SelectValue placeholder="All Departments" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Departments</SelectItem>
                              <SelectItem value="it">IT Department</SelectItem>
                              <SelectItem value="finance">Finance Department</SelectItem>
                              <SelectItem value="hr">Human Resources</SelectItem>
                              <SelectItem value="admin">Administration</SelectItem>
                              <SelectItem value="executive">Executive</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="format">Report Format</Label>
                          <Select
                            value={reportFormat}
                            onValueChange={(value: "pdf" | "excel" | "csv") => setReportFormat(value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select format" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pdf">PDF</SelectItem>
                              <SelectItem value="excel">Excel</SelectItem>
                              <SelectItem value="csv">CSV</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="includeCharts">Include Charts</Label>
                          <Select
                            value={includeCharts ? "yes" : "no"}
                            onValueChange={(value) => setIncludeCharts(value === "yes")}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select option" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="yes">Yes</SelectItem>
                              <SelectItem value="no">No</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-end space-x-2">
                <Button variant="outline">Save as Template</Button>
                <Button onClick={handleGenerateReport} disabled={!selectedReportType || generatingReport}>
                  {generatingReport ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    "Generate Report"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="recent" className="space-y-4">
            <Card className="border-gray-300 dark:border-border/50">
              <CardHeader>
                <CardTitle>Recent Reports</CardTitle>
                <CardDescription>Reports generated in the last 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                      <p className="mt-2 text-muted-foreground">Loading reports...</p>
                    </div>
                  </div>
                ) : recentReports.length > 0 ? (
                  <div className="rounded-md border border-gray-300 dark:border-border/50">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[80px]">ID</TableHead>
                          <TableHead>Report Name</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Generated By</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Format</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recentReports.map((report) => (
                          <TableRow key={report.id}>
                            <TableCell className="font-medium">{report.id}</TableCell>
                            <TableCell>{report.name}</TableCell>
                            <TableCell>{report.type}</TableCell>
                            <TableCell>{report.generatedBy}</TableCell>
                            <TableCell>{new Date(report.generatedDate).toLocaleDateString()}</TableCell>
                            <TableCell>{report.format.toUpperCase()}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDownloadReport(report.id, report.format)}
                                >
                                  <Download className="h-4 w-4" />
                                  <span className="sr-only">Download</span>
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Printer className="h-4 w-4" />
                                  <span className="sr-only">Print</span>
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Share2 className="h-4 w-4" />
                                  <span className="sr-only">Share</span>
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium">No reports found</h3>
                    <p className="text-muted-foreground mt-2">Generate a new report to see it here</p>
                    <Button className="mt-4" onClick={() => setActiveTab("generate")}>
                      Generate Report
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="scheduled" className="space-y-4">
            <Card className="border-gray-300 dark:border-border/50">
              <CardHeader>
                <CardTitle>Scheduled Reports</CardTitle>
                <CardDescription>Reports scheduled for automatic generation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border border-gray-300 dark:border-border/50">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Report Name</TableHead>
                        <TableHead>Frequency</TableHead>
                        <TableHead>Next Run</TableHead>
                        <TableHead>Recipients</TableHead>
                        <TableHead>Format</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>Monthly Asset Inventory</TableCell>
                        <TableCell>Monthly (1st day)</TableCell>
                        <TableCell>{new Date(2023, 6, 1).toLocaleDateString()}</TableCell>
                        <TableCell>admin@lgu.gov</TableCell>
                        <TableCell>PDF</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button variant="outline" size="sm">
                              Edit
                            </Button>
                            <Button variant="outline" size="sm">
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Weekly Maintenance Summary</TableCell>
                        <TableCell>Weekly (Monday)</TableCell>
                        <TableCell>{new Date(2023, 5, 12).toLocaleDateString()}</TableCell>
                        <TableCell>maintenance@lgu.gov</TableCell>
                        <TableCell>Excel</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button variant="outline" size="sm">
                              Edit
                            </Button>
                            <Button variant="outline" size="sm">
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Quarterly Depreciation Report</TableCell>
                        <TableCell>Quarterly</TableCell>
                        <TableCell>{new Date(2023, 6, 1).toLocaleDateString()}</TableCell>
                        <TableCell>finance@lgu.gov</TableCell>
                        <TableCell>Excel</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button variant="outline" size="sm">
                              Edit
                            </Button>
                            <Button variant="outline" size="sm">
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
                <div className="mt-4 flex justify-end">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Schedule New Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dashboard" className="space-y-4">
            <Card className="border-gray-300 dark:border-border/50">
              <CardHeader>
                <CardTitle>Report Dashboard</CardTitle>
                <CardDescription>Key metrics and visualizations</CardDescription>
              </CardHeader>
              <CardContent id="dashboard-content">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
                      <Package className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{dashboardStats.totalAssets.toLocaleString()}</div>
                      <p className="text-xs text-muted-foreground">Across all departments</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Active Assets</CardTitle>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{dashboardStats.activeAssets.toLocaleString()}</div>
                      <p className="text-xs text-muted-foreground">Currently in use</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">In Storage</CardTitle>
                      <Archive className="h-4 w-4 text-gray-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{dashboardStats.storageAssets.toLocaleString()}</div>
                      <p className="text-xs text-muted-foreground">Available for use</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Maintenance Due</CardTitle>
                      <Wrench className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{dashboardStats.maintenanceDue.toLocaleString()}</div>
                      <p className="text-xs text-muted-foreground">Require attention</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Disposal Pending</CardTitle>
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{dashboardStats.disposalPending.toLocaleString()}</div>
                      <p className="text-xs text-muted-foreground">Awaiting disposal</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-2 mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Asset Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <AssetDistributionChart assets={assets} />
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Asset Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <AssetStatusChart assets={assets} />
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end space-x-2">
                <Button variant="outline" onClick={handlePrintDashboard}>
                  <Printer className="mr-2 h-4 w-4" />
                  Print Dashboard
                </Button>
                <Button variant="outline" onClick={handleExportPDF}>
                  <Download className="mr-2 h-4 w-4" />
                  Export as PDF
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
