// Utility for generating unique, consistent IDs
class IdGenerator {
  private static counter = 10000

  // Generate a unique 5-digit ID (same sequence for all types)
  static generateUniqueId(): string {
    return (++this.counter).toString()
  }

  // Initialize counter based on existing data to avoid conflicts
  static initializeCounter(maxId: number) {
    // Set the counter to the maximum ID found or the default
    this.counter = Math.max(maxId, 10000)
  }

  // Alternative method that takes arrays of objects with IDs
  static initializeCounterFromArrays(
    existingAssets: any[] = [],
    existingAssignments: any[] = [],
    existingTransfers: any[] = [],
    existingMaintenanceRecords: any[] = [],
  ) {
    // Find the highest existing ID across all types
    let maxId = 10000

    // Check asset IDs
    existingAssets.forEach((asset) => {
      const id = Number.parseInt(asset.id)
      if (!isNaN(id) && id > maxId) {
        maxId = id
      }
    })

    // Check assignment IDs
    existingAssignments.forEach((assignment) => {
      const id = Number.parseInt(assignment.id)
      if (!isNaN(id) && id > maxId) {
        maxId = id
      }
    })

    // Check transfer IDs
    existingTransfers.forEach((transfer) => {
      const id = Number.parseInt(transfer.id)
      if (!isNaN(id) && id > maxId) {
        maxId = id
      }
    })

    // Check maintenance record IDs
    existingMaintenanceRecords.forEach((record) => {
      const id = Number.parseInt(record.id)
      if (!isNaN(id) && id > maxId) {
        maxId = id
      }
    })

    this.counter = maxId
  }

  // Validate if an ID is a 5-digit number
  static isValidId(id: string): boolean {
    const num = Number.parseInt(id)
    return !isNaN(num) && num >= 10000 && num <= 99999
  }
}

export default IdGenerator
