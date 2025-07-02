"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, QrCode, Download, FileText } from "lucide-react"
import { useAssets } from "@/components/asset-provider"
import { toast } from "@/components/ui/use-toast"
import QRCode from "qrcode"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function AssetDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { getAssetById } = useAssets()
  const [asset, setAsset] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [isQRCodeOpen, setIsQRCodeOpen] = useState(false)
  const [qrCodeData, setQRCodeData] = useState("")

  useEffect(() => {
    if (params.id) {
      const foundAsset = getAssetById(params.id as string)
      if (foundAsset) {
        setAsset(foundAsset)
        toast({
          title: "Asset Found",
          description: `Viewing details for ${foundAsset.name}`,
        })
      } else {
        toast({
          title: "Asset Not Found",
          description: "The requested asset could not be found.",
          variant: "destructive",
        })
      }
      setLoading(false)
    }
  }, [params.id, getAssetById])

  const handleGenerateQRCode = async () => {
    if (!asset) return

    try {
      // Create a direct URL instead of JSON object
      const assetUrl = `${window.location.origin}/assets/${asset.id}`

      const qrCodeDataURL = await QRCode.toDataURL(assetUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      })

      setQRCodeData(qrCodeDataURL)
      setIsQRCodeOpen(true)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate QR code",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading asset details...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!asset) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <h1 className="text-2xl font-bold">Asset Not Found</h1>
          <p className="text-muted-foreground">The requested asset could not be found.</p>
          <Button onClick={() => router.push("/assets")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Assets
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={() => router.push("/assets")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Assets
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{asset.name}</h1>
              <p className="text-muted-foreground">Asset ID: {asset.id}</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleGenerateQRCode}>
              <QrCode className="mr-2 h-4 w-4" />
              QR Code
            </Button>
            <Button onClick={() => router.push(`/assets?edit=${asset.id}`)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Asset
            </Button>
          </div>
        </div>

        {/* Asset Overview Card */}
        <Card className="border-gray-300 dark:border-border/50">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{asset.name}</CardTitle>
                <CardDescription>Detailed asset information and history</CardDescription>
              </div>
              <Badge
                variant={
                  asset.status === "In Use"
                    ? "default"
                    : asset.status === "In Maintenance"
                      ? "outline"
                      : asset.status === "Pending Disposal"
                        ? "destructive"
                        : "secondary"
                }
              >
                {asset.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-6 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Basic Information</h3>
                      <div className="mt-2 space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Asset ID:</span>
                          <span className="text-sm font-medium">{asset.id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Serial Number:</span>
                          <span className="text-sm font-medium">{asset.serialNumber || "N/A"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Category:</span>
                          <span className="text-sm font-medium">{asset.category}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Status:</span>
                          <Badge
                            variant={
                              asset.status === "In Use"
                                ? "default"
                                : asset.status === "In Maintenance"
                                  ? "outline"
                                  : asset.status === "Pending Disposal"
                                    ? "destructive"
                                    : "secondary"
                            }
                          >
                            {asset.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Assignment Information</h3>
                      <div className="mt-2 space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Department:</span>
                          <span className="text-sm font-medium">{asset.department || "Unassigned"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Assigned To:</span>
                          <span className="text-sm font-medium">{asset.assignedTo || "Unassigned"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Location:</span>
                          <span className="text-sm font-medium">{asset.location || "N/A"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {asset.notes && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Notes</h3>
                    <p className="mt-2 text-sm bg-gray-50 dark:bg-gray-900/50 p-3 rounded-md">{asset.notes}</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="history" className="space-y-4 pt-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Asset History</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 border rounded-md">
                      <div>
                        <p className="font-medium">Asset Created</p>
                        <p className="text-sm text-muted-foreground">Initial registration in the system</p>
                      </div>
                      <p className="text-sm">
                        {asset.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString() : "N/A"}
                      </p>
                    </div>
                    {asset.assignedTo && (
                      <div className="flex justify-between items-center p-3 border rounded-md">
                        <div>
                          <p className="font-medium">Assigned to {asset.assignedTo}</p>
                          <p className="text-sm text-muted-foreground">Asset assignment</p>
                        </div>
                        <p className="text-sm">
                          {asset.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString() : "N/A"}
                        </p>
                      </div>
                    )}
                    {asset.status === "In Maintenance" && (
                      <div className="flex justify-between items-center p-3 border rounded-md">
                        <div>
                          <p className="font-medium">Sent for Maintenance</p>
                          <p className="text-sm text-muted-foreground">Regular maintenance check</p>
                        </div>
                        <p className="text-sm">{new Date().toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="documents" className="space-y-4 pt-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Asset Documents</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 border rounded-md">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 mr-3 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Purchase Receipt</p>
                          <p className="text-sm text-muted-foreground">PDF, 245KB</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex justify-between items-center p-3 border rounded-md">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 mr-3 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Warranty Document</p>
                          <p className="text-sm text-muted-foreground">PDF, 189KB</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex justify-between items-center p-3 border rounded-md">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 mr-3 text-muted-foreground" />
                        <div>
                          <p className="font-medium">User Manual</p>
                          <p className="text-sm text-muted-foreground">PDF, 3.2MB</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* QR Code Dialog */}
      <Dialog open={isQRCodeOpen} onOpenChange={setIsQRCodeOpen}>
        <DialogContent className="sm:max-w-[400px] border-gray-300 dark:border-border/50">
          <DialogHeader>
            <DialogTitle>Asset QR Code</DialogTitle>
            <DialogDescription>Scan this QR code to quickly access asset information</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center space-y-4 py-4">
            {qrCodeData && (
              <div className="bg-white p-4 rounded-lg">
                <img src={qrCodeData || "/placeholder.svg"} alt="Asset QR Code" className="w-64 h-64" />
              </div>
            )}

            <div className="text-center">
              <p className="font-semibold">{asset.name}</p>
              <p className="text-sm text-muted-foreground">ID: {asset.id}</p>
              <p className="text-sm text-muted-foreground">Serial: {asset.serialNumber}</p>
            </div>
          </div>

          <DialogFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setIsQRCodeOpen(false)}>
              Close
            </Button>
            <Button
              onClick={() => {
                const link = document.createElement("a")
                link.download = `${asset.id}-qrcode.png`
                link.href = qrCodeData
                link.click()
              }}
            >
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
